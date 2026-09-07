import { describe, expect, it } from 'vitest';
import { clamp, isBrowser } from '../../src/utils/browser';

describe('isBrowser', () => {
  it('is true under jsdom (a DOM-like environment)', () => {
    expect(isBrowser()).toBe(true);
  });
});

describe('clamp', () => {
  it('keeps in-range values untouched', () => {
    expect(clamp(5, 0, 10, 1)).toBe(5);
  });

  it('clamps to the min/max bounds', () => {
    expect(clamp(-5, 0, 10, 1)).toBe(0);
    expect(clamp(50, 0, 10, 1)).toBe(10);
  });

  it('falls back for NaN/Infinity', () => {
    expect(clamp(NaN, 0, 10, 3)).toBe(3);
    expect(clamp(Infinity, 0, 10, 3)).toBe(3);
    expect(clamp(-Infinity, 0, 10, 3)).toBe(3);
  });
});
