/**
 * @fileoverview Upgrade system for the clicker game engine.
 * Manages purchasable upgrades that enhance game progression.
 */

import { Upgrade } from '../core/types';
import { EventBus, GameEvents } from '../core/EventBus';
import { CurrencyManager } from './CurrencyManager';

/**
 * UpgradeManager - Handles all upgrade operations
 * 
 * This system manages upgrades, their costs, levels, and effects.
 * It integrates with currency and event systems.
 * 
 * @example
 * ```typescript
 * const upgradeManager = new UpgradeManager(eventBus, currencyManager);
 * 
 * upgradeManager.addUpgrade({
 *   id: 'click-power',
 *   name: 'Click Power',
 *   description: 'Increase clicks by 10%',
 *   cost: 100,
 *   currencyId: 'gold',
 *   level: 0,
 *   purchased: false,
 *   effect: 1.1,
 *   scalable: true,
 *   scaleFactor: 1.15
 * });
 * 
 * upgradeManager.purchase('click-power');
 * ```
 */
export class UpgradeManager {
  /** Map of upgrade ID to upgrade data */
  private upgrades: Map<string, Upgrade> = new Map();

  /**
   * Create a new UpgradeManager
   * @param eventBus - The event bus for emitting events
   * @param currencyManager - The currency manager for cost validation
   */
  constructor(
    private eventBus: EventBus,
    private currencyManager: CurrencyManager
  ) {}

  /**
   * Register a new upgrade in the game
   * @param upgrade - Upgrade configuration
   * @throws Error if upgrade with same ID already exists
   */
  public addUpgrade(upgrade: Upgrade): void {
    if (this.upgrades.has(upgrade.id)) {
      throw new Error(`Upgrade with ID '${upgrade.id}' already exists`);
    }
    this.upgrades.set(upgrade.id, { ...upgrade });
    this.eventBus.emit(GameEvents.UPGRADE_AVAILABLE, { upgradeId: upgrade.id });
  }

  /**
   * Get upgrade data
   * @param upgradeId - ID of upgrade to retrieve
   * @returns Upgrade object or undefined if not found
   */
  public getUpgrade(upgradeId: string): Upgrade | undefined {
    return this.upgrades.get(upgradeId);
  }

  /**
   * Purchase/level up an upgrade
   * @param upgradeId - ID of upgrade to purchase
   * @returns true if purchase successful, false if not enough currency
   */
  public purchase(upgradeId: string): boolean {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade) {
      throw new Error(`Upgrade '${upgradeId}' does not exist`);
    }

    // Calculate current cost
    const cost = this.calculateCost(upgrade);

    // Check if player has enough currency
    if (!this.currencyManager.has(upgrade.currencyId, cost)) {
      return false;
    }

    // Deduct currency
    this.currencyManager.subtract(upgrade.currencyId, cost);

    // Upgrade state
    upgrade.level += 1;
    upgrade.purchased = true;

    this.eventBus.emit(GameEvents.UPGRADE_PURCHASED, {
      upgradeId,
      level: upgrade.level,
      cost
    });

    this.eventBus.emit(GameEvents.UPGRADE_LEVELED, {
      upgradeId,
      newLevel: upgrade.level,
      effect: upgrade.effect
    });

    return true;
  }

  /**
   * Calculate the current cost of an upgrade
   * @param upgrade - The upgrade to calculate cost for
   * @returns Current cost considering scaling
   */
  public calculateCost(upgrade: Upgrade): number {
    if (!upgrade.scalable) {
      return upgrade.cost;
    }

    const scaleFactor = upgrade.scaleFactor ?? 1.15;
    return Math.ceil(upgrade.cost * Math.pow(scaleFactor, upgrade.level));
  }

  /**
   * Get all upgrades
   * @returns Array of all upgrades
   */
  public getAll(): Upgrade[] {
    return Array.from(this.upgrades.values());
  }

  /**
   * Get upgrades filtered by criteria
   * @param filter - Filter function
   * @returns Filtered array of upgrades
   */
  public getFiltered(filter: (upgrade: Upgrade) => boolean): Upgrade[] {
    return this.getAll().filter(filter);
  }

  /**
   * Get purchased upgrades
   * @returns Array of upgrades that have been purchased
   */
  public getPurchased(): Upgrade[] {
    return this.getFiltered(u => u.purchased);
  }

  /**
   * Get total effect from upgrades by ID pattern
   * @param pattern - Upgrade ID pattern or exact ID
   * @returns Combined effect value (multiplied together)
   */
  public getTotalEffect(pattern: string): number {
    const upgrades = this.getAll().filter(u => u.id.startsWith(pattern));
    return upgrades.reduce((total, u) => total * u.effect, 1);
  }

  /**
   * Set upgrade level directly
   * @param upgradeId - ID of upgrade
   * @param level - New level
   */
  public setLevel(upgradeId: string, level: number): void {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade) {
      throw new Error(`Upgrade '${upgradeId}' does not exist`);
    }
    upgrade.level = Math.max(0, level);
  }

  /**
   * Reset all upgrades (usually for paradigm shift)
   */
  public reset(): void {
    this.upgrades.forEach(upgrade => {
      upgrade.level = 0;
      upgrade.purchased = false;
    });
  }

  /**
   * Remove an upgrade
   * @param upgradeId - ID of upgrade to remove
   */
  public removeUpgrade(upgradeId: string): void {
    this.upgrades.delete(upgradeId);
  }

  /**
   * Clear all upgrades
   */
  public clear(): void {
    this.upgrades.clear();
  }

  /**
   * Get upgrade as record (for serialization)
   * @returns Record of upgrade ID to level
   */
  public getAsRecord(): Record<string, number> {
    const record: Record<string, number> = {};
    this.upgrades.forEach((upgrade, id) => {
      record[id] = upgrade.level;
    });
    return record;
  }
}
