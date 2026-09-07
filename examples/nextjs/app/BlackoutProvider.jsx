'use client';

import { useEffect } from 'react';
import Blackout from 'blackout-ui';

/**
 * Next.js renders this component on the server first. Blackout UI's
 * methods are no-ops there (nothing touches `window`/`document` until a
 * method runs in the browser), so the import itself is safe. The `'use
 * client'` directive plus mounting inside `useEffect` ensures `init()`
 * only actually runs once hydrated in the browser.
 */
export function BlackoutProvider({ children, options }) {
  useEffect(() => {
    Blackout.init(options);
    return () => {
      Blackout.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
