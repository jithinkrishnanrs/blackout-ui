/**
 * Public configuration options for a Blackout instance.
 *
 * Every field is optional. Anything omitted keeps its current value
 * (on `configure`) or falls back to a documented default (on `init`).
 */
export interface BlackoutOptions {
  /** Whether the effect is active immediately after `init()`. Default: `true`. */
  enabled?: boolean;

  /** Outer radius of the flashlight, in CSS pixels. Default: `180`. */
  radius?: number;

  /**
   * How gradually the flashlight fades into darkness, `0`–`100`.
   * `0` is a hard edge, `100` fades from the very center. Default: `35`.
   */
  softness?: number;

  /**
   * Opacity of the darkness outside the flashlight, `0`–`1`.
   * `1` is fully opaque black. Default: `1`.
   */
  darkness?: number;

  /**
   * How fully the page is revealed *inside* the flashlight, `0`–`1`.
   * `1` is a full, undimmed reveal. Default: `1`.
   */
  intensity?: number;

  /** Shape of the reveal area. Default: `"circle"`. */
  shape?: BlackoutShape;

  /** Whether touch input moves the flashlight. Default: `true`. */
  touch?: boolean;

  /**
   * What happens to the flashlight when an active touch ends.
   * - `"follow"` – keep the flashlight at the last touch point (default)
   * - `"hide"` – return to full darkness
   * - `"persist"` – same as `"follow"`, kept as an explicit alias
   */
  touchBehavior?: TouchBehavior;

  /** What happens when the pointer leaves the viewport. Default: `"freeze"`. */
  onPointerLeave?: PointerLeaveBehavior;

  /**
   * Where the flashlight sits before any pointer input has been received.
   * `"center"` centers it in the viewport; an explicit point can also be
   * given. Default: `"center"`.
   */
  initialPosition?: 'center' | { x: number; y: number };

  cursor?: {
    /** Hide the native cursor while the effect is enabled. Default: `false`. */
    hide?: boolean;
  };

  accessibility?: {
    /**
     * When `true` (default) and the user's OS requests reduced motion,
     * Blackout UI avoids any non-essential transitions. Pointer tracking
     * itself is never animated, so this mostly affects future features.
     */
    respectReducedMotion?: boolean;
  };

  /**
   * z-index of the overlay element. Default: `2147483647` (the maximum
   * safe 32-bit z-index), which sits above virtually all page content.
   */
  zIndex?: number;
}

export type BlackoutShape = 'circle' | 'ellipse';
export type TouchBehavior = 'follow' | 'hide' | 'persist';
export type PointerLeaveBehavior = 'freeze' | 'center' | 'hide';

/** Fully-resolved configuration, after defaults and validation are applied. */
export interface ResolvedBlackoutOptions {
  enabled: boolean;
  radius: number;
  softness: number;
  darkness: number;
  intensity: number;
  shape: BlackoutShape;
  touch: boolean;
  touchBehavior: TouchBehavior;
  onPointerLeave: PointerLeaveBehavior;
  initialPosition: 'center' | { x: number; y: number };
  cursor: { hide: boolean };
  accessibility: { respectReducedMotion: boolean };
  zIndex: number;
}

/** Events emitted by a Blackout instance. Payloads are the instance's current config. */
export interface BlackoutEventMap {
  enable: ResolvedBlackoutOptions;
  disable: ResolvedBlackoutOptions;
  configure: ResolvedBlackoutOptions;
  destroy: undefined;
}

export type BlackoutEventName = keyof BlackoutEventMap;
export type BlackoutEventListener<E extends BlackoutEventName> = (
  payload: BlackoutEventMap[E]
) => void;

/** Public instance API. `Blackout` (the default export) is a singleton of this shape. */
export interface BlackoutInstance {
  init(options?: BlackoutOptions): BlackoutInstance;
  configure(options: BlackoutOptions): BlackoutInstance;
  enable(): BlackoutInstance;
  disable(): BlackoutInstance;
  toggle(): BlackoutInstance;
  destroy(): void;
  isEnabled(): boolean;
  isInitialized(): boolean;
  setPosition(x: number, y: number): BlackoutInstance;
  setRadius(radius: number): BlackoutInstance;
  setSoftness(softness: number): BlackoutInstance;
  setDarkness(darkness: number): BlackoutInstance;
  getOptions(): ResolvedBlackoutOptions;
  on<E extends BlackoutEventName>(event: E, listener: BlackoutEventListener<E>): BlackoutInstance;
  off<E extends BlackoutEventName>(event: E, listener: BlackoutEventListener<E>): BlackoutInstance;
}
