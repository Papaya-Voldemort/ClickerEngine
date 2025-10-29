/**
 * @fileoverview Statistics tracking system for player actions
 */

import { EventBus } from '../core/EventBus';

export interface GameStatistics {
  totalClicks: number;
  totalGoldEarned: number;
  totalUpgradesPurchased: number;
  totalTimePlayed: number; // in seconds
  highestGold: number;
  paradigmChanges: number;
  prestigeCount: number;
  fastestClick: number; // clicks per second
  longestSession: number; // in seconds
}

export class StatisticsManager {
  private stats: GameStatistics;
  private eventBus: EventBus;
  private sessionStartTime: number = Date.now();
  private lastClickTime: number = 0;
  private clicksInLastSecond: number = 0;
  private clickTimeWindow: number[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.stats = {
      totalClicks: 0,
      totalGoldEarned: 0,
      totalUpgradesPurchased: 0,
      totalTimePlayed: 0,
      highestGold: 0,
      paradigmChanges: 0,
      prestigeCount: 0,
      fastestClick: 0,
      longestSession: 0
    };
  }

  /**
   * Record a click
   */
  public recordClick(): void {
    this.stats.totalClicks++;
    
    // Track clicks per second
    const now = Date.now();
    this.clickTimeWindow.push(now);
    
    // Remove clicks older than 1 second
    this.clickTimeWindow = this.clickTimeWindow.filter(t => now - t < 1000);
    
    if (this.clickTimeWindow.length > this.stats.fastestClick) {
      this.stats.fastestClick = this.clickTimeWindow.length;
    }
  }

  /**
   * Record gold earned
   */
  public recordGoldEarned(amount: number): void {
    this.stats.totalGoldEarned += amount;
  }

  /**
   * Update highest gold amount
   */
  public updateHighestGold(amount: number): void {
    if (amount > this.stats.highestGold) {
      this.stats.highestGold = amount;
    }
  }

  /**
   * Record upgrade purchase
   */
  public recordUpgradePurchase(): void {
    this.stats.totalUpgradesPurchased++;
  }

  /**
   * Record paradigm change
   */
  public recordParadigmChange(): void {
    this.stats.paradigmChanges++;
  }

  /**
   * Record prestige
   */
  public recordPrestige(): void {
    this.stats.prestigeCount++;
  }

  /**
   * Get current session time in seconds
   */
  public getCurrentSessionTime(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Update total time played
   */
  public updateTimePlayed(): void {
    const sessionTime = this.getCurrentSessionTime();
    this.stats.totalTimePlayed += sessionTime;
    
    if (sessionTime > this.stats.longestSession) {
      this.stats.longestSession = sessionTime;
    }
    
    // Reset session timer
    this.sessionStartTime = Date.now();
  }

  /**
   * Get all statistics
   */
  public getStatistics(): GameStatistics {
    return { ...this.stats };
  }

  /**
   * Get statistics with current session time
   */
  public getCurrentStatistics(): GameStatistics {
    return {
      ...this.stats,
      totalTimePlayed: this.stats.totalTimePlayed + this.getCurrentSessionTime()
    };
  }

  /**
   * Serialize statistics for saving
   */
  public serialize(): GameStatistics {
    this.updateTimePlayed();
    return { ...this.stats };
  }

  /**
   * Deserialize statistics from loading
   */
  public deserialize(stats: GameStatistics): void {
    this.stats = { ...stats };
    this.sessionStartTime = Date.now();
  }

  /**
   * Reset all statistics
   */
  public reset(): void {
    this.stats = {
      totalClicks: 0,
      totalGoldEarned: 0,
      totalUpgradesPurchased: 0,
      totalTimePlayed: 0,
      highestGold: 0,
      paradigmChanges: 0,
      prestigeCount: 0,
      fastestClick: 0,
      longestSession: 0
    };
    this.sessionStartTime = Date.now();
    this.clickTimeWindow = [];
  }
}
