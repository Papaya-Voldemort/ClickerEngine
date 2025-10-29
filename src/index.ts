/**
 * @fileoverview Main game engine class.
 * This is the central orchestrator that ties all systems together.
 */

import { GameConfig, Currency, Upgrade, Paradigm, UITab } from './core/types';
import { EventBus, GameEvents } from './core/EventBus';
import { CurrencyManager } from './systems/CurrencyManager';
import { UpgradeManager } from './systems/UpgradeManager';
import { ParadigmManager } from './systems/ParadigmManager';
import { ProductionManager } from './systems/ProductionManager';
import { StateManager } from './systems/StateManager';
import { UIManager } from './ui/UIManager';
import { AchievementManager, Achievement } from './systems/AchievementManager';
import { StatisticsManager, GameStatistics } from './systems/StatisticsManager';

/**
 * ClickerGameEngine - Main game engine class
 * 
 * This is the central hub that orchestrates all game systems.
 * It provides a simple interface for game developers to build
 * clicker games without worrying about the internal architecture.
 * 
 * @example
 * ```typescript
 * const game = new ClickerGameEngine({ debug: true });
 * 
 * // Add currencies
 * game.addCurrency({
 *   id: 'gold',
 *   name: 'Gold',
 *   amount: 0,
 *   symbol: '💰'
 * });
 * 
 * // Add upgrades
 * game.addUpgrade({
 *   id: 'click-power',
 *   name: 'Click Power',
 *   description: 'Increase clicks by 10%',
 *   cost: 100,
 *   currencyId: 'gold',
 *   level: 0,
 *   purchased: false,
 *   effect: 1.1
 * });
 * 
 * // Add tabs
 * game.addTab({
 *   id: 'main',
 *   name: 'Main',
 *   visible: true,
 *   active: true,
 *   order: 0
 * });
 * 
 * // Start the game loop
 * game.start();
 * ```
 */
export class ClickerGameEngine {
  /** Configuration object */
  private config: GameConfig;
  
  /** Central event bus */
  private eventBus: EventBus;
  
  /** Currency system */
  private currencyManager: CurrencyManager;
  
  /** Upgrade system */
  private upgradeManager: UpgradeManager;
  
  /** Paradigm system */
  private paradigmManager: ParadigmManager;
  
  /** Production system */
  private productionManager: ProductionManager;
  
  /** State persistence system */
  private stateManager: StateManager;
  
  /** UI system */
  private uiManager: UIManager;

  /** Achievement system */
  private achievementManager: AchievementManager;

  /** Statistics system */
  private statisticsManager: StatisticsManager;

  /** Game loop handle */
  private gameLoopHandle: number | null = null;
  
  /** Last frame timestamp */
  private lastFrameTime: number = 0;
  
  /** Whether game is running */
  private isRunning: boolean = false;
  
  /** Total clicks counter */
  private totalClicks: number = 0;

  /**
   * Create a new ClickerGameEngine instance
   * @param config - Game configuration
   */
  constructor(config: GameConfig = {}) {
    this.config = {
      debug: false,
      autoSaveInterval: 30000, // 30 seconds
      ...config
    };

    // Initialize all systems
    this.eventBus = new EventBus();
    this.currencyManager = new CurrencyManager(this.eventBus);
    this.upgradeManager = new UpgradeManager(this.eventBus, this.currencyManager);
    this.paradigmManager = new ParadigmManager(this.eventBus);
    this.achievementManager = new AchievementManager(this.eventBus);
    this.statisticsManager = new StatisticsManager(this.eventBus);
    this.productionManager = new ProductionManager(
      this.eventBus,
      this.currencyManager,
      this.upgradeManager,
      this.paradigmManager
    );
    this.stateManager = new StateManager(
      this.eventBus,
      this.currencyManager,
      this.upgradeManager,
      this.paradigmManager,
      this.achievementManager,
      this.statisticsManager
    );
    this.uiManager = new UIManager(this.eventBus);

    this.log('Game engine initialized');
    this.eventBus.emit(GameEvents.GAME_INITIALIZED, {});
  }

  // ============================================================
  // CURRENCY MANAGEMENT
  // ============================================================

  /**
   * Add a new currency to the game
   * @param currency - Currency configuration
   */
  public addCurrency(currency: Currency): void {
    this.currencyManager.addCurrency(currency);
  }

  /**
   * Get currency data
   * @param currencyId - Currency ID
   * @returns Currency object or undefined
   */
  public getCurrency(currencyId: string): Currency | undefined {
    return this.currencyManager.getCurrency(currencyId);
  }

