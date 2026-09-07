/**
 * Hides/restores the native cursor on `<html>`. Only ever touches the one
 * inline style property it owns, and remembers the prior value so it can
 * be put back exactly as it was found — including "not set at all".
 */
export class CursorGuard {
  private previousValue: string | null = null;
  private applied = false;

  hide(): void {
    if (this.applied) return;
    const root = document.documentElement;
    this.previousValue = root.style.cursor || null;
    root.style.cursor = 'none';
    this.applied = true;
  }

  restore(): void {
    if (!this.applied) return;
    const root = document.documentElement;
    if (this.previousValue) {
      root.style.cursor = this.previousValue;
    } else {
      root.style.removeProperty('cursor');
    }
    this.applied = false;
    this.previousValue = null;
  }
}
