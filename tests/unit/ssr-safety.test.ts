// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('SSR safety', () => {
  it('importing the package does not throw when window/document are undefined', async () => {
    expect(typeof window).toBe('undefined');
    await expect(import('../../src/index')).resolves.toBeDefined();
  });

  it('calling every public method on the server is a safe no-op', async () => {
    const { default: Blackout } = await import('../../src/index');

    expect(() => {
      Blackout.init({ radius: 200 });
      Blackout.configure({ darkness: 0.5 });
      Blackout.enable();
      Blackout.disable();
      Blackout.toggle();
      Blackout.setPosition(1, 1);
      Blackout.setRadius(10);
      Blackout.isEnabled();
      Blackout.isInitialized();
      Blackout.destroy();
    }).not.toThrow();

    expect(Blackout.isInitialized()).toBe(false);
    expect(Blackout.isEnabled()).toBe(false);
  });
});