  /**
   * Get all currencies
   * @returns Array of all currencies
   */
  public getCurrencies(): Currency[] {
    return this.currencyManager.getAll();
  }

  /**
   * Get current amount of a currency
   * @param currencyId - Currency ID
   * @returns Current amount
   */
  public getCurrencyAmount(currencyId: string): number {
    return this.currencyManager.get(currencyId);
  }

  /**
   * Add currency
   * @param currencyId - Currency ID
   * @param amount - Amount to add
   */
  public addCurrencyAmount(currencyId: string, amount: number): void {
    this.currencyManager.add(currencyId, amount);
  }

  /**
   * Remove currency amount
   * @param currencyId - Currency ID
   * @param amount - Amount to remove
   */
  public removeCurrencyAmount(currencyId: string, amount: number): void {
    this.currencyManager.subtract(currencyId, amount);
  }

  // ============================================================
  // UPGRADE MANAGEMENT
  // ============================================================

  /**
   * Add a new upgrade
   * @param upgrade - Upgrade configuration
   */
  public addUpgrade(upgrade: Upgrade): void {
    this.upgradeManager.addUpgrade(upgrade);
  }

  /**
   * Get upgrade data
   * @param upgradeId - Upgrade ID
   * @returns Upgrade object or undefined
   */
  public getUpgrade(upgradeId: string): Upgrade | undefined {
    return this.upgradeManager.getUpgrade(upgradeId);
  }

  /**
   * Get all upgrades
   * @returns Array of all upgrades
   */
  public getUpgrades(): Upgrade[] {
    return this.upgradeManager.getAll();
  }

  /**
   * Get purchased upgrades
   * @returns Array of purchased upgrades
   */
  public getPurchasedUpgrades(): Upgrade[] {
    return this.upgradeManager.getPurchased();
  }

  /**
   * Purchase an upgrade
   * @param upgradeId - Upgrade ID
   * @returns Whether purchase was successful
   */
  public purchaseUpgrade(upgradeId: string): boolean {
    return this.upgradeManager.purchase(upgradeId);
  }

  /**
   * Get upgrade cost
   * @param upgradeId - Upgrade ID
   * @returns Current cost of upgrade
   */
  public getUpgradeCost(upgradeId: string): number {
    const upgrade = this.upgradeManager.getUpgrade(upgradeId);
    if (!upgrade) return 0;
    return this.upgradeManager.calculateCost(upgrade);
  }

  // ============================================================
  // PARADIGM MANAGEMENT
  // ============================================================

  /**
   * Add a new paradigm
   * @param paradigm - Paradigm configuration
   */
  public addParadigm(paradigm: Paradigm): void {
    this.paradigmManager.addParadigm(paradigm);
  }

  /**
   * Get current paradigm
   * @returns Current paradigm or undefined
   */
  public getCurrentParadigm(): Paradigm | undefined {
    return this.paradigmManager.getCurrent();
  }

  /**
   * Get all paradigms
   * @returns Array of all paradigms
   */
  public getParadigms(): Paradigm[] {
    return this.paradigmManager.getAll();
  }

  /**
   * Switch to a paradigm
   * @param paradigmId - Paradigm ID
   */
  public switchParadigm(paradigmId: string): void {
    this.paradigmManager.switchTo(paradigmId);
  }

  /**
   * Get current production multiplier
   * @returns Production multiplier from current paradigm
   */
  public getParadigmMultiplier(): number {
    return this.paradigmManager.getCurrentMultiplier();
  }

  // ============================================================
  // PRODUCTION MANAGEMENT
  // ============================================================

  /**
   * Set production rate for a currency
   * @param currencyId - Currency ID
   * @param rate - Production rate per second
   */
  public setProductionRate(currencyId: string, rate: number): void {
    this.productionManager.setProductionRate(currencyId, rate);
  }

  /**
   * Get production rate for a currency
   * @param currencyId - Currency ID
   * @returns Production rate per second
   */
  public getProductionRate(currencyId: string): number {
    return this.productionManager.getProductionRate(currencyId);
  }

  /**
   * Get display production (with multipliers)
   * @param currencyId - Currency ID
   * @returns Production per second with all multipliers applied
   */
  public getDisplayProduction(currencyId: string): number {
    return this.productionManager.getDisplayProduction(currencyId);
  }

  /**
   * Set click multiplier for a currency
   * @param currencyId - Currency ID
   * @param multiplier - Click multiplier
   */
  public setClickMultiplier(currencyId: string, multiplier: number): void {
    this.productionManager.setClickMultiplier(currencyId, multiplier);
  }

