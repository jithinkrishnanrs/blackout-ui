import { clamp, devWarn } from '../utils/browser';
import type { BlackoutOptions, ResolvedBlackoutOptions } from './types';

export const DEFAULT_OPTIONS: ResolvedBlackoutOptions = {
  enabled: true,
  radius: 180,
  softness: 35,
  darkness: 1,
  intensity: 1,
  shape: 'circle',
  touch: true,
  touchBehavior: 'follow',
  onPointerLeave: 'freeze',
  initialPosition: 'center',
  cursor: { hide: false },
  accessibility: { respectReducedMotion: true },
  zIndex: 2147483647,
};

const MIN_RADIUS = 1;
const MAX_RADIUS = 100000;

/**
 * Merges `partial` onto `base`, clamping every numeric/enum field to a safe
 * value. Never throws for ordinary developer mistakes (NaN, out-of-range
 * numbers, unknown strings) — invalid input is normalized and a warning is
 * logged in non-production builds instead.
 */
export function resolveOptions(
  base: ResolvedBlackoutOptions,
  partial: BlackoutOptions = {}
): ResolvedBlackoutOptions {
  const resolved: ResolvedBlackoutOptions = {
    ...base,
    ...partial,
    cursor: { ...base.cursor, ...partial.cursor },
    accessibility: { ...base.accessibility, ...partial.accessibility },
  };

  if (partial.radius !== undefined) {
    resolved.radius = clamp(partial.radius, MIN_RADIUS, MAX_RADIUS, base.radius);
    if (resolved.radius !== partial.radius) {
      devWarn(`radius ${partial.radius} is out of range, clamped to ${resolved.radius}.`);
    }
  }

  if (partial.softness !== undefined) {
    resolved.softness = clamp(partial.softness, 0, 100, base.softness);
  }

  if (partial.darkness !== undefined) {
    resolved.darkness = clamp(partial.darkness, 0, 1, base.darkness);
  }

  if (partial.intensity !== undefined) {
    resolved.intensity = clamp(partial.intensity, 0, 1, base.intensity);
  }

  if (partial.zIndex !== undefined) {
    resolved.zIndex = clamp(partial.zIndex, 0, 2147483647, base.zIndex);
  }

  if (partial.shape !== undefined && partial.shape !== 'circle' && partial.shape !== 'ellipse') {
    devWarn(`Unknown shape "${String(partial.shape)}", falling back to "circle".`);
    resolved.shape = 'circle';
  }

  if (
    partial.touchBehavior !== undefined &&
    !['follow', 'hide', 'persist'].includes(partial.touchBehavior)
  ) {
    devWarn(`Unknown touchBehavior "${String(partial.touchBehavior)}", falling back to "follow".`);
    resolved.touchBehavior = 'follow';
  }

  if (
    partial.onPointerLeave !== undefined &&
    !['freeze', 'center', 'hide'].includes(partial.onPointerLeave)
  ) {
    devWarn(
      `Unknown onPointerLeave "${String(partial.onPointerLeave)}", falling back to "freeze".`
    );
    resolved.onPointerLeave = 'freeze';
  }

  if (
    partial.initialPosition !== undefined &&
    partial.initialPosition !== 'center' &&
    (typeof partial.initialPosition !== 'object' ||
      typeof partial.initialPosition.x !== 'number' ||
      typeof partial.initialPosition.y !== 'number')
  ) {
    devWarn('Invalid initialPosition, falling back to "center".');
    resolved.initialPosition = 'center';
  }

  return resolved;
}
