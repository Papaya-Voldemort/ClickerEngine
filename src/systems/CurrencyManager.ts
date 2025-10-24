/**
 * @fileoverview Currency system for the clicker game engine.
 * Manages all in-game currencies and their operations.
 */

import { Currency } from '../core/types';
import { EventBus, GameEvents } from '../core/EventBus';

/**
 * CurrencyManager - Handles all currency operations
 * 
 * This system manages multiple currencies, tracks amounts,
 * and notifies other systems of changes.
 * 
 * @example
 * ```typescript
 * const currencyManager = new CurrencyManager(eventBus);
 * 
 * currencyManager.addCurrency({
 *   id: 'gold',
 *   name: 'Gold',
 *   amount: 0,
 *   symbol: '💰'
 * });
 * 
 * currencyManager.add('gold', 100);
 * console.log(currencyManager.get('gold')); // 100
 * ```
 */
export class CurrencyManager {
  /** Map of currency ID to currency data */
  private currencies: Map<string, Currency> = new Map();

  /**
   * Create a new CurrencyManager
   * @param eventBus - The event bus for emitting events
   */
  constructor(private eventBus: EventBus) {}

  /**
   * Register a new currency in the game
   * @param currency - Currency configuration
   * @throws Error if currency with same ID already exists
   */
  public addCurrency(currency: Currency): void {
    if (this.currencies.has(currency.id)) {
      throw new Error(`Currency with ID '${currency.id}' already exists`);
    }
    this.currencies.set(currency.id, { ...currency });
    this.eventBus.emit(GameEvents.CURRENCY_ADDED, { currencyId: currency.id });
  }

  /**
   * Remove a currency from the game
   * @param currencyId - ID of currency to remove
   */
  public removeCurrency(currencyId: string): void {
    this.currencies.delete(currencyId);
    this.eventBus.emit(GameEvents.CURRENCY_REMOVED, { currencyId });
  }

  /**
   * Get currency data
   * @param currencyId - ID of currency to retrieve
   * @returns Currency object or undefined if not found
   */
  public getCurrency(currencyId: string): Currency | undefined {
    return this.currencies.get(currencyId);
  }

  /**
   * Get current amount of a currency
   * @param currencyId - ID of currency
   * @returns Current amount (0 if currency doesn't exist)
   */
  public get(currencyId: string): number {
    return this.currencies.get(currencyId)?.amount ?? 0;
  }

  /**
   * Set currency amount to exact value
   * @param currencyId - ID of currency
   * @param amount - New amount
   */
  public set(currencyId: string, amount: number): void {
    const currency = this.currencies.get(currencyId);
    if (!currency) {
      throw new Error(`Currency '${currencyId}' does not exist`);
    }
    
    const oldAmount = currency.amount;
    currency.amount = Math.max(0, amount);
    
    this.eventBus.emit(GameEvents.CURRENCY_CHANGED, {
      currencyId,
      oldAmount,
      newAmount: currency.amount,
      change: currency.amount - oldAmount
    });
  }

  /**
   * Add amount to currency
   * @param currencyId - ID of currency
   * @param amount - Amount to add
   * @returns New total amount
   */
  public add(currencyId: string, amount: number): number {
    const currency = this.currencies.get(currencyId);
    if (!currency) {
      throw new Error(`Currency '${currencyId}' does not exist`);
    }

    const oldAmount = currency.amount;
    currency.amount += amount;

    this.eventBus.emit(GameEvents.CURRENCY_CHANGED, {
      currencyId,
      oldAmount,
      newAmount: currency.amount,
      change: amount
    });

    return currency.amount;
  }

  /**
   * Remove amount from currency
   * @param currencyId - ID of currency
   * @param amount - Amount to remove
   * @returns New total amount (won't go below 0)
   */
  public subtract(currencyId: string, amount: number): number {
    const currency = this.currencies.get(currencyId);
    if (!currency) {
      throw new Error(`Currency '${currencyId}' does not exist`);
    }

    const oldAmount = currency.amount;
    currency.amount = Math.max(0, currency.amount - amount);

    this.eventBus.emit(GameEvents.CURRENCY_CHANGED, {
      currencyId,
      oldAmount,
      newAmount: currency.amount,
      change: -amount
    });

    return currency.amount;
  }

  /**
   * Check if player has enough of a currency
   * @param currencyId - ID of currency
   * @param amount - Amount needed
   * @returns Whether player has enough
   */
  public has(currencyId: string, amount: number): boolean {
    return this.get(currencyId) >= amount;
  }

  /**
   * Get all currencies
   * @returns Array of all currencies
   */
  public getAll(): Currency[] {
    return Array.from(this.currencies.values());
  }

  /**
   * Get all currencies as a record
   * @returns Record of currency ID to amount
   */
  public getAllAsRecord(): Record<string, number> {
    const record: Record<string, number> = {};
    this.currencies.forEach((currency, id) => {
      record[id] = currency.amount;
    });
    return record;
  }

  /**
   * Format a currency amount for display
   * @param currencyId - ID of currency
   * @param amount - Amount to format
   * @returns Formatted string with symbol
   */
  public format(currencyId: string, amount: number): string {
    const currency = this.currencies.get(currencyId);
    if (!currency) return amount.toString();

    if (currency.formatter) {
      return currency.formatter(amount);
    }

    return `${currency.symbol}${this.abbreviateNumber(amount)}`;
  }

  /**
   * Abbreviate large numbers for display
   * @param num - Number to abbreviate
   * @returns Abbreviated string (e.g., "1.2K", "3.4M")
   */
  private abbreviateNumber(num: number): string {
    if (num < 1000) return num.toFixed(0);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
  }

  /**
   * Clear all currencies (usually for reset)
   */
  public clear(): void {
    this.currencies.clear();
  }
}