  /**
   * Get click multiplier for a currency
   * @param currencyId - Currency ID
   * @returns Click multiplier
   */
  public getClickMultiplier(currencyId: string): number {
    return this.productionManager.getClickMultiplier(currencyId);
  }

  /**
   * Process a player click
   * @param currencyId - Currency to add to
   * @param baseAmount - Base click amount (default 1)
   */
  public click(currencyId: string, baseAmount?: number): void {
    this.productionManager.click(currencyId, baseAmount);
    this.totalClicks++;
    this.statisticsManager.recordClick();
  }

  // ============================================================
  // UI MANAGEMENT
  // ============================================================

  /**
   * Add a UI tab
   * @param tab - Tab configuration
   */
  public addTab(tab: UITab): void {
    this.uiManager.addTab(tab);
  }

  /**
   * Get all tabs
   * @returns Array of all tabs sorted by order
   */
  public getTabs(): UITab[] {
    return this.uiManager.getAll();
  }

  /**
   * Get visible tabs
   * @returns Array of visible tabs
   */
  public getVisibleTabs(): UITab[] {
    return this.uiManager.getVisible();
  }

  /**
   * Get active tab
   * @returns Active tab or undefined
   */
  public getActiveTab(): UITab | undefined {
    return this.uiManager.getActive();
  }

  /**
   * Switch to a tab
   * @param tabId - Tab ID
   */
  public switchTab(tabId: string): void {
    this.uiManager.switchTab(tabId);
  }

  /**
   * Set tab visibility
   * @param tabId - Tab ID
   * @param visible - Whether tab should be visible
   */
  public setTabVisible(tabId: string, visible: boolean): void {
    this.uiManager.setTabVisible(tabId, visible);
  }

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * Save game state
   * @param key - Storage key (default: 'game-state')
   */
  public saveGame(key: string = 'game-state'): void {
    this.stateManager.save(key, { totalClicks: this.totalClicks });
  }

  /**
   * Load game state
   * @param key - Storage key (default: 'game-state')
   * @returns Whether load was successful
   */
  public loadGame(key: string = 'game-state'): boolean {
    const state = this.stateManager.load(key);
    if (state && state.custom?.totalClicks) {
      this.totalClicks = state.custom.totalClicks as number;
    }
    return state !== null;
  }

  /**
   * Check if saved game exists
   * @param key - Storage key (default: 'game-state')
   * @returns Whether saved game exists
   */
  public hasSavedGame(key: string = 'game-state'): boolean {
    return this.stateManager.exists(key);
  }

  /**
   * Delete saved game
   * @param key - Storage key (default: 'game-state')
   */
  public deleteSavedGame(key: string = 'game-state'): void {
    this.stateManager.delete(key);
  }

  // ============================================================
  // ACHIEVEMENT MANAGEMENT
  // ============================================================

  /**
   * Add a new achievement
   * @param achievement - Achievement configuration
   */
  public addAchievement(achievement: Achievement): void {
    this.achievementManager.addAchievement(achievement);
  }

  /**
   * Get all achievements
   * @returns Array of all achievements
   */
  public getAchievements(): Achievement[] {
    return this.achievementManager.getAll();
  }

  /**
   * Get unlocked achievements
   * @returns Array of unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return this.achievementManager.getUnlocked();
  }

  /**
   * Get achievement by ID
   * @param achievementId - Achievement ID
   * @returns Achievement or undefined
   */
  public getAchievement(achievementId: string): Achievement | undefined {
    return this.achievementManager.getAchievement(achievementId);
  }

  /**
   * Update achievement progress
   * @param achievementId - Achievement ID
   * @param progress - Current progress value
   */
  public updateAchievementProgress(achievementId: string, progress: number): void {
    this.achievementManager.updateProgress(achievementId, progress);
  }

  /**
   * Get achievement completion percentage
   * @returns Percentage of achievements unlocked
   */
  public getAchievementCompletion(): number {
    return this.achievementManager.getCompletionPercentage();
  }

  // ============================================================
  // STATISTICS MANAGEMENT
  // ============================================================

  /**
   * Get game statistics
   * @returns Current game statistics
   */
  public getStatistics(): GameStatistics {
    return this.statisticsManager.getCurrentStatistics();
  }

  /**
   * Get statistics manager (for advanced usage)
   */
  public getStatisticsManager(): StatisticsManager {
    return this.statisticsManager;
  }

