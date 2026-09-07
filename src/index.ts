import { Blackout as BlackoutClass, createBlackout } from './core/Blackout';
import type {
  BlackoutEventListener,
  BlackoutEventMap,
  BlackoutEventName,
  BlackoutInstance,
  BlackoutOptions,
  BlackoutShape,
  PointerLeaveBehavior,
  ResolvedBlackoutOptions,
  TouchBehavior,
} from './core/types';

/**
 * The default Blackout singleton.
 *
 * ```ts
 * import Blackout from "blackout-ui";
 * Blackout.init({ radius: 200 });
 * ```
 *
 * Importing this module is safe during SSR — nothing touches `window` or
 * `document` until you call a method, and every method is a no-op on the
 * server.
 */
const singleton: BlackoutInstance = new BlackoutClass();

export default singleton;
export { singleton as Blackout, createBlackout };
export type {
  BlackoutEventListener,
  BlackoutEventMap,
  BlackoutEventName,
  BlackoutInstance,
  BlackoutOptions,
  BlackoutShape,
  PointerLeaveBehavior,
  ResolvedBlackoutOptions,
  TouchBehavior,
};
