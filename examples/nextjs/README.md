# Next.js example (App Router)

```bash
npm install blackout-ui
```

`Blackout.init()` must only run in the browser. `BlackoutProvider.jsx` is a
`'use client'` component that calls `init()`/`destroy()` inside `useEffect`,
so it's safe to import from a server-rendered layout — see `layout.jsx`.

The package itself is also safe to import directly in server components;
every method is a documented no-op when `window`/`document` don't exist.
