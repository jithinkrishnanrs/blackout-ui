import { afterEach, describe, expect, it } from 'vitest';
import { Overlay } from '../../src/core/Overlay';
import { DEFAULT_OPTIONS } from '../../src/core/Configuration';

describe('Overlay', () => {
  let overlay: Overlay;

  afterEach(() => {
    overlay?.unmount();
    document.getElementById('blackout-ui-styles')?.remove();
  });

  it('mounts a single div with the expected class and aria-hidden', () => {
    overlay = new Overlay();
    const el = overlay.mount(999);
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('blackout-ui-root');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.style.zIndex).toBe('999');
  });

  it('mount() is idempotent — calling twice returns the same node', () => {
    overlay = new Overlay();
    const a = overlay.mount(1);
    const b = overlay.mount(1);
    expect(a).toBe(b);
    expect(document.querySelectorAll('.blackout-ui-root')).toHaveLength(1);
  });

  it('paint() writes a radial-gradient containing the darkness at 100%', () => {
    overlay = new Overlay();
    overlay.mount(1);
    overlay.paint(10, 20, { ...DEFAULT_OPTIONS, darkness: 1, radius: 150 });
    const bg = overlay.node?.style.background ?? '';
    expect(bg).toContain('radial-gradient');
    expect(bg).toContain('circle');
    expect(bg).toContain('10px 20px');
    expect(bg).toContain('rgba(0,0,0,1)');
  });

  it('paint() honors intensity by dimming the inner stops', () => {
    overlay = new Overlay();
    overlay.mount(1);
    overlay.paint(0, 0, { ...DEFAULT_OPTIONS, intensity: 0.5 });
    const bg = overlay.node?.style.background ?? '';
    expect(bg).toContain('rgba(0,0,0,0.5)');
  });

  it('paint() uses an ellipse shape when configured', () => {
    overlay = new Overlay();
    overlay.mount(1);
    overlay.paint(0, 0, { ...DEFAULT_OPTIONS, shape: 'ellipse', radius: 100 });
    const bg = overlay.node?.style.background ?? '';
    expect(bg).toContain('ellipse');
  });

  it('unmount() removes the node and node getter returns null', () => {
    overlay = new Overlay();
    overlay.mount(1);
    overlay.unmount();
    expect(overlay.node).toBeNull();
    expect(document.querySelectorAll('.blackout-ui-root')).toHaveLength(0);
  });

  it('setEnabled toggles the data-blackout-enabled attribute', () => {
    overlay = new Overlay();
    overlay.mount(1);
    overlay.setEnabled(false);
    expect(overlay.node?.getAttribute('data-blackout-enabled')).toBe('false');
    overlay.setEnabled(true);
    expect(overlay.node?.getAttribute('data-blackout-enabled')).toBe('true');
  });
});
