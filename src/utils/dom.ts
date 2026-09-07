/** Resolves once the document is ready for a `document.body.appendChild` call. */
export function whenBodyReady(callback: () => void): void {
  if (document.body) {
    callback();
    return;
  }
  document.addEventListener('DOMContentLoaded', callback, { once: true });
}
