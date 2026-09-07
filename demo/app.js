import Blackout from './vendor/blackout-ui.js';

Blackout.init({
  radius: 180,
  softness: 35,
  darkness: 1,
  intensity: 1,
  shape: 'circle',
  touch: true,
});

// Fade the "move your cursor" hint on first movement.
const hint = document.getElementById('hero-hint');
window.addEventListener(
  'pointermove',
  () => {
    hint?.classList.add('is-hidden');
  },
  { once: true, passive: true }
);

// --- Playground: sliders -------------------------------------------------

function wireRange(id, valueId, onChange, format = (v) => v) {
  const input = document.getElementById(id);
  const output = document.getElementById(valueId);
  input.addEventListener('input', () => {
    const value = Number(input.value);
    if (output) output.textContent = format(value);
    onChange(value);
  });
}

wireRange('radius', 'radius-value', (v) => Blackout.setRadius(v));
wireRange('softness', 'softness-value', (v) => Blackout.setSoftness(v));
wireRange('darkness', 'darkness-value', (v) => Blackout.setDarkness(v / 100), (v) =>
  (v / 100).toFixed(2)
);
wireRange('intensity', 'intensity-value', (v) => Blackout.configure({ intensity: v / 100 }), (v) =>
  (v / 100).toFixed(2)
);

// --- Playground: segmented controls --------------------------------------

function wireSegmented(selector, onSelect) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      onSelect(button.dataset);
    });
  });
}

wireSegmented('[data-shape]', (data) => Blackout.configure({ shape: data.shape }));
wireSegmented('[data-cursor]', (data) =>
  Blackout.configure({ cursor: { hide: data.cursor === 'hidden' } })
);
wireSegmented('[data-touch]', (data) => Blackout.configure({ touch: data.touch === 'on' }));

// --- Top bar: blackout on/off, page theme --------------------------------

const blackoutToggle = document.getElementById('blackout-toggle');
blackoutToggle.addEventListener('click', () => {
  Blackout.toggle();
  const enabled = Blackout.isEnabled();
  blackoutToggle.setAttribute('aria-pressed', String(enabled));
  blackoutToggle.textContent = `Blackout: ${enabled ? 'on' : 'off'}`;
});

const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  themeToggle.setAttribute('aria-pressed', String(next === 'light'));
  themeToggle.textContent = `Switch to ${next === 'light' ? 'dark' : 'light'} page`;
  // No call into Blackout here at all — this is the point of the demo:
  // the flashlight keeps revealing whatever theme is currently rendered.
});
