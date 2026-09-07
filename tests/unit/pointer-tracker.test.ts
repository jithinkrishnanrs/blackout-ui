import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PointerTracker } from '../../src/core/PointerTracker';

// jsdom doesn't implement the PointerEvent constructor; MouseEvent covers
// every property this library reads (clientX/clientY) and lets us attach
// a `pointerType`, which is all PointerTracker actually needs from the event.
class FakePointerEvent extends MouseEvent {
  readonly pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
if (typeof window.PointerEvent === 'undefined') {
  // @ts-expect-error jsdom lacks a native PointerEvent; provide a minimal shim for tests.
  window.PointerEvent = FakePointerEvent;
}

function firePointerMove(x: number, y: number, pointerType = 'mouse'): void {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType }));
}

describe('PointerTracker', () => {
  let rafCallbacks: FrameRequestCallback[];
  let originalRaf: typeof requestAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRaf = window.requestAnimationFrame;
    // Deterministic rAF: capture callbacks, flush manually in tests.
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    }) as typeof requestAnimationFrame;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
  });

  function flush(): void {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(0));
  }

  it('batches multiple pointermove events into a single onMove call per frame', () => {
    const onMove = vi.fn();
    const tracker = new PointerTracker({ onMove, onLeave: vi.fn() });
    tracker.start();

    firePointerMove(1, 1);
    firePointerMove(2, 2);
    firePointerMove(3, 3);
    expect(onMove).not.toHaveBeenCalled();
    expect(rafCallbacks).toHaveLength(1);

    flush();
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith(3, 3, 'mouse');

    tracker.stop();
  });

  it('reports "touch" as the pointer kind for touch input', () => {
    const onMove = vi.fn();
    const tracker = new PointerTracker({ onMove, onLeave: vi.fn() });
    tracker.start();
    firePointerMove(5, 5, 'touch');
    flush();
    expect(onMove).toHaveBeenCalledWith(5, 5, 'touch');
    tracker.stop();
  });

  it('stop() removes listeners so further events produce no callbacks', () => {
    const onMove = vi.fn();
    const tracker = new PointerTracker({ onMove, onLeave: vi.fn() });
    tracker.start();
    tracker.stop();
    firePointerMove(9, 9);
    expect(rafCallbacks).toHaveLength(0);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('start() is idempotent (no duplicate listeners / calls)', () => {
    const onMove = vi.fn();
    const tracker = new PointerTracker({ onMove, onLeave: vi.fn() });
    tracker.start();
    tracker.start();
    firePointerMove(1, 1);
    flush();
    expect(onMove).toHaveBeenCalledTimes(1);
    tracker.stop();
  });

  it('calls onUp with the pointer kind on pointerup', () => {
    const onUp = vi.fn();
    const tracker = new PointerTracker({ onMove: vi.fn(), onLeave: vi.fn(), onUp });
    tracker.start();
    window.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch' }));
    expect(onUp).toHaveBeenCalledWith('touch');
    tracker.stop();
  });
});
