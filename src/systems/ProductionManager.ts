/**
 * @fileoverview Production system for the clicker game engine.
 * Handles passive production and click mechanics.
 */

import { EventBus, GameEvents } from '../core/EventBus';
import { CurrencyManager } from './CurrencyManager';
import { UpgradeManager } from './UpgradeManager';
import { ParadigmManager } from './ParadigmManager';

/**
 * ProductionManager - Handles passive and active production
 * 
 * Manages production ticks, click generation, and multiplier calculations.
 * Integrates with currency, upgrade, and paradigm systems.
 * 
 * @example
 * ```typescript
 * const productionManager = new ProductionManager(
 *   eventBus,
 *   currencyManager,
 *   upgradeManager,
 *   paradigmManager
 * );
 * 
 * productionManager.setProductionRate('gold', 10); // 10 per second
 * productionManager.tick(1000); // 1 second has passed
 * 
 * productionManager.click('gold'); // Player clicked
 * ```
 */
export class ProductionManager {
  /** Production rate per second for each currency */
  private productionRates: Map<string, number> = new Map();
  
  /** Click value multiplier for each currency */
  private clickMultipliers: Map<string, number> = new Map();
  
  /** Total accumulated time since last tick */
  private accumulatedTime: number = 0;

  /**
   * Create a new ProductionManager
   * @param eventBus - The event bus for emitting events
   * @param currencyManager - The currency manager
   * @param upgradeManager - The upgrade manager
   * @param paradigmManager - The paradigm manager
   */
  constructor(
    private eventBus: EventBus,
    private currencyManager: CurrencyManager,
    private upgradeManager: UpgradeManager,
    private paradigmManager: ParadigmManager
  ) {}

  /**
   * Set production rate for a currency (passive generation)
   * @param currencyId - ID of currency to produce
   * @param rate - Amount to produce per second
   */
  public setProductionRate(currencyId: string, rate: number): void {
    this.productionRates.set(currencyId, rate);
    this.eventBus.emit(GameEvents.PRODUCTION_CHANGED, { currencyId, rate });
  }

  /**
   * Get production rate for a currency
   * @param currencyId - ID of currency
   * @returns Production rate per second
   */
  public getProductionRate(currencyId: string): number {
    return this.productionRates.get(currencyId) ?? 0;
  }

  /**
   * Set click multiplier for a currency
   * @param currencyId - ID of currency
   * @param multiplier - Click value multiplier (e.g., 1.5 = 50% more)
   */
  public setClickMultiplier(currencyId: string, multiplier: number): void {
    this.clickMultipliers.set(currencyId, multiplier);
    this.eventBus.emit(GameEvents.CLICK_MULTIPLIER_CHANGED, {
      currencyId,
      multiplier
    });
  }

  /**
   * Get click multiplier for a currency
   * @param currencyId - ID of currency
   * @returns Click multiplier
   */
  public getClickMultiplier(currencyId: string): number {
    return this.clickMultipliers.get(currencyId) ?? 1;
  }

  /**
   * Process a game tick (passive production)
   * @param deltaTimeMs - Time elapsed since last tick in milliseconds
   */
  public tick(deltaTimeMs: number): void {
    const deltaSeconds = deltaTimeMs / 1000;
    const paradigmMultiplier = this.paradigmManager.getCurrentMultiplier();

    this.productionRates.forEach((rate, currencyId) => {
      if (rate > 0) {
        const productionAmount = rate * deltaSeconds * paradigmMultiplier;
        this.currencyManager.add(currencyId, productionAmount);
      }
    });

    this.eventBus.emit(GameEvents.PRODUCTION_TICK, { deltaTimeMs });
  }

  /**
   * Process a player click
   * @param currencyId - Currency to add to
   * @param baseAmount - Base amount per click (default 1)
   */
  public click(currencyId: string, baseAmount: number = 1): void {
    const clickMultiplier = this.getClickMultiplier(currencyId);
    const paradigmMultiplier = this.paradigmManager.getCurrentMultiplier();
    
    const finalAmount = baseAmount * clickMultiplier * paradigmMultiplier;
    
    this.currencyManager.add(currencyId, finalAmount);

    this.eventBus.emit(GameEvents.CLICK, {
      currencyId,
      baseAmount,
      clickMultiplier,
      paradigmMultiplier,
      finalAmount
    });
  }

  /**
   * Calculate total production per second (for display)
   * @param currencyId - Currency ID
   * @returns Production per second considering all multipliers
   */
  public getDisplayProduction(currencyId: string): number {
    const baseRate = this.getProductionRate(currencyId);
    const paradigmMultiplier = this.paradigmManager.getCurrentMultiplier();
    return baseRate * paradigmMultiplier;
  }

  /**
   * Get all production rates
   * @returns Record of currency ID to production rate
   */
  public getAllProductionRates(): Record<string, number> {
    const record: Record<string, number> = {};
    this.productionRates.forEach((rate, id) => {
      record[id] = rate;
    });
    return record;
  }

  /**
   * Clear all production rates (usually for reset)
   */
  public clear(): void {
    this.productionRates.clear();
    this.clickMultipliers.clear();
  }
}