  // ============================================================
  // EVENT SYSTEM
  // ============================================================

  /**
   * Subscribe to game events
   * @param eventType - Event type to listen for
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  public on<T = unknown>(eventType: string, callback: (data: T) => void): () => void {
    return this.eventBus.on(eventType, callback);
  }

  /**
   * Subscribe to one-time event
   * @param eventType - Event type to listen for
   * @param callback - Callback function
   */
  public once<T = unknown>(eventType: string, callback: (data: T) => void): void {
    this.eventBus.once(eventType, callback);
  }

  /**
   * Emit custom event
   * @param eventType - Event type
   * @param data - Event data
   */
  public emit<T = unknown>(eventType: string, data?: T): void {
    this.eventBus.emit(eventType, data);
  }

  // ============================================================
  // GAME LIFECYCLE
  // ============================================================

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('Game is already running');
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.log('Game started');

    this.gameLoopHandle = requestAnimationFrame((timestamp) =>
      this.gameLoop(timestamp)
    );

    // Setup auto-save if configured
    if (this.config.autoSaveInterval && this.config.autoSaveInterval > 0) {
      setInterval(() => this.saveGame(), this.config.autoSaveInterval);
    }

    this.eventBus.emit(GameEvents.GAME_STARTED, {});
  }

  /**
   * Pause the game
   */
  public pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.gameLoopHandle !== null) {
      cancelAnimationFrame(this.gameLoopHandle);
      this.gameLoopHandle = null;
    }
    this.log('Game paused');
    this.eventBus.emit(GameEvents.GAME_PAUSED, {});
  }

  /**
   * Resume the game
   */
  public resume(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.log('Game resumed');
    this.gameLoopHandle = requestAnimationFrame((timestamp) =>
      this.gameLoop(timestamp)
    );
    this.eventBus.emit(GameEvents.GAME_RESUMED, {});
  }

  /**
   * Reset the game
   */
  public reset(): void {
    this.pause();
    this.currencyManager.clear();
    this.upgradeManager.reset();
    this.productionManager.clear();
    this.achievementManager.clear();
    this.statisticsManager.reset();
    this.totalClicks = 0;
    this.log('Game reset');
    this.eventBus.emit(GameEvents.GAME_RESET, {});
  }

  /**
   * Whether game is currently running
   */
  public isGameRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get total clicks counter
   */
  public getTotalClicks(): number {
    return this.totalClicks;
  }

  // ============================================================
  // INTERNAL
  // ============================================================

  /**
   * Main game loop
   */
  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Process production tick
    this.productionManager.tick(deltaTime);

    // Continue loop
    this.gameLoopHandle = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[ClickerGameEngine] ${message}`);
    }
  }

  /**
   * Get event bus (for advanced usage)
   */
  public getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get currency manager (for advanced usage)
   */
  public getCurrencyManager(): CurrencyManager {
    return this.currencyManager;
  }

  /**
   * Get upgrade manager (for advanced usage)
   */
  public getUpgradeManager(): UpgradeManager {
    return this.upgradeManager;
  }

  /**
   * Get paradigm manager (for advanced usage)
   */
  public getParadigmManager(): ParadigmManager {
    return this.paradigmManager;
  }

  /**
   * Get production manager (for advanced usage)
   */
  public getProductionManager(): ProductionManager {
    return this.productionManager;
  }

  /**
   * Get state manager (for advanced usage)
   */
  public getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * Get UI manager (for advanced usage)
   */
  public getUIManager(): UIManager {
    return this.uiManager;
  }

  /**
   * Get achievement manager (for advanced usage)
   */
  public getAchievementManager(): AchievementManager {
    return this.achievementManager;
  }
}

// Export all types and managers for external use
export { EventBus, GameEvents } from './core/EventBus';
export type { GameConfig, Currency, Upgrade, Paradigm, UITab, GameState, GameEvent } from './core/types';
export { CurrencyManager } from './systems/CurrencyManager';
export { UpgradeManager } from './systems/UpgradeManager';
export { ParadigmManager } from './systems/ParadigmManager';
export { ProductionManager } from './systems/ProductionManager';
export { StateManager, MemoryStorageAdapter } from './systems/StateManager';
export type { StorageAdapter } from './systems/StateManager';
export { UIManager } from './ui/UIManager';
export { AchievementManager } from './systems/AchievementManager';
export type { Achievement } from './systems/AchievementManager';
export { StatisticsManager } from './systems/StatisticsManager';
export type { GameStatistics } from './systems/StatisticsManager';
