import Blackout from './vendor/blackout-ui.js';

// The exact configuration shown in the "Basic usage" / "Full configuration
// example" sections below — kept in one place so the playground's "Reset
// configuration" button can restore it precisely.
const DEFAULT_CONFIG = {
  radius: 180,
  softness: 35,
  darkness: 1,
  intensity: 1,
  shape: 'circle',
  touch: true,
  touchBehavior: 'follow',
  onPointerLeave: 'freeze',
  cursor: { hide: false },
};

// Blackout starts OFF. `enabled: false` is passed explicitly — this is not
// `Blackout.init({ enabled: true })` or any other auto-activation; the
// overlay is mounted but stays fully transparent/inactive until the
// visitor clicks "Turn On Blackout" below, which calls `blackout.enable()`.
const blackout = Blackout.init({ ...DEFAULT_CONFIG, enabled: false });

// --- Hero: the single primary interaction on the page ---------------------

const heroCta = document.getElementById('hero-cta');
const ctaLabel = heroCta.querySelector('.cta-button__label');
const ctaHint = document.getElementById('cta-hint');
const revealHint = document.getElementById('reveal-hint');
const statusChip = document.getElementById('status-chip');

let revealHintTimer = null;

function showRevealHint() {
  revealHint.classList.add('is-visible');
  window.addEventListener('pointermove', hideRevealHint, { once: true, passive: true });
  clearTimeout(revealHintTimer);
  revealHintTimer = setTimeout(hideRevealHint, 4000);
}

function hideRevealHint() {
  revealHint.classList.remove('is-visible');
  clearTimeout(revealHintTimer);
}

function syncUI() {
  const enabled = blackout.isEnabled();

  heroCta.setAttribute('aria-pressed', String(enabled));
  ctaLabel.textContent = enabled ? 'Turn Off Blackout' : 'Turn On Blackout';
  ctaHint.textContent = enabled
    ? 'Move your cursor to reveal the page.'
    : 'Click to activate the flashlight.';

  statusChip.dataset.state = enabled ? 'on' : 'off';
  statusChip.setAttribute('aria-pressed', String(enabled));
  statusChip.innerHTML = `<span class="status-dot" aria-hidden="true"></span>Blackout: ${
    enabled ? 'on' : 'off'
  }`;
}

// The instance's own event API drives the UI, rather than re-deriving state
// after every call site — this is the real `on()` API documented below.
blackout.on('enable', () => {
  syncUI();
  showRevealHint();
});
blackout.on('disable', () => {
  syncUI();
  hideRevealHint();
});

function toggleBlackout() {
  if (blackout.isEnabled()) {
    blackout.disable();
  } else {
    blackout.enable();
  }
}

heroCta.addEventListener('click', toggleBlackout);
statusChip.addEventListener('click', toggleBlackout);

syncUI();

// --- Playground: sliders ---------------------------------------------------

function wireRange(id, valueId, onChange, format = (v) => String(v)) {
  const input = document.getElementById(id);
  const output = document.getElementById(valueId);
  input.addEventListener('input', () => {
    const value = Number(input.value);
    if (output) output.textContent = format(value);
    onChange(value);
  });
}

wireRange('radius', 'radius-value', (v) => blackout.setRadius(v));
wireRange('softness', 'softness-value', (v) => blackout.setSoftness(v));
wireRange(
  'darkness',
  'darkness-value',
  (v) => blackout.setDarkness(v / 100),
  (v) => (v / 100).toFixed(2)
);
wireRange(
  'intensity',
  'intensity-value',
  (v) => blackout.configure({ intensity: v / 100 }),
  (v) => (v / 100).toFixed(2)
);

// --- Playground: segmented controls ----------------------------------------

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

wireSegmented('[data-shape]', (data) => blackout.configure({ shape: data.shape }));
wireSegmented('[data-cursor]', (data) =>
  blackout.configure({ cursor: { hide: data.cursor === 'hidden' } })
);
wireSegmented('[data-leave]', (data) => blackout.configure({ onPointerLeave: data.leave }));

const touchCheckbox = document.getElementById('touch-enabled');
touchCheckbox.addEventListener('change', () => {
  blackout.configure({ touch: touchCheckbox.checked });
});

// --- Playground: reset -------------------------------------------------

const resetButton = document.getElementById('reset-config');
resetButton.addEventListener('click', () => {
  blackout.configure(DEFAULT_CONFIG);

  document.getElementById('radius').value = String(DEFAULT_CONFIG.radius);
  document.getElementById('radius-value').textContent = String(DEFAULT_CONFIG.radius);
  document.getElementById('softness').value = String(DEFAULT_CONFIG.softness);
  document.getElementById('softness-value').textContent = String(DEFAULT_CONFIG.softness);
  document.getElementById('darkness').value = String(DEFAULT_CONFIG.darkness * 100);
  document.getElementById('darkness-value').textContent = DEFAULT_CONFIG.darkness.toFixed(2);
  document.getElementById('intensity').value = String(DEFAULT_CONFIG.intensity * 100);
  document.getElementById('intensity-value').textContent = DEFAULT_CONFIG.intensity.toFixed(2);
  touchCheckbox.checked = DEFAULT_CONFIG.touch;

  document.querySelectorAll('[data-shape]').forEach((b) => b.classList.remove('is-active'));
  document.querySelector(`[data-shape="${DEFAULT_CONFIG.shape}"]`)?.classList.add('is-active');

  document.querySelectorAll('[data-cursor]').forEach((b) => b.classList.remove('is-active'));
  document
    .querySelector(`[data-cursor="${DEFAULT_CONFIG.cursor.hide ? 'hidden' : 'visible'}"]`)
    ?.classList.add('is-active');

  document.querySelectorAll('[data-leave]').forEach((b) => b.classList.remove('is-active'));
  document.querySelector(`[data-leave="${DEFAULT_CONFIG.onPointerLeave}"]`)?.classList.add('is-active');
});

// --- Theme toggle: deliberately independent of Blackout --------------------
// This is the point of the "not a dark mode library" section: switching the
// page's own theme never calls into Blackout at all. The flashlight simply
// keeps revealing whatever the browser is currently rendering.

const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  themeToggle.setAttribute('aria-pressed', String(next === 'light'));
  themeToggle.textContent = next === 'light' ? 'Dark page' : 'Light page';
});

// --- Real, current bundle size + version (from the actual build output) ---

const bundleSizeCopy = document.getElementById('bundle-size-copy');
const footerVersion = document.getElementById('footer-version');
const footerVersionMeta = document.getElementById('footer-version-meta');

fetch('./vendor/meta.json')
  .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not found'))))
  .then((meta) => {
    const { esm, cdnGlobal } = meta.bundleSizes;
    bundleSizeCopy.textContent = `~${esm}KB gzipped (ESM core build), ~${cdnGlobal}KB for the CDN/IIFE build. No canvas, no WebGL, no runtime dependencies.`;
    if (meta.version) {
      if (footerVersion) footerVersion.textContent = meta.version;
      if (footerVersionMeta) footerVersionMeta.textContent = meta.version;
    }
  })
  .catch(() => {
    bundleSizeCopy.textContent =
      'Run "npm run demo" (which builds the package first) to see the current gzipped size here.';
  });
