import { describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS, resolveOptions } from '../../src/core/Configuration';

describe('resolveOptions', () => {
  it('returns defaults when no partial is given', () => {
    const resolved = resolveOptions(DEFAULT_OPTIONS, {});
    expect(resolved).toEqual(DEFAULT_OPTIONS);
  });

  it('clamps darkness into [0, 1]', () => {
    expect(resolveOptions(DEFAULT_OPTIONS, { darkness: 5 }).darkness).toBe(1);
    expect(resolveOptions(DEFAULT_OPTIONS, { darkness: -5 }).darkness).toBe(0);
    expect(resolveOptions(DEFAULT_OPTIONS, { darkness: 0.5 }).darkness).toBe(0.5);
  });

  it('clamps intensity into [0, 1]', () => {
    expect(resolveOptions(DEFAULT_OPTIONS, { intensity: 3 }).intensity).toBe(1);
    expect(resolveOptions(DEFAULT_OPTIONS, { intensity: -1 }).intensity).toBe(0);
  });

  it('clamps softness into [0, 100]', () => {
    expect(resolveOptions(DEFAULT_OPTIONS, { softness: 500 }).softness).toBe(100);
    expect(resolveOptions(DEFAULT_OPTIONS, { softness: -20 }).softness).toBe(0);
  });

  it('never produces a non-finite radius', () => {
    expect(resolveOptions(DEFAULT_OPTIONS, { radius: NaN }).radius).toBe(DEFAULT_OPTIONS.radius);
    expect(resolveOptions(DEFAULT_OPTIONS, { radius: Infinity }).radius).toBe(
      DEFAULT_OPTIONS.radius
    );
    expect(resolveOptions(DEFAULT_OPTIONS, { radius: -50 }).radius).toBeGreaterThan(0);
  });

  it('falls back to "circle" for an unknown shape', () => {
    // @ts-expect-error intentionally invalid input
    expect(resolveOptions(DEFAULT_OPTIONS, { shape: 'triangle' }).shape).toBe('circle');
  });

  it('falls back to "follow" for an unknown touchBehavior', () => {
    // @ts-expect-error intentionally invalid input
    expect(resolveOptions(DEFAULT_OPTIONS, { touchBehavior: 'bogus' }).touchBehavior).toBe(
      'follow'
    );
  });

  it('falls back to "center" for an invalid initialPosition', () => {
    // @ts-expect-error intentionally invalid input
    expect(resolveOptions(DEFAULT_OPTIONS, { initialPosition: 'nowhere' }).initialPosition).toBe(
      'center'
    );
  });

  it('accepts a valid explicit initialPosition', () => {
    const resolved = resolveOptions(DEFAULT_OPTIONS, { initialPosition: { x: 10, y: 20 } });
    expect(resolved.initialPosition).toEqual({ x: 10, y: 20 });
  });

  it('merges nested cursor/accessibility objects instead of replacing them', () => {
    const resolved = resolveOptions(DEFAULT_OPTIONS, { cursor: { hide: true } });
    expect(resolved.cursor).toEqual({ hide: true });
    expect(resolved.accessibility).toEqual(DEFAULT_OPTIONS.accessibility);
  });

  it('does not mutate the base options object', () => {
    const base = { ...DEFAULT_OPTIONS };
    resolveOptions(DEFAULT_OPTIONS, { radius: 999 });
    expect(DEFAULT_OPTIONS).toEqual(base);
  });
});
