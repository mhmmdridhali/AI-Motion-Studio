import type { Page } from '@playwright/test';

/**
 * The parts of a demo that are not the app: a cursor and a key hint.
 *
 * Both are page-side, because the alternative is compositing them
 * afterwards and the alternative is worse — a cursor drawn into the video by
 * ffmpeg is a cursor that can disagree with where the click landed, and a
 * demo whose pointer misses the button it presses is a demo nobody believes.
 * So this draws a pointer that is *reactive*: it listens for the real
 * `mousemove` Chrome dispatches and puts itself exactly there. There is one
 * source of truth for where the pointer is, and it is the same one the app
 * reads its hover states from.
 *
 * Injected through `addInitScript`, so it survives the SPA's own navigations
 * and any reload a scene asks for. It attaches to `documentElement` rather
 * than `body`: React hydrates into a container inside the body and diffs what
 * it finds there, and an unexpected sibling in that container is a hydration
 * warning in the console of every scene.
 */
export type OverlaySide = {
  keys(combo: string | null): void;
  caption(text: string | null): void;
  highlight(
    rect: { x: number; y: number; width: number; height: number } | null
  ): void;
  visible(on: boolean): void;
  cursorAt(x: number, y: number): void;
  glide(toX: number, toY: number, ms: number): Promise<void>;
  fade(toOpacity: number, ms: number): Promise<void>;
  drag(on: boolean): void;
  zoom(
    px: number,
    py: number,
    scale: number,
    ms: number,
    toX?: number,
    toY?: number
  ): Promise<{ tx: number; ty: number; scale: number }>;
  still(tx: number, ty: number, scale: number): void;
};

declare global {
  interface Window {
    __demo?: OverlaySide;
  }
}

