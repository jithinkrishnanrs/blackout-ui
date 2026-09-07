import { expect, test } from '@playwright/test';

test.describe('Blackout UI overlay', () => {
  test('creates a full-viewport overlay above the page', async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('.blackout-ui-root');
    await expect(overlay).toBeAttached();
    const box = await overlay.boundingBox();
    const viewport = page.viewportSize();
    expect(box?.width).toBeGreaterThanOrEqual((viewport?.width ?? 0) - 1);
    expect(box?.height).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 1);
  });

  test('overlay is aria-hidden and outside the accessibility tree', async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('.blackout-ui-root');
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  test('does not intercept pointer events (buttons remain clickable underneath)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.mouse.move(300, 300);
    const toggle = page.locator('#theme-toggle');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('links and inputs underneath the overlay remain functional', async ({ page }) => {
    await page.goto('/');
    const radius = page.locator('#radius');
    await radius.fill('300');
    await expect(page.locator('#radius-value')).toHaveText('300');
  });

  test('the flashlight follows the pointer', async ({ page }) => {
    await page.goto('/');
    await page.mouse.move(100, 100);
    const bg1 = await page.locator('.blackout-ui-root').evaluate((el) => el.style.background);
    await page.mouse.move(600, 400);
    const bg2 = await page.locator('.blackout-ui-root').evaluate((el) => el.style.background);
    expect(bg1).not.toEqual(bg2);
    expect(bg2).toContain('600px 400px');
  });

  test('text selection still works through the overlay', async ({ page }) => {
    await page.goto('/');
    await page.mouse.move(400, 300);
    const heading = page.locator('.hero__tagline');
    await heading.selectText();
    const selected = await page.evaluate(() => window.getSelection()?.toString());
    expect(selected?.length ?? 0).toBeGreaterThan(0);
  });

  test('scrolling works normally with the overlay enabled', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 2000);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
    // Overlay stays pinned to the viewport, not the document.
    const overlayTop = await page
      .locator('.blackout-ui-root')
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(overlayTop).toBe(0);
  });

  test('keyboard navigation (Tab) is not trapped by the overlay', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(active).not.toBe('DIV'); // never lands on the (non-focusable) overlay div
  });

  test('theme switching keeps the flashlight working without special-casing', async ({
    page,
  }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.mouse.move(200, 200);
    await expect(page.locator('.blackout-ui-root')).toBeAttached();
    const bg = await page.locator('.blackout-ui-root').evaluate((el) => el.style.background);
    expect(bg).toContain('radial-gradient');
  });

  test('disabling blackout hides the overlay effect without removing it', async ({ page }) => {
    await page.goto('/');
    await page.click('#blackout-toggle');
    await expect(page.locator('.blackout-ui-root')).toHaveAttribute(
      'data-blackout-enabled',
      'false'
    );
  });

  test('no horizontal scrollbar is introduced by the overlay', async ({ page }) => {
    await page.goto('/');
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('mobile / touch', () => {
  test.use({ hasTouch: true });

  test('touch input moves the flashlight', async ({ page }) => {
    await page.goto('/');
    await page.touchscreen.tap(150, 250);
    await expect(page.locator('.blackout-ui-root')).toBeAttached();
  });
});
