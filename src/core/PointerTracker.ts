/**
 * Tracks the pointer (mouse, pen, or touch — the Pointer Events API unifies
 * all three) and reports coordinates through a single callback that is
 * batched to at most once per animation frame.
 *
 * Design notes:
 * - Listens on `window` with `{ passive: true }` so it never blocks
 *   scrolling or default touch behavior.
 * - Never calls `preventDefault`, so scrolling, drag/drop, text selection,
 *   and native gestures all keep working underneath.
 * - Coalesces high-frequency `pointermove` events into one `requestAnimationFrame`
 *   callback so we never write to the DOM more than once per frame.
 * - Distinguishes touch input (`pointerType === 'touch'`) so a `touchBehavior`
 *   policy can be applied on lift-off, without needing separate touch listeners.
 */
export type PointerKind = 'mouse' | 'pen' | 'touch';

export interface PointerTrackerCallbacks {
  onMove(x: number, y: number, kind: PointerKind): void;
  onLeave(): void;
  onDown?(x: number, y: number, kind: PointerKind): void;
  onUp?(kind: PointerKind): void;
}

export class PointerTracker {
  private rafId: number | null = null;
  private pending: { x: number; y: number; kind: PointerKind } | null = null;
  private started = false;

  constructor(private readonly callbacks: PointerTrackerCallbacks) {}

  start(): void {
    if (this.started) return;
    this.started = true;
    window.addEventListener('pointermove', this.handleMove, { passive: true });
    window.addEventListener('pointerdown', this.handleDown, { passive: true });
    window.addEventListener('pointerup', this.handleUp, { passive: true });
    window.addEventListener('pointercancel', this.handleUp, { passive: true });
    // `pointerleave` on window doesn't reliably fire; `pointerout` toward
    // outside the document, combined with the document losing the mouse,
    // is best approximated by listening for the pointer leaving the
    // top-level document via `mouseleave`/`pointerleave` on the document
    // element itself.
    document.addEventListener('mouseleave', this.handleDocumentLeave);
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    window.removeEventListener('pointermove', this.handleMove);
    window.removeEventListener('pointerdown', this.handleDown);
    window.removeEventListener('pointerup', this.handleUp);
    window.removeEventListener('pointercancel', this.handleUp);
    document.removeEventListener('mouseleave', this.handleDocumentLeave);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pending = null;
  }

  private readonly handleMove = (event: PointerEvent): void => {
    this.pending = { x: event.clientX, y: event.clientY, kind: this.kindOf(event) };
    this.scheduleFlush();
  };

  private readonly handleDown = (event: PointerEvent): void => {
    this.callbacks.onDown?.(event.clientX, event.clientY, this.kindOf(event));
  };

  private readonly handleUp = (event: PointerEvent): void => {
    this.callbacks.onUp?.(this.kindOf(event));
  };

  private readonly handleDocumentLeave = (): void => {
    this.callbacks.onLeave();
  };

  private kindOf(event: PointerEvent): PointerKind {
    if (event.pointerType === 'touch') return 'touch';
    if (event.pointerType === 'pen') return 'pen';
    return 'mouse';
  }

  private scheduleFlush(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      const next = this.pending;
      this.pending = null;
      if (next) this.callbacks.onMove(next.x, next.y, next.kind);
    });
  }
}
