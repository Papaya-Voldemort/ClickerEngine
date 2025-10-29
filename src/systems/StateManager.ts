/**
 * @fileoverview State management system for the clicker game engine.
 * Handles saving, loading, and serialization of game state.
 */

import { GameState } from '../core/types';
import { EventBus, GameEvents } from '../core/EventBus';
import { CurrencyManager } from './CurrencyManager';
import { UpgradeManager } from './UpgradeManager';
import { ParadigmManager } from './ParadigmManager';
import { AchievementManager } from './AchievementManager';
import { StatisticsManager } from './StatisticsManager';

/**
 * StateManager - Handles game state persistence
 * 
 * Manages saving and loading of game state to/from storage
 * (localStorage, file, server, etc.)
 * 
 * @example
 * ```typescript
 * const stateManager = new StateManager(
 *   eventBus,
 *   currencyManager,
 *   upgradeManager,
 *   paradigmManager
 * );
 * 
 * // Auto-save every 30 seconds
 * setInterval(() => stateManager.save(), 30000);
 * 
 * // Load on startup
 * stateManager.load();
 * ```
 */
export class StateManager {
  /** Callback for storage operations */
  private storageAdapter: StorageAdapter = new LocalStorageAdapter();

  /**
   * Create a new StateManager
   * @param eventBus - The event bus for emitting events
   * @param currencyManager - The currency manager
   * @param upgradeManager - The upgrade manager
   * @param paradigmManager - The paradigm manager
   * @param achievementManager - The achievement manager (optional)
   * @param statisticsManager - The statistics manager (optional)
   */
  constructor(
    private eventBus: EventBus,
    private currencyManager: CurrencyManager,
    private upgradeManager: UpgradeManager,
    private paradigmManager: ParadigmManager,
    private achievementManager?: AchievementManager,
    private statisticsManager?: StatisticsManager
  ) {}

  /**
   * Set custom storage adapter
   * @param adapter - Storage adapter implementation
   */
  public setStorageAdapter(adapter: StorageAdapter): void {
    this.storageAdapter = adapter;
  }

  /**
   * Create a game state snapshot
   * @param customState - Additional custom state to include
   * @returns Game state object
   */
  public snapshot(customState?: Record<string, unknown>): GameState {
    const current = this.paradigmManager.getCurrent();
    
    return {
      timestamp: Date.now(),
      currencies: this.currencyManager.getAllAsRecord(),
      upgrades: this.upgradeManager.getAsRecord(),
      currentParadigm: current?.id ?? 'default',
      totalClicks: 0, // Should be tracked by main engine
      achievements: this.achievementManager?.serialize(),
      statistics: this.statisticsManager?.serialize(),
      custom: customState
    };
  }

  /**
   * Save current game state
   * @param key - Storage key (default: 'game-state')
   * @param customState - Additional custom state to save
   */
  public save(key: string = 'game-state', customState?: Record<string, unknown>): void {
    try {
      const state = this.snapshot(customState);
      this.storageAdapter.save(key, state);
      this.eventBus.emit(GameEvents.STATE_SAVED, { key, timestamp: state.timestamp });
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  /**
   * Load game state
   * @param key - Storage key (default: 'game-state')
   * @returns Loaded state or null if not found
   */
  public load(key: string = 'game-state'): GameState | null {
    try {
      const state = this.storageAdapter.load(key);
      if (!state) return null;

      // Restore currencies
      Object.entries(state.currencies).forEach(([currencyId, amount]) => {
        this.currencyManager.set(currencyId, amount);
      });

      // Restore upgrades
      Object.entries(state.upgrades).forEach(([upgradeId, level]) => {
        this.upgradeManager.setLevel(upgradeId, level);
      });

      // Restore paradigm
      if (state.currentParadigm && this.paradigmManager.isAvailable(state.currentParadigm)) {
        this.paradigmManager.switchTo(state.currentParadigm);
      }

      // Restore achievements
      if (state.achievements && this.achievementManager) {
        this.achievementManager.deserialize(state.achievements);
      }

      // Restore statistics
      if (state.statistics && this.statisticsManager) {
        this.statisticsManager.deserialize(state.statistics);
      }

      this.eventBus.emit(GameEvents.STATE_LOADED, { key, timestamp: state.timestamp });
      return state;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  /**
   * Delete saved state
   * @param key - Storage key
   */
  public delete(key: string = 'game-state'): void {
    try {
      this.storageAdapter.delete(key);
    } catch (error) {
      console.error('Failed to delete game state:', error);
    }
  }

  /**
   * Check if state exists
   * @param key - Storage key
   * @returns Whether state exists
   */
  public exists(key: string = 'game-state'): boolean {
    return this.storageAdapter.exists(key);
  }
}

/**
 * Interface for storage adapters
 * Allows pluggable storage backends
 */
export interface StorageAdapter {
  save(key: string, state: GameState): void;
  load(key: string): GameState | null;
  delete(key: string): void;
  exists(key: string): boolean;
}

/**
 * LocalStorage adapter implementation
 */
class LocalStorageAdapter implements StorageAdapter {
  public save(key: string, state: GameState): void {
    localStorage.setItem(key, JSON.stringify(state));
  }

  public load(key: string): GameState | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as GameState : null;
  }

  public delete(key: string): void {
    localStorage.removeItem(key);
  }

  public exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * Memory adapter for testing (doesn't persist)
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, GameState> = new Map();

  public save(key: string, state: GameState): void {
    this.storage.set(key, state);
  }

  public load(key: string): GameState | null {
    return this.storage.get(key) ?? null;
  }

  public delete(key: string): void {
    this.storage.delete(key);
  }

  public exists(key: string): boolean {
    return this.storage.has(key);
  }
}
