/**
 * @fileoverview Event system for the clicker game engine.
 * Implements a pub/sub pattern for loose coupling between systems.
 */

import { Observer, GameEvent } from './types';

/**
 * EventBus - Central event system for the game engine
 * 
 * Implements the Observer pattern to allow different systems
 * to communicate without direct dependencies.
 * 
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 * 
 * // Subscribe to events
 * eventBus.on('currency-added', (data) => {
 *   console.log('Currency added:', data);
 * });
 * 
 * // Emit events
 * eventBus.emit('currency-added', { currencyId: 'gold', amount: 100 });
 * ```
 */
export class EventBus {
  /** Map of event types to their observers */
  private observers: Map<string, Set<Observer<any>>> = new Map();

  /**
   * Subscribe to an event type
   * @param eventType - The type of event to listen for
   * @param observer - Callback function when event is emitted
   * @returns Unsubscribe function
   */
  public on<T = unknown>(eventType: string, observer: Observer<T>): () => void {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, new Set());
    }
    this.observers.get(eventType)!.add(observer);

    // Return unsubscribe function
    return () => this.off(eventType, observer);
  }

  /**
   * Subscribe to an event that only fires once
   * @param eventType - The type of event to listen for
   * @param observer - Callback function when event is emitted
   */
  public once<T = unknown>(eventType: string, observer: Observer<T>): void {
    const wrapper: Observer<T> = (data: T) => {
      observer(data);
      this.off(eventType, wrapper);
    };
    this.on(eventType, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param eventType - The type of event
   * @param observer - The observer to remove
   */
  public off<T = unknown>(eventType: string, observer: Observer<T>): void {
    if (!this.observers.has(eventType)) return;
    this.observers.get(eventType)!.delete(observer);
  }

  /**
   * Emit an event to all subscribers
   * @param eventType - The type of event
   * @param data - Data to pass to observers
   */
  public emit<T = unknown>(eventType: string, data?: T): void {
    if (!this.observers.has(eventType)) return;
    
    const observers = Array.from(this.observers.get(eventType)!);
    observers.forEach(observer => {
      try {
        observer(data);
      } catch (error) {
        console.error(`Error in observer for event '${eventType}':`, error);
      }
    });
  }

  /**
   * Clear all observers for a specific event type
   * @param eventType - The event type to clear (optional, clears all if omitted)
   */
  public clear(eventType?: string): void {
    if (eventType) {
      this.observers.delete(eventType);
    } else {
      this.observers.clear();
    }
  }

  /**
   * Get count of observers for debugging
   */
  public getObserverCount(eventType: string): number {
    return this.observers.get(eventType)?.size ?? 0;
  }
}

/**
 * Standard game engine events
 */
export const GameEvents = {
  // Lifecycle
  GAME_INITIALIZED: 'game:initialized',
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  GAME_RESET: 'game:reset',

  // Currency events
  CURRENCY_ADDED: 'currency:added',
  CURRENCY_REMOVED: 'currency:removed',
  CURRENCY_CHANGED: 'currency:changed',

  // Upgrade events
  UPGRADE_PURCHASED: 'upgrade:purchased',
  UPGRADE_LEVELED: 'upgrade:leveled',
  UPGRADE_AVAILABLE: 'upgrade:available',

  // Click events
  CLICK: 'game:click',
  CLICK_MULTIPLIER_CHANGED: 'game:clickMultiplierChanged',

  // Paradigm events
  PARADIGM_CHANGED: 'paradigm:changed',
  PARADIGM_RESET: 'paradigm:reset',

  // UI events
  TAB_SWITCHED: 'ui:tabSwitched',
  UI_UPDATED: 'ui:updated',

  // Production events
  PRODUCTION_TICK: 'production:tick',
  PRODUCTION_CHANGED: 'production:changed',

  // State events
  STATE_SAVED: 'state:saved',
  STATE_LOADED: 'state:loaded'
} as const;