function overlaySource() {
  const ROOT_ID = 'demo-overlay';

  const css = `
#${ROOT_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
  font-family: ui-sans-serif, -apple-system, "SF Pro Text", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  contain: layout style;
}
#${ROOT_ID}[data-hidden='true'] { display: none; }

/*
 * Positioned with the translate property, and never with transform.
 *
 * This is the cursor-jumping bug, and it is entirely about the order CSS
 * composites these in: T(origin) . translate . rotate . scale . transform .
 * T(-origin). A transform is applied *inside* the scale, so an element placed
 * with 'transform: translate3d(x, y, 0)' while the press rule sets
 * 'scale: 0.86' has its translation scaled too. The tip did not wobble a
 * couple of pixels, it leapt toward the top-left corner in proportion to how
 * far across the screen it was: fifty pixels near the left edge, closer to
 * three hundred near the right. Every click, and back again on release.
 *
 * The translate property composites *before* scale, so the tip lands at
 * origin + (x, y) whatever the scale is. With the origin on the tip and the
 * box shifted back by the same amount, the arrow shrinks around a point that
 * does not move and sits exactly where the click lands.
 */
#${ROOT_ID} .dc {
  position: absolute;
  top: 0;
  left: 0;
  width: 26px;
  height: 26px;
  margin: -2.2px 0 0 -5px;
  transform-origin: 5px 2.2px;
  will-change: translate, scale;
  translate: -100px -100px;
  transition: scale 120ms cubic-bezier(0.2, 0, 0.2, 1);
  scale: 1;
}
#${ROOT_ID}[data-press='true'] .dc { scale: 0.86; }
#${ROOT_ID} .dc svg { display: block; overflow: visible; }


#${ROOT_ID} .dc-hold {
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 34px;
  will-change: translate;
  margin: -17px 0 0 -17px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.22);
  border: 1.5px solid rgba(99, 102, 241, 0.7);
  opacity: 0;
  transition: opacity 140ms ease;
  will-change: opacity;
}
#${ROOT_ID}[data-drag='true'] .dc-hold { opacity: 1; }

/* The key hint, low and centred, where it overlaps nothing worth seeing. */
#${ROOT_ID} .dc-stack {
  position: absolute;
  left: 50%;
  bottom: 34px;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

#${ROOT_ID} .dc-keys {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 120ms ease, translate 160ms cubic-bezier(0.2, 0, 0.2, 1);
  translate: 0 6px;
}
#${ROOT_ID} .dc-keys[data-on='true'] { opacity: 1; translate: 0 0; }
#${ROOT_ID} .dc-keys kbd {
  min-width: 34px;
  padding: 7px 10px;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 560;
  line-height: 1;
  text-align: center;
  color: #f8fafc;
  background: rgba(15, 18, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-bottom-color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

#${ROOT_ID} .dc-caption {
  max-width: min(86vw, 960px);
  padding: 13px 26px;
  border-radius: 999px;
  font-family: "Inter", ui-sans-serif, -apple-system, "Segoe UI", system-ui, sans-serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.45;
  text-align: center;
  color: #f8fafc;
  background: linear-gradient(135deg, rgba(13, 40, 18, 0.92) 0%, rgba(15, 23, 42, 0.92) 100%);
  border: 1.5px solid rgba(74, 222, 128, 0.42);
  box-shadow: 0 18px 42px -8px rgba(0, 0, 0, 0.52), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  backdrop-filter: blur(14px);
  opacity: 0;
  translate: 0 14px;
  scale: 0.97;
  transition: opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), translate 260ms cubic-bezier(0.22, 1, 0.36, 1), scale 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
#${ROOT_ID} .dc-caption[data-on='true'] {
  opacity: 1;
  translate: 0 0;
  scale: 1;
}

#${ROOT_ID} .dc-curtain {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, #0d2818 0%, #06120b 100%);
  opacity: 0;
  pointer-events: none;
  will-change: opacity;
}
#${ROOT_ID} .dc-tick {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.01);
  pointer-events: none;
  will-change: transform;
}
`;

  const ARROW = `
<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
  <path d="M5 2.2 5 20.4 9.9 15.9 13.1 23.4 16.4 22 13.2 14.6 20 14.2Z"
        fill="#fff" stroke="rgba(0,0,0,0.55)" stroke-width="1.3"
        stroke-linejoin="round"/>
</svg>`;

  function smootherstep(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function build() {
    if (window.top !== window) {
      return;
    }
    if (document.getElementById(ROOT_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.textContent = css;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `
      <div class="dc-curtain"></div>
      <div class="dc-hold"></div>
      <div class="dc">${ARROW}</div>
      <div class="dc-stack">
        <div class="dc-keys"></div>
        <div class="dc-caption"></div>
      </div>
      <div class="dc-tick"></div>`;

    document.documentElement.append(style, root);

    const curtain = root.querySelector('.dc-curtain') as HTMLElement;
    const tickEl = root.querySelector('.dc-tick') as HTMLElement;
    const cursor = root.querySelector('.dc') as HTMLElement;
    const hold = root.querySelector('.dc-hold') as HTMLElement;
    const keys = root.querySelector('.dc-keys') as HTMLElement;
    const caption = root.querySelector('.dc-caption') as HTMLElement;

    let curX = 120;
    let curY = 120;
    let curTx = 0;
    let curTy = 0;
    let curScale = 1;
    let curFade = 0;
    let tickToggle = 0;

    function pulseTick() {
      tickToggle = (tickToggle + 1) % 2;
      tickEl.style.transform = `translate3d(${tickToggle}px, 0, 0)`;
    }

    function place(nx: number, ny: number) {
      curX = nx;
      curY = ny;
      const shift = `${nx.toFixed(2)}px ${ny.toFixed(2)}px`;
      cursor.style.translate = shift;
      hold.style.translate = shift;
    }

    addEventListener(
      'mousemove',
      (event) => place(event.clientX, event.clientY),
      { capture: true, passive: true }
    );

    addEventListener(
      'mousedown',
      () => {
        root.dataset.press = 'true';
      },
      { capture: true, passive: true }
    );

    addEventListener(
      'mouseup',
      () => {
        root.dataset.press = 'false';
      },
      { capture: true, passive: true }
    );

    addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.__demoEvent !== true) return;
      if (data.type === 'down') root.dataset.press = 'true';
      if (data.type === 'up') root.dataset.press = 'false';
      if (data.type === 'tick') pulseTick();
    });

    const api = {
      keys(combo: string | null) {
        if (!combo) {
          keys.dataset.on = 'false';
          return;
        }
        keys.replaceChildren(
          ...combo.split('+').map((part) => {
            const key = document.createElement('kbd');
            key.textContent = part;
            return key;
          })
        );
        keys.dataset.on = 'true';
      },
      caption(_text: string | null) {
        caption.dataset.on = 'false';
      },
      highlight(
        _rect: { x: number; y: number; width: number; height: number } | null
      ) {
        // Disabled: no green outline box
      },
      visible(on: boolean) {
        root.dataset.hidden = on ? 'false' : 'true';
      },
      glide(toX: number, toY: number, ms: number): Promise<void> {
        const startX = curX;
        const startY = curY;
        const dx = toX - startX;
        const dy = toY - startY;
        if (Math.hypot(dx, dy) < 0.5 || ms <= 0) {
          place(toX, toY);
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          const began = performance.now();
          function step(now: number) {
            const t = Math.min(1, (now - began) / ms);
            const eased = smootherstep(t);
            place(startX + dx * eased, startY + dy * eased);
            pulseTick();
            if (t < 1) {
              requestAnimationFrame(step);
            } else {
              place(toX, toY);
              resolve();
            }
          }
          requestAnimationFrame(step);
        });
      },
      fade(toOpacity: number, ms: number): Promise<void> {
        const startOpacity = curFade;
        const delta = toOpacity - startOpacity;
        if (Math.abs(delta) < 0.01 || ms <= 0) {
          curFade = toOpacity;
          curtain.style.opacity = String(toOpacity);
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          const began = performance.now();
          function step(now: number) {
            const t = Math.min(1, (now - began) / ms);
            const eased = smootherstep(t);
            curFade = startOpacity + delta * eased;
            curtain.style.opacity = curFade.toFixed(3);
            pulseTick();
            if (t < 1) {
              requestAnimationFrame(step);
            } else {
              curFade = toOpacity;
              curtain.style.opacity = String(toOpacity);
              resolve();
            }
          }
          requestAnimationFrame(step);
        });
      },
      zoom(
        px: number,
        py: number,
        scale: number,
        ms: number,
        toX?: number,
        toY?: number
      ): Promise<{ tx: number; ty: number; scale: number }> {
        const app = document.body;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const span = scale - 1;

        const targetTx =
          scale === 1
            ? 0
            : Math.min(0, Math.max(-span * width, width / 2 - scale * px));
        const targetTy =
          scale === 1
            ? 0
            : Math.min(
                0,
                Math.max(-span * height, height * 0.45 - scale * py)
              );

        const startTx = curTx;
        const startTy = curTy;
        const startScale = curScale;
        const startX = curX;
        const startY = curY;
        const movePointer = typeof toX === 'number' && typeof toY === 'number';

        app.style.transition = 'none';
        app.style.willChange = 'transform';
        app.style.transformOrigin = '0 0';

        return new Promise((resolve) => {
          const began = performance.now();
          function step(now: number) {
            const t = Math.min(1, (now - began) / ms);
            const eased = smootherstep(t);

            curTx = startTx + (targetTx - startTx) * eased;
            curTy = startTy + (targetTy - startTy) * eased;
            curScale = startScale + (scale - startScale) * eased;

            if (
              t >= 1 &&
              scale === 1 &&
              Math.abs(targetTx) < 0.5 &&
              Math.abs(targetTy) < 0.5
            ) {
              app.style.transform = 'none';
            } else {
              app.style.transform = `translate3d(${curTx.toFixed(2)}px, ${curTy.toFixed(2)}px, 0) scale(${curScale.toFixed(4)})`;
            }

            if (movePointer) {
              place(
                startX + (toX! - startX) * eased,
                startY + (toY! - startY) * eased
              );
            }
            pulseTick();

            if (t < 1) {
              requestAnimationFrame(step);
            } else {
              curTx = targetTx;
              curTy = targetTy;
              curScale = scale;
              app.style.willChange = 'auto';
              resolve(
                scale === 1
                  ? { tx: 0, ty: 0, scale: 1 }
                  : { tx: targetTx, ty: targetTy, scale }
              );
            }
          }
          requestAnimationFrame(step);
        });
      },

      still(tx: number, ty: number, scale: number) {
        const app = document.body;
        curTx = tx;
        curTy = ty;
        curScale = scale;

        app.style.transition = 'none';
        app.style.willChange = 'auto';
        app.style.transformOrigin = '0 0';
        app.style.transform =
          scale === 1
            ? 'none'
            : `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

        void app.offsetHeight;
      },
      cursorAt(nx: number, ny: number) {
        place(nx, ny);
      },
      drag(on: boolean) {
        root.dataset.drag = on ? 'true' : 'false';
      },
    };

    (window as unknown as { __demo: typeof api }).__demo = api;
  }

  if (window.top !== window) {
    addEventListener(
      'mousemove',
      (e) =>
        window.top?.postMessage(
          { __demoEvent: true, type: 'move', x: e.clientX, y: e.clientY },
          '*'
        ),
      { capture: true, passive: true }
    );
    addEventListener(
      'mousedown',
      () =>
        window.top?.postMessage({ __demoEvent: true, type: 'down' }, '*'),
      { capture: true, passive: true }
    );
    addEventListener(
      'mouseup',
      () =>
        window.top?.postMessage({ __demoEvent: true, type: 'up' }, '*'),
      { capture: true, passive: true }
    );
    return;
  }

  if (document.documentElement) {
    build();
  } else {
    addEventListener('DOMContentLoaded', build, { once: true });
  }

  addEventListener('DOMContentLoaded', build);
}

export function installOverlay(page: Page) {
  return page.addInitScript(overlaySource);
}
