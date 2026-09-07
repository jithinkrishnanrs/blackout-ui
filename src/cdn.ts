import Blackout from './index';

// A single default export lets esbuild's IIFE output assign the global
// directly (`window.BlackoutUI = Blackout`) instead of wrapping it in a
// `{ default: ... }` namespace object.
export default Blackout;
