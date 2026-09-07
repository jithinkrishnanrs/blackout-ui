# React example

```bash
npm install blackout-ui
```

```jsx
import { useEffect } from 'react';
import Blackout from 'blackout-ui';

useEffect(() => {
  Blackout.init({ radius: 200 });
  return () => Blackout.destroy();
}, []);
```

See `App.jsx` for a small `useBlackout` hook you can copy into your project.
`init()`/`destroy()` are idempotent and fully reversible, so this survives
React 18 Strict Mode's double-invoke in development without leaking a
second overlay.
