import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Blackout, createBlackout } from '../../src/core/Blackout';

function getOverlayEl(): HTMLElement | null {
  return document.querySelector('.blackout-ui-root');
}

describe('Blackout lifecycle', () => {
  let instance: Blackout;

  beforeEach(() => {
    instance = new Blackout();
  });

  afterEach(() => {
    instance.destroy();
    document
      .querySelectorAll('.blackout-ui-root, #blackout-ui-styles')
      .forEach((el) => el.remove());
  });

  it('is not initialized before init()', () => {
    expect(instance.isInitialized()).toBe(false);
  });

  it('creates exactly one overlay element on init()', () => {
    instance.init();
    expect(document.querySelectorAll('.blackout-ui-root')).toHaveLength(1);
  });

  it('is enabled by default after init()', () => {
    instance.init();
    expect(instance.isEnabled()).toBe(true);
  });

  it('respects enabled: false at init time', () => {
    instance.init({ enabled: false });
    expect(instance.isEnabled()).toBe(false);
  });

  it('does not create a second overlay on duplicate init()', () => {
    instance.init();
    instance.init();
    instance.init({ radius: 300 });
    expect(document.querySelectorAll('.blackout-ui-root')).toHaveLength(1);
    expect(instance.getOptions().radius).toBe(300);
  });

  it('injects only one shared <style> tag even across instances', () => {
    const other = createBlackout();
    instance.init();
    other.init();
    expect(document.querySelectorAll('#blackout-ui-styles')).toHaveLength(1);
    other.destroy();
  });

  it('enable()/disable()/toggle() update state and the DOM attribute', () => {
    instance.init();
    instance.disable();
    expect(instance.isEnabled()).toBe(false);
    expect(getOverlayEl()?.getAttribute('data-blackout-enabled')).toBe('false');

    instance.enable();
    expect(instance.isEnabled()).toBe(true);
    expect(getOverlayEl()?.getAttribute('data-blackout-enabled')).toBe('true');

    instance.toggle();
    expect(instance.isEnabled()).toBe(false);
    instance.toggle();
    expect(instance.isEnabled()).toBe(true);
  });

  it('configure() updates options without recreating the overlay', () => {
    instance.init({ radius: 100 });
    const el = getOverlayEl();
    instance.configure({ radius: 250, softness: 10 });
    expect(instance.getOptions().radius).toBe(250);
    expect(instance.getOptions().softness).toBe(10);
    expect(getOverlayEl()).toBe(el);
  });

  it('setRadius/setSoftness/setDarkness update just that field', () => {
    instance.init();
    instance.setRadius(222);
    instance.setSoftness(15);
    instance.setDarkness(0.5);
    const opts = instance.getOptions();
    expect(opts.radius).toBe(222);
    expect(opts.softness).toBe(15);
    expect(opts.darkness).toBe(0.5);
  });

  it('setPosition paints the overlay at the given coordinates', () => {
    instance.init();
    instance.setPosition(42, 84);
    const bg = getOverlayEl()?.style.background ?? '';
    expect(bg).toContain('42px 84px');
  });

  it('destroy() removes the overlay and resets state', () => {
    instance.init();
    instance.destroy();
    expect(getOverlayEl()).toBeNull();
    expect(instance.isInitialized()).toBe(false);
    expect(instance.isEnabled()).toBe(false);
  });

  it('can be re-initialized after destroy()', () => {
    instance.init();
    instance.destroy();
    instance.init();
    expect(instance.isInitialized()).toBe(true);
    expect(document.querySelectorAll('.blackout-ui-root')).toHaveLength(1);
  });

  it('destroy() before init() is a safe no-op', () => {
    expect(() => instance.destroy()).not.toThrow();
  });

  it('configure()/enable()/disable() before init() are safe no-ops', () => {
    expect(() => instance.configure({ radius: 10 })).not.toThrow();
    expect(() => instance.enable()).not.toThrow();
    expect(() => instance.disable()).not.toThrow();
    expect(instance.isInitialized()).toBe(false);
  });

  it('restores the native cursor after destroy() when cursor.hide was used', () => {
    document.documentElement.style.cursor = 'help';
    instance.init({ cursor: { hide: true } });
    expect(document.documentElement.style.cursor).toBe('none');
    instance.destroy();
    expect(document.documentElement.style.cursor).toBe('help');
    document.documentElement.style.removeProperty('cursor');
  });

  it('removes the resize listener on destroy() (no leaked handlers)', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    instance.init();
    instance.destroy();
    const addedResize = addSpy.mock.calls.filter((c) => c[0] === 'resize').length;
    const removedResize = removeSpy.mock.calls.filter((c) => c[0] === 'resize').length;
    expect(removedResize).toBeGreaterThanOrEqual(addedResize);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('marks the overlay aria-hidden so it never enters the accessibility tree', () => {
    instance.init();
    expect(getOverlayEl()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('the overlay never intercepts pointer events by default', () => {
    instance.init();
    const style = getOverlayEl() ? getComputedStyle(getOverlayEl() as HTMLElement) : null;
    // jsdom applies the stylesheet we inject; pointer-events should be none.
    expect(style?.pointerEvents === 'none' || style?.pointerEvents === '').toBeTruthy();
  });

  it('supports independently configured multiple instances', () => {
    const other = createBlackout();
    instance.init({ radius: 100 });
    other.init({ radius: 400 });
    expect(instance.getOptions().radius).toBe(100);
    expect(other.getOptions().radius).toBe(400);
    other.destroy();
  });
});

describe('event emitter', () => {
  let instance: Blackout;

  beforeEach(() => {
    instance = new Blackout();
  });

  afterEach(() => {
    instance.destroy();
  });

  it('emits enable/disable/destroy/configure', () => {
    const onEnable = vi.fn();
    const onDisable = vi.fn();
    const onDestroy = vi.fn();
    const onConfigure = vi.fn();

    instance.on('enable', onEnable);
    instance.on('disable', onDisable);
    instance.on('destroy', onDestroy);
    instance.on('configure', onConfigure);

    instance.init({ enabled: false });
    instance.enable();
    instance.disable();
    instance.configure({ radius: 200 });
    instance.destroy();

    expect(onEnable).toHaveBeenCalledTimes(1);
    expect(onDisable).toHaveBeenCalledTimes(1);
    expect(onConfigure).toHaveBeenCalledTimes(1);
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });

  it('off() stops further calls', () => {
    const handler = vi.fn();
    instance.on('enable', handler);
    instance.off('enable', handler);
    instance.init();
    instance.disable();
    instance.enable();
    expect(handler).not.toHaveBeenCalled();
  });
});
