import { useEffect } from 'react';
import Blackout from 'blackout-ui';

/**
 * Mount Blackout UI for the lifetime of this component.
 *
 * `init()` is idempotent and `destroy()` fully tears the effect down, so
 * this pattern is safe even under React 18 Strict Mode's
 * mount → unmount → mount development cycle.
 */
export function useBlackout(options) {
  useEffect(() => {
    Blackout.init(options);
    return () => {
      Blackout.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function App() {
  useBlackout({ radius: 200, softness: 40 });

  return (
    <main>
      <h1>Blackout UI + React</h1>
      <button onClick={() => Blackout.toggle()}>Toggle blackout</button>
    </main>
  );
}
