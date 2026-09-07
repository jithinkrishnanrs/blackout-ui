import { isBrowser, viewportHeight, viewportWidth } from '../utils/browser';
import { CursorGuard } from '../utils/accessibility';
import { DEFAULT_OPTIONS, resolveOptions } from './Configuration';
import { EventEmitter } from './EventEmitter';
import { Overlay } from './Overlay';
import { PointerTracker, type PointerKind } from './PointerTracker';
import type { BlackoutInstance, BlackoutOptions, ResolvedBlackoutOptions } from './types';

/**
 * A single Blackout effect instance.
 *
 * The default export of the package (`Blackout`) is one instance of this
 * class, giving most consumers a simple singleton API. The class itself
 * has no module-level shared state, so creating additional instances
 * (via `createBlackout()`) is safe if an app ever needs more than one.
 */
export class Blackout implements BlackoutInstance {
  private options: ResolvedBlackoutOptions = { ...DEFAULT_OPTIONS };
  private readonly overlay = new Overlay();
  private readonly events = new EventEmitter();
  private readonly cursorGuard = new CursorGuard();
  private tracker: PointerTracker | null = null;

  private initialized = false;
  private enabled = false;
  private hasPointer = false;
  private lastX = 0;
  private lastY = 0;
  private activeTouchId: PointerKind | null = null;

  init(options: BlackoutOptions = {}): BlackoutInstance {
    if (!isBrowser()) return this; // SSR-safe no-op.

    if (this.initialized) {
      // Idempotent by design: a second `init()` just updates configuration
      // instead of creating a second overlay.
      return this.configure(options);
    }

    this.options = resolveOptions(DEFAULT_OPTIONS, options);
    this.initialized = true;

    const { x, y } = this.resolveInitialPosition();
    this.lastX = x;
    this.lastY = y;

    this.overlay.mount(this.options.zIndex);
    this.tracker = new PointerTracker({
      onMove: (px, py, kind) => this.handlePointerMove(px, py, kind),
      onLeave: () => this.handlePointerLeave(),
      onUp: (kind) => this.handlePointerUp(kind),
    });
    this.tracker.start();

    window.addEventListener('resize', this.handleResize, { passive: true });

    if (this.options.enabled) {
      this.setEnabled(true, /* silent */ true);
    } else {
      this.overlay.setEnabled(false);
    }
    this.render();

    return this;
  }

  configure(options: BlackoutOptions): BlackoutInstance {
    if (!isBrowser() || !this.initialized) return this;

    const wasEnabled = this.enabled;
    this.options = resolveOptions(this.options, options);
    this.overlay.setZIndex(this.options.zIndex);

    if (options.enabled !== undefined && options.enabled !== wasEnabled) {
      this.setEnabled(options.enabled, /* silent */ true);
    }

    if (options.cursor?.hide !== undefined) {
      this.syncCursorGuard();
    }

    this.render();
    this.events.emit('configure', this.options);
    return this;
  }

  enable(): BlackoutInstance {
    if (!isBrowser() || !this.initialized) return this;
    this.setEnabled(true);
    return this;
  }

  disable(): BlackoutInstance {
    if (!isBrowser() || !this.initialized) return this;
    this.setEnabled(false);
    return this;
  }

  toggle(): BlackoutInstance {
    return this.enabled ? this.disable() : this.enable();
  }

  destroy(): void {
    if (!isBrowser() || !this.initialized) return;

    window.removeEventListener('resize', this.handleResize);
    this.tracker?.stop();
    this.tracker = null;
    this.overlay.unmount();
    this.cursorGuard.restore();

    this.initialized = false;
    this.enabled = false;
    this.hasPointer = false;
    this.activeTouchId = null;

    this.events.emit('destroy', undefined);
    this.events.clear();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  setPosition(x: number, y: number): BlackoutInstance {
    if (!isBrowser() || !this.initialized) return this;
    this.lastX = x;
    this.lastY = y;
    this.hasPointer = true;
    this.render();
    return this;
  }

  setRadius(radius: number): BlackoutInstance {
    return this.configure({ radius });
  }

  setSoftness(softness: number): BlackoutInstance {
    return this.configure({ softness });
  }

  setDarkness(darkness: number): BlackoutInstance {
    return this.configure({ darkness });
  }

  getOptions(): ResolvedBlackoutOptions {
    return { ...this.options };
  }

  on: BlackoutInstance['on'] = (event, listener) => {
    this.events.on(event, listener);
    return this;
  };

  off: BlackoutInstance['off'] = (event, listener) => {
    this.events.off(event, listener);
    return this;
  };

  // --- internals ---------------------------------------------------------

  private setEnabled(enabled: boolean, silent = false): void {
    this.enabled = enabled;
    this.overlay.setEnabled(enabled);
    this.syncCursorGuard();
    if (!silent) {
      this.events.emit(enabled ? 'enable' : 'disable', this.options);
    }
  }

  private syncCursorGuard(): void {
    if (this.enabled && this.options.cursor.hide) {
      this.cursorGuard.hide();
    } else {
      this.cursorGuard.restore();
    }
  }

  private resolveInitialPosition(): { x: number; y: number } {
    const pos = this.options.initialPosition;
    if (pos === 'center' || !pos) {
      return { x: viewportWidth() / 2, y: viewportHeight() / 2 };
    }
    return { x: pos.x, y: pos.y };
  }

  private handlePointerMove(x: number, y: number, kind: PointerKind): void {
    if (kind === 'touch' && !this.options.touch) return;
    this.lastX = x;
    this.lastY = y;
    this.hasPointer = true;
    this.activeTouchId = kind === 'touch' ? kind : null;
    this.render();
  }

  private handlePointerUp(kind: PointerKind): void {
    if (kind !== 'touch' || !this.options.touch) return;
    this.activeTouchId = null;
    if (this.options.touchBehavior === 'hide') {
      this.hasPointer = false;
      this.render();
    }
    // "follow" / "persist": intentionally leave the flashlight where it was.
  }

  private handlePointerLeave(): void {
    switch (this.options.onPointerLeave) {
      case 'hide':
        this.hasPointer = false;
        break;
      case 'center': {
        const { x, y } = { x: viewportWidth() / 2, y: viewportHeight() / 2 };
        this.lastX = x;
        this.lastY = y;
        break;
      }
      case 'freeze':
      default:
        // Keep the last known coordinates as-is.
        break;
    }
    this.render();
  }

  private readonly handleResize = (): void => {
    // Coordinates are viewport-relative already; nothing to recompute
    // beyond a repaint (the gradient itself doesn't depend on viewport size).
    this.render();
  };

  private render(): void {
    if (!this.hasPointer && this.options.onPointerLeave === 'hide') {
      // Push the reveal far off-screen rather than toggling `display`, so
      // no layout/paint churn happens beyond the background property itself.
      this.overlay.paint(-100000, -100000, this.options);
      return;
    }
    this.overlay.paint(this.lastX, this.lastY, this.options);
  }
}

/** Creates an independent Blackout instance, for apps that need more than one. */
export function createBlackout(): BlackoutInstance {
  return new Blackout();
}
