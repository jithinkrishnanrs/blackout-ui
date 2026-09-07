/**
 * True when running in a environment with a real DOM (browser, or a
 * DOM-emulating test environment like jsdom). False during SSR / module
 * evaluation on the server, where `window`/`document` don't exist.
 *
 * Every browser API access in this library is guarded by this check (or
 * happens inside a call that only ever runs after it), so importing the
 * package on the server never throws.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** True when the OS/browser is currently requesting reduced motion. */
export function prefersReducedMotion(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Clamp `value` into `[min, max]`, falling back to `fallback` for non-finite input. */
export function clamp(value: number, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

/** Current viewport width in CSS pixels, robust to quirks-mode / mismatched box metrics. */
export function viewportWidth(): number {
  if (!isBrowser()) return 0;
  return window.innerWidth || document.documentElement.clientWidth || 0;
}

/** Current viewport height in CSS pixels, robust to quirks-mode / mismatched box metrics. */
export function viewportHeight(): number {
  if (!isBrowser()) return 0;
  return window.innerHeight || document.documentElement.clientHeight || 0;
}

/** Emits a namespaced console warning, but only outside production builds. */
export function devWarn(message: string): void {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return;
  }
  console.warn(`[blackout-ui] ${message}`);
}
