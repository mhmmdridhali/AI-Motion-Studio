import type { Locator, Page } from '@playwright/test';

import { spokenFor } from './voice.ts';

/**
 * A pointer that moves the way a hand does, and a keyboard that types at a
 * speed a person could.
 *
 * Playwright's own input is built for tests, where the only virtue is arriving
 * instantly: `mouse.move(x, y, { steps: 20 })` dispatches twenty events as
 * fast as the transport allows, which is one frame of video. Film that and the
 * pointer teleports. So every move here is a tween the *studio* paces — an
 * eased path sampled at the capture rate, each sample a real CDP mouse event,
 * each spaced by a real wait. Hover states, drag thresholds and pointer
 * capture all behave exactly as they do for a person, because as far as the
 * page is concerned this is a person.
 *
 * The easing is smootherstep rather than a cubic, which is the closest cheap
 * approximation of how a hand actually crosses a screen: no instantaneous
 * change in acceleration at either end, so the pointer neither jumps into
 * motion nor slams into its target.
 *
 * Nothing here is random. A demo that regenerates differently every run is a
 * demo whose diff nobody can read, so the one human-looking irregularity —
 * the wobble in typing speed — is a function of the character's index.
 */

const FRAME_MS = 1000 / 60;

function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type Point = { x: number; y: number };

export type Target = Locator | Point | string;

type View = { tx: number; ty: number; scale: number };

export class Actor {
  private at: Point = { x: 120, y: 120 };

  /**
   * What the camera is doing, in the same terms the page holds it.
   *
   * Kept here rather than asked for, because every coordinate in this class
   * is a screen coordinate and the app has moved underneath them. A box
   * measured while pushed in is in screen space; the thing it describes lives
   * at a fixed place in the app. Without both numbers you cannot tell those
   * apart, which is how clicks ended up landing where a target used to be.
   */
  private view: View = { tx: 0, ty: 0, scale: 1 };

  constructor(private readonly page: Page) {}

  get pointer(): Point {
    return { ...this.at };
  }

  private locate(target: Target): Locator | Point {
    if (typeof target === 'string') {
      return this.page.getByTestId(target);
    }
    return target;
  }

  /** Where a target is right now, in viewport pixels. */
  /**
   * Where the pointer should aim for, in screen pixels.
   *
   * This is also where a deferred release gets paid when it has to be. A
   * click while pushed in is normally fine — `boundingBox` reports the
   * post-transform rectangle, so the coordinate is the one the thing is
   * actually drawn at — but only while the target is still on screen. Scaled
   * up by two, most of the app is outside the viewport, and aiming at a
   * coordinate out there either misses or lands on whatever is at the edge.
   * Every pointer operation measures through here, so this is the one place
   * that has to know.
   */
  async where(target: Target, at: Point | 'center' = 'center'): Promise<Point> {
    const point = await this.measure(target, at);
    if (!this.pendingRelease || this.inShot(point)) {
      return point;
    }

    await this.release();
    return this.measure(target, at);
  }

  /** Whether a screen point is somewhere the pointer can actually reach. */
  private inShot(point: Point): boolean {
    return (
      point.x >= 0 &&
      point.x <= this.width &&
      point.y >= 0 &&
      point.y <= this.height
    );
  }

  private async measure(
    target: Target,
    at: Point | 'center' = 'center'
  ): Promise<Point> {
    const found = this.locate(target);
    if (!('boundingBox' in found)) {
      return found;
    }

    const held = this.zoomed ? { ...this.view } : null;
    if (held) {
      await this.page.evaluate(() => window.__demo?.still(0, 0, 1));
    }
    await found.first().waitFor({ state: 'visible' });
    const box = await found.first().boundingBox();
    if (held) {
      await this.page.evaluate(
        (v) => window.__demo?.still(v.tx, v.ty, v.scale),
        held
      );
    }
    if (!box) {
      throw new Error('Target has no box to aim at');
    }

    const appPt =
      at === 'center'
        ? { x: box.x + box.width / 2, y: box.y + box.height / 2 }
        : { x: box.x + at.x, y: box.y + at.y };

    return this.toScreen(appPt);
  }

  /** Where an app-space point is drawn right now. */
  private toScreen(point: Point): Point {
    return {
      x: this.view.tx + this.view.scale * point.x,
      y: this.view.ty + this.view.scale * point.y,
    };
  }

