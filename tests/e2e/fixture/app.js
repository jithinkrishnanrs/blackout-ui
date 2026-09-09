import Blackout from './vendor/blackout-ui.js';

// The fixture enables Blackout immediately on load. This is deliberately
// different from the public demo site (which starts disabled behind a
// "Turn On Blackout" CTA) — the E2E suite tests the library's active
// behavior directly, and doing that here has no bearing on the production
// site's default-off UX.
const blackout = Blackout.init({ enabled: true, radius: 180 });

document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
});

document.getElementById('blackout-toggle').addEventListener('click', () => {
  blackout.toggle();
});

const radiusInput = document.getElementById('radius');
const radiusValue = document.getElementById('radius-value');
radiusInput.addEventListener('input', () => {
  radiusValue.textContent = radiusInput.value;
  blackout.setRadius(Number(radiusInput.value));
});
