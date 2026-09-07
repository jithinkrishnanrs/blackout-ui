import type { BlackoutEventListener, BlackoutEventMap, BlackoutEventName } from './types';

/** Tiny synchronous pub/sub. No dependency, no wildcard matching, no queueing. */
export class EventEmitter {
  private readonly listeners = new Map<BlackoutEventName, Set<(payload: unknown) => void>>();

  on<E extends BlackoutEventName>(event: E, listener: BlackoutEventListener<E>): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as (payload: unknown) => void);
  }

  off<E extends BlackoutEventName>(event: E, listener: BlackoutEventListener<E>): void {
    this.listeners.get(event)?.delete(listener as (payload: unknown) => void);
  }

  emit<E extends BlackoutEventName>(event: E, payload: BlackoutEventMap[E]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    // Copy before iterating so a listener removing itself mid-emit is safe.
    for (const listener of [...set]) {
      listener(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
