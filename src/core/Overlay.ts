import type { ResolvedBlackoutOptions } from './types';

const STYLE_ID = 'blackout-ui-styles';
const ROOT_CLASS = 'blackout-ui-root';

/**
 * A static, hand-written copy of `src/styles/blackout.css`.
 * Kept inline (rather than `fetch`/`@import`ed) so the library works with
 * zero runtime requests and under strict CSPs that block inline
 * stylesheets loaded from unknown origins — this is a plain <style>
 * element with static, package-authored text, never user input.
 */
const CSS = `.${ROOT_CLASS}{position:fixed;inset:0;z-index:2147483647;pointer-events:none;will-change:background;contain:strict}.${ROOT_CLASS}[data-blackout-enabled="false"]{display:none}@media print{.${ROOT_CLASS}{display:none!important}}`;

/**
 * Manages the single overlay <div> and its stylesheet. Pure DOM plumbing —
 * no pointer logic lives here.
 */
export class Overlay {
  private element: HTMLDivElement | null = null;
  private styleElement: HTMLStyleElement | null = null;

  mount(zIndex: number): HTMLDivElement {
    if (this.element) return this.element;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
      this.styleElement = style;
    }

    const el = document.createElement('div');
    el.className = ROOT_CLASS;
    el.setAttribute('aria-hidden', 'true');
    el.style.zIndex = String(zIndex);
    document.body.appendChild(el);
    this.element = el;
    return el;
  }

  get node(): HTMLDivElement | null {
    return this.element;
  }

  setEnabled(enabled: boolean): void {
    this.element?.setAttribute('data-blackout-enabled', String(enabled));
  }

  setZIndex(zIndex: number): void {
    if (this.element) this.element.style.zIndex = String(zIndex);
  }

  /** Writes the current position/size/darkness as CSS custom properties and a matching gradient. */
  paint(x: number, y: number, options: ResolvedBlackoutOptions): void {
    const el = this.element;
    if (!el) return;

    const { radius, softness, darkness, intensity, shape } = options;
    const innerStopRatio = 1 - softness / 100;
    const innerStopPx = Math.max(0, radius * innerStopRatio);
    const innerAlpha = 1 - intensity;

    const shapeKeyword = shape === 'ellipse' ? 'ellipse' : 'circle';
    const shapeSize =
      shape === 'ellipse' ? `${radius}px ${Math.round(radius * 0.75)}px` : `${radius}px`;

    const gradient =
      `radial-gradient(${shapeKeyword} ${shapeSize} at ${x}px ${y}px, ` +
      `rgba(0,0,0,${innerAlpha}) 0px, ` +
      `rgba(0,0,0,${innerAlpha}) ${innerStopPx}px, ` +
      `rgba(0,0,0,${darkness}) ${radius}px)`;

    el.style.background = gradient;
  }

  unmount(): void {
    this.element?.remove();
    this.element = null;
    // Intentionally leave the shared <style id="blackout-ui-styles"> tag in
    // place: it's static, idempotent, and cheap. If a second instance is
    // created later it can reuse it instead of re-inserting a duplicate.
    this.styleElement = null;
  }
}