  /** Where a screen point lives in the app, independent of the camera. */
  private toApp(point: Point): Point {
    return {
      x: (point.x - this.view.tx) / this.view.scale,
      y: (point.y - this.view.ty) / this.view.scale,
    };
  }

  /**
   * Moves the pointer along an eased path.
   *
   * Duration defaults to something distance-aware: a nudge across a toolbar
   * should not take as long as a sweep across the grid, and both should look
   * unhurried. The loop paces itself against a deadline rather than sleeping
   * a fixed amount per step, so a slow CDP round trip steals from the next
   * sample instead of stretching the whole gesture.
   */
  async moveTo(point: Point, ms?: number): Promise<void> {
    const from = this.at;
    const dx = point.x - from.x;
    const dy = point.y - from.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.5) {
      return;
    }

    const span = ms ?? Math.min(820, Math.max(240, 200 + distance * 0.52));

    this.onMotion?.('start');
    try {
      await this.page.evaluate(
        (at) => window.__demo?.glide(at.x, at.y, at.span),
        { x: point.x, y: point.y, span }
      );
    } finally {
      this.onMotion?.('end');
    }
    this.at = { ...point };
    await this.page.mouse.move(point.x, point.y);
  }

  async to(target: Target, options: { ms?: number; at?: Point } = {}) {
    const point = await this.where(target, options.at ?? 'center');
    await this.moveTo(point, options.ms);
    return point;
  }

  /** Moves onto a target and waits long enough for its hover state to read. */
  async hover(target: Target, hold = 420) {
    await this.to(target);
    await this.beat(hold);
  }

  /**
   * Presses where the target is when the press happens, not where it was.
   *
   * A click used to measure a box, travel for most of a second, and then
   * press wherever the pointer had arrived. Anything that moved in between —
   * a list re-rendering, a panel settling, a push-in still easing — left the
   * press somewhere the target no longer was, and the scene carried on as
   * though it had clicked. Re-measuring on arrival and correcting is cheap and
   * removes the whole class.
   */
  async click(
    target: Target,
    options: { before?: number; after?: number; at?: Point } = {}
  ) {
    await this.to(target, { at: options.at });
    await this.beat(options.before ?? 180);

    const now = await this.where(target, options.at ?? 'center').catch(
      () => null
    );
    if (now && Math.hypot(now.x - this.at.x, now.y - this.at.y) > 3) {
      await this.moveTo(now, 220);
    }

    if (this.zoomed) {
      await this.page
        .evaluate(() => {
          const root = document.getElementById('demo-overlay');
          if (root) root.dataset.press = 'true';
        })
        .catch(() => undefined);
      await this.beat(90);
      await this.page
        .evaluate(() => {
          const root = document.getElementById('demo-overlay');
          if (root) root.dataset.press = 'false';
        })
        .catch(() => undefined);

      const found = this.locate(target);
      if ('boundingBox' in found) {
        await found
          .first()
          .evaluate((el) => {
            if (el instanceof HTMLElement) {
              el.focus();
              el.click();
            }
          })
          .catch(() => undefined);
      }
    } else {
      await this.page.mouse.down();
      await this.beat(90);
      await this.page.mouse.up();
    }
    await this.beat(options.after ?? 340);
  }

  /**
   * Presses and holds, sweeps, releases — a real drag, not an instant one.
   *
   * The first sample after `mouse.down` is deliberately a small nudge: the
   * grid arms a drag only once the pointer has travelled past a threshold, so
   * a gesture that jumps straight to its destination is read as a click on the
   * destination instead of a move.
   */
  async dragTo(
    from: Target,
    to: Target,
    options: { ms?: number; fromAt?: Point; toAt?: Point; hold?: number } = {}
  ) {
    await this.unzoomForGesture();
    const start = await this.where(from, options.fromAt ?? 'center');
    await this.moveTo(start);
    await this.beat(220);

    await this.page.mouse.down();
    await this.setDrag(true);
    await this.beat(options.hold ?? 160);

    await this.moveTo({ x: start.x + 6, y: start.y + 6 }, 90);

    const end = await this.where(to, options.toAt ?? 'center');
    await this.moveTo(end, options.ms ?? 780);
    await this.beat(220);

    await this.page.mouse.up();
    await this.setDrag(false);
    await this.beat(380);
  }

  async scroll(target: Target, deltaY: number, ms = 700) {
    await this.unzoomForGesture();
    await this.to(target);
    const steps = Math.max(2, Math.round(ms / FRAME_MS));
    let sent = 0;

    this.onMotion?.('start');
    try {
      for (let step = 1; step <= steps; step += 1) {
        const eased = smootherstep(step / steps) * deltaY;
        const chunk = eased - sent;
        sent = eased;
        await this.page.mouse.wheel(0, chunk);
        await sleep(FRAME_MS);
      }
    } finally {
      this.onMotion?.('end');
    }

    await this.beat(260);
  }

  /** Shows the combo as a key hint, presses it, then clears the hint. */
  async press(combo: string, options: { lead?: number; after?: number } = {}) {
    await this.keys(pretty(combo));
    await this.beat(options.lead ?? 440);
    await this.page.keyboard.press(combo);
    await this.beat(options.after ?? 520);
    await this.keys(null);
  }

  async type(text: string, perChar = 58) {
    for (let index = 0; index < text.length; index += 1) {
      await this.page.keyboard.type(text[index]!);
      const wobble = ((index * 37) % 11) - 5;
      await sleep(Math.max(18, perChar + wobble));
    }
  }

  /**
   * A line of narration, and the beat it needs to land.
   *
   * This used to print a subtitle. Nothing is drawn now: the line is handed to
   * whoever is keeping the timeline, which turns the same call into the
   * voice-over script. That is why it stayed a method on the actor rather than
   * becoming a separate `narrate()` — a scene's prose belongs at the moment in
   * the choreography it describes, and every scene already had it there.
   *
   * `null` is still accepted and still means "nothing to say here", so the
   * closing `say(null)` in every scene remains harmless.
   */
  async say(text: string | null, hold = 0) {
    if (!text) {
      await this.page
        .evaluate(() => {
          window.__demo?.highlight(null);
        })
        .catch(() => undefined);
      if (hold) {
        await this.beat(hold);
      }
      return;
    }

    await this.release();
    await this.page
      .evaluate(() => {
        window.__demo?.highlight(null);
      })
      .catch(() => undefined);

    this.onNarrate?.(text);

    await this.beat(spokenFor(text, hold));
  }

  /** Set by `scene.ts` to the recorder's timeline. */
  onNarrate?: (text: string) => void;
  onMotion?: (state: 'start' | 'end') => void;
  onPause?: () => Promise<void>;
  onResume?: () => Promise<void>;

  /**
   * A release asked for and not yet paid for — see `unfocus` and `release`.
   */
  private pendingRelease: { ms?: number } | null = null;

  private zoomed = false;
  /** What the pointer is currently pointing at, in app coordinates. */
  private subject: Point | null = null;
  private width = 1920;
  private height = 1080;

  /** Read once from the page, since `framed` judges against real edges. */
  async measureStage() {
    const size = await this.page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    this.width = size.width;
    this.height = size.height;
  }

  /**
   * Pushes in on the thing being talked about.
   *
   * Most applications worth filming are a wall of small type, and a viewer
   * told "the guest list shows who has answered" has no idea which forty
   * pixels of the frame that is. So the picture goes where the words are.
   *
   * Only ever called around a hold, never around a gesture. Scaling the app
   * while the pointer is moving would mean the cursor and its target are
   * moving in different spaces, and a drag would land somewhere nobody aimed:
   * `unfocus` therefore runs before anything is pressed, and `spotlight`
   * exists so a scene does not have to remember that.
   */
  /**
   * Frames a subject, and takes the pointer with it.
   *
   * Three things used to be sequential and are now one movement. The view
   * glides from wherever it is straight to the new framing, without returning
   * to 1x in between, which is what made the film feel like it was constantly
   * zooming out and back in. The pointer travels at the same time, to where
   * the subject *will* be rather than where it is, which is arithmetic rather
   * than a second measurement. And a subject already well framed is left
   * alone entirely.
   *
   * The pointer target is computed instead of measured because it has to be
   * known before the transition it is racing. Measuring mid-transition gives
   * an answer that is true for one frame.
   */
  async focus(
    target: Target,
    options: { scale?: number; ms?: number; point?: boolean } = {}
  ) {
    const scale = options.scale ?? 1.5;
    const ms = options.ms ?? 980;

    const held = this.zoomed ? { ...this.view } : null;
    if (held) {
      await this.page.evaluate(() => window.__demo?.still(0, 0, 1));
    }
    const box = await this.boxOf(target);
    if (held) {
      await this.page.evaluate(
        (v) => window.__demo?.still(v.tx, v.ty, v.scale),
        held
      );
    }
    if (!box) {
      return;
    }

    this.pendingRelease = null;

    const subject = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };

    const restApp = {
      x: box.x + Math.min(box.width * 0.12, 48),
      y: box.y + box.height / 2,
    };

    const span = scale - 1;
    const targetTx =
      scale === 1
        ? 0
        : Math.min(
            0,
            Math.max(-span * this.width, this.width / 2 - scale * subject.x)
          );
    const targetTy =
      scale === 1
        ? 0
        : Math.min(
            0,
            Math.max(
              -span * this.height,
              this.height * 0.45 - scale * subject.y
            )
          );

    const destScreen = {
      x: targetTx + scale * restApp.x,
      y: targetTy + scale * restApp.y,
    };

    this.onMotion?.('start');
    try {
      const next = await this.page.evaluate(
        (at) =>
          window.__demo?.zoom(
            at.x,
            at.y,
            at.scale,
            at.ms,
            at.toX ?? undefined,
            at.toY ?? undefined
          ),
        {
          ...subject,
          scale,
          ms,
          toX: options.point === false ? null : destScreen.x,
          toY: options.point === false ? null : destScreen.y,
        }
      );
      if (next) {
        this.view = next;
      }
      this.zoomed = scale !== 1;
      this.subject = subject;
    } finally {
      this.onMotion?.('end');
    }
    if (options.point !== false) {
      this.at = { ...destScreen };
      await this.page.mouse.move(destScreen.x, destScreen.y);
    }
  }

  /**
   * Whether a subject is already comfortably in shot.
   *
   * This is the answer to "decide whether it needs to zoom out or stay
   * there". Two beats about neighbouring things — a row and the row under it,
   * a field and the panel around it — do not need the camera to move at all,
   * and moving it anyway is the fidgeting that made the film tiring to watch.
   * The margin is deliberately generous: being roughly right and still is
   * better than being exactly right and restless.
   */
  private framed(subject: Point, scale: number): boolean {
    if (Math.abs(this.view.scale - scale) > 0.25) {
      return false;
    }

    const on = this.toScreen(subject);
    const inset = 0.2;

    return (
      on.x > this.width * inset &&
      on.x < this.width * (1 - inset) &&
      on.y > this.height * inset &&
      on.y < this.height * (1 - inset)
    );
  }

  /**
   * Says the scene is done with this subject. Does not move the camera yet.
   *
   * A beat ends, the camera pulls all the way out, and the next beat pushes
   * straight back in to within a hair of where it just was. On film that
   * reads as a camera that cannot make up its mind, and it was the single
   * most-noticed flaw in the first corpus: the zoom out is a second of
   * motion whose only purpose is to be undone.
   *
   * The scene cannot avoid it by itself, because at the moment it finishes a
   * beat it does not know where the next one looks. But the engine finds out
   * one call later, so the release is recorded here and paid for at the first
   * moment something actually needs the view wide: a still, a line about the
   * whole screen, a gesture, a pointer reaching outside the current framing,
   * or the end of the scene. If instead the next thing is another `focus`,
   * the release is cancelled and the camera glides from this framing to the
   * next one, which is one movement rather than three.
   */
  async unfocus(options: { ms?: number } = {}) {
    if (!this.zoomed) {
      return;
    }

    this.pendingRelease = options;
  }

  /**
   * Takes the camera wide for a still, without the film ever seeing it move.
   *
   * A scene that has let go of its subject and then asks for a still is
   * asking for a still of the whole app. Paying the release to get one was
   * the obvious way to do that and it put the worst kind of motion in the
   * film: a pull-out whose only cause was a screenshot, landing in the middle
   * of a sequence the camera should have held. It read as the camera zooming
   * out to let you type.
   *
   * A still is taken with the screencast stopped, though, so the framing can
   * change for the duration and change back before capture resumes. Nothing
   * is recorded in between, the scene's own state is untouched — the release
   * is still owed afterwards — and the still is framed the way the scene
   * asked. Returns the undo, which the caller must run before resuming.
   */
  async wideForStill(): Promise<() => Promise<void>> {
    if (!this.pendingRelease || !this.zoomed) {
      return async () => {};
    }

    const held = this.view;
    await this.page.evaluate(() => window.__demo?.still(0, 0, 1));

    return async () => {
      await this.page.evaluate(
        (view) => window.__demo?.still(view.tx, view.ty, view.scale),
        held
      );
    };
  }

  /**
   * Pays for a deferred release, if one is owed and still owed.
   *
   * Everything that needs the whole app on screen calls this rather than
   * `unfocus`, so that a scene which asked to come out and then changed its
   * mind never pays for the move. Cheap and idempotent when nothing is
   * pending, which is most of the time.
   */
  async release(): Promise<void> {
    const pending = this.pendingRelease;
    this.pendingRelease = null;

    if (!pending || !this.zoomed) {
      return;
    }

    await this.widen(pending.ms ?? 950);
  }

  private async widen(ms: number) {
    const keep = this.subject;
    this.subject = null;
    this.pendingRelease = null;

    this.onMotion?.('start');
    try {
      const next = await this.page.evaluate(
        (at) =>
          window.__demo?.zoom(
            0,
            0,
            1,
            at.ms,
            at.toX ?? undefined,
            at.toY ?? undefined
          ),
        {
          ms,
          toX: keep ? keep.x : null,
          toY: keep ? keep.y : null,
        }
      );
      this.view = next ?? { tx: 0, ty: 0, scale: 1 };
      this.zoomed = false;
    } finally {
      this.onMotion?.('end');
    }
    if (keep) {
      this.at = { x: keep.x, y: keep.y };
      await this.page.mouse.move(keep.x, keep.y);
    }
  }

  private async boxOf(target: Target) {
    const found = this.locate(target);
    if (!('boundingBox' in found)) {
      return { x: found.x, y: found.y, width: 0, height: 0 };
    }
    await found.first().waitFor({ state: 'visible' });
    return found.first().boundingBox();
  }

  private async unzoomForGesture() {
    this.pendingRelease = null;

    if (this.zoomed) {
      await this.widen(600);
    }
  }

  /**
   * The ordinary way a scene talks about a region: push in, say the line,
   * come back out. One call, so the coming back out cannot be forgotten.
   */
  /**
   * The ordinary beat: say a thing while the camera and the hand find it.
   *
   * The mark is taken before anything moves, so the voice starts and the view
   * and the pointer travel over its opening words. Their travel is charged
   * against the line's own hold rather than added to it, so pointing at
   * something costs nothing in pacing.
   */
  async spotlight(
    target: Target,
    text: string,
    options: {
      scale?: number;
      hold?: number;
      stay?: boolean;
      point?: boolean;
    } = {}
  ) {
    this.onNarrate?.(text);
    const began = Date.now();

    await this.focus(target, {
      scale: options.scale,
      point: options.point,
    });

    const spent = Date.now() - began;
    await this.beat(Math.max(0, spokenFor(text, options.hold ?? 0) - spent));

    if (!options.stay) {
      await this.unfocus();
    }
  }

  async keys(combo: string | null) {
    await this.page.evaluate((shown) => window.__demo?.keys(shown), combo);
  }

  private async setDrag(on: boolean) {
    await this.page.evaluate((state) => window.__demo?.drag(state), on);
  }

  async overlay(visible: boolean) {
    await this.page.evaluate((on) => window.__demo?.visible(on), visible);
  }

  async fade(toOpacity: number, ms = 360) {
    if (ms > 0) {
      this.onMotion?.('start');
    }
    try {
      await this.page
        .evaluate(
          (at) => window.__demo?.fade(at.toOpacity, at.ms),
          { toOpacity, ms }
        )
        .catch(() => undefined);
    } finally {
      if (ms > 0) {
        this.onMotion?.('end');
      }
    }
  }

  async beat(ms: number) {
    await sleep(ms);
  }

  /** Waits for the page to stop moving: every running animation, then a frame. */
  async settle(cap = 1200) {
    await this.page
      .waitForFunction(
        () =>
          document
            .getAnimations()
            .every((animation) => animation.playState !== 'running'),
        undefined,
        { timeout: cap }
      )
      .catch(() => undefined);

    await this.page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
  }
}

/** `Meta+K` is how Playwright spells it; `⌘+K` is how a viewer reads it. */
function pretty(combo: string): string {
  return combo
    .split('+')
    .map((part) => {
      const named: Record<string, string> = {
        Meta: '⌘',
        Control: '⌃',
        Alt: '⌥',
        Shift: '⇧',
        Enter: '↵',
        Escape: 'esc',
        Backspace: '⌫',
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
        Space: 'space',
        Period: '.',
        Comma: ',',
        Slash: '/',
        Backslash: '\\',
      };
      return named[part] ?? part.toUpperCase();
    })
    .join('+');
}
