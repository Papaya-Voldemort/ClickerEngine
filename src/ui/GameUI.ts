/**
 * @fileoverview Game UI Implementation
 * Creates and manages the interactive UI for the clicker game
 */

import { ClickerGameEngine, Currency, Upgrade, Paradigm } from '../index';

export class GameUI {
  private game: ClickerGameEngine;
  private container: HTMLElement;
  private floatingNumberCounter = 0;

  constructor(game: ClickerGameEngine, containerId: string = 'game-container') {
    this.game = game;
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }
    this.container = element;
    this.setupEventListeners();
  }

  /**
   * Render the complete UI
   */
  public render(): void {
    this.container.innerHTML = this.getMainHTML();
    this.attachUIHandlers();
    this.updateDisplay();
  }

  /**
   * Generate the main HTML structure
   */
  private getMainHTML(): string {
    return `
      <div class="game-container">
        <!-- Header -->
        <header class="game-header">
          <div class="game-header__title">
            <span>🎮</span>
            <span>Clicker Engine Demo</span>
          </div>
          <div class="game-header__stats">
            ${this.getCurrencyDisplayHTML()}
          </div>
        </header>

        <!-- Main Content -->
        <main class="game-main">
          <!-- Sidebar Navigation -->
          <aside class="game-sidebar">
            <div class="tabs" id="tab-navigation">
              ${this.getTabsHTML()}
            </div>
          </aside>

          <!-- Content Area -->
          <div class="game-content">
            <div id="tab-content">
              ${this.getActiveTabContent()}
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="game-footer">
          <div>
            <span>Total Clicks: <strong id="total-clicks">0</strong></span>
          </div>
          <div>
            <button class="btn btn--secondary btn--small" id="save-button">💾 Save Game</button>
            <button class="btn btn--secondary btn--small" id="reset-button">🔄 Reset</button>
          </div>
        </footer>
      </div>
    `;
  }

  /**
   * Get currency display HTML
   */
  private getCurrencyDisplayHTML(): string {
    const currencies = this.game.getCurrencyManager().getAll();
    return currencies.map((currency: Currency) => {
      const amount = this.game.getCurrencyAmount(currency.id);
      const production = this.game.getDisplayProduction(currency.id);
      return `
        <div class="currency-display currency-display--large" data-currency="${currency.id}">
          <span class="currency-display__icon">${currency.symbol || '💰'}</span>
          <div class="flex flex-col gap-xs">
            <span class="currency-display__amount" id="currency-${currency.id}">${this.formatNumber(amount)}</span>
            ${production > 0 ? `<span class="production-info">
              <span class="production-info__icon">⏱️</span>
              <span>+${this.formatNumber(production)}/s</span>
            </span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Get tabs HTML
   */
  private getTabsHTML(): string {
    const tabs = this.game.getTabs();
    return tabs.map((tab: any) => {
      const isActive = tab.active ? 'tab--active' : '';
      return `
        <button class="tab ${isActive}" data-tab-id="${tab.id}">
          <span class="tab__icon">${tab.icon || '📄'}</span>
          <span class="tab__name">${tab.name}</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Get active tab content
   */
  private getActiveTabContent(): string {
    const activeTab = this.game.getActiveTab();
    if (!activeTab) return '<div class="empty-state">No active tab</div>';

    switch (activeTab.id) {
      case 'main':
        return this.getMainTabContent();
      case 'upgrades':
        return this.getUpgradesTabContent();
      case 'workers':
        return this.getWorkersTabContent();
      case 'achievements':
        return this.getAchievementsTabContent();
      case 'prestige':
        return this.getPrestigeTabContent();
      case 'settings':
        return this.getSettingsTabContent();
      default:
        return `<div class="section-heading">${activeTab.name}</div>`;
    }
  }

  /**
   * Main tab content - clicking area
   */
  private getMainTabContent(): string {
    const gold = this.game.getCurrencyAmount('gold');
    const clickMultiplier = this.game.getClickMultiplier('gold');
    const production = this.game.getDisplayProduction('gold');
    const paradigm = this.game.getCurrentParadigm();
    
    // Map paradigm names to icons
    const paradigmIcons: Record<string, string> = {
      'early-game': '🌱',
      'mid-game': '🌿',
      'late-game': '🌳',
      'prestige': '👑',
      'transcendence': '✨',
      'infinity': '♾️'
    };
    const paradigmIcon = paradigm?.id ? paradigmIcons[paradigm.id] || '⭐' : '⭐';
    
    return `
      <div class="click-area">
        <h2 class="section-heading text-center">Click to Earn Gold!</h2>
        
        <div class="grid grid--2-cols" style="margin-bottom: var(--spacing-lg); gap: var(--spacing-md);">
          <div class="stat">
            <span class="stat__label">Per Click</span>
            <span class="stat__value">
              <span class="stat__icon">💰</span>
              <span>${this.formatNumber(clickMultiplier)}</span>
            </span>
          </div>
          <div class="stat">
            <span class="stat__label">Per Second</span>
            <span class="stat__value">
              <span class="stat__icon">⏱️</span>
              <span>${this.formatNumber(production)}</span>
            </span>
          </div>
          <div class="stat">
            <span class="stat__label">Current Gold</span>
            <span class="stat__value">
              <span class="stat__icon">💰</span>
              <span>${this.formatNumber(gold)}</span>
            </span>
          </div>
          <div class="stat">
            <span class="stat__label">Paradigm</span>
            <span class="stat__value">
              <span class="stat__icon">${paradigmIcon}</span>
              <span>${paradigm?.productionMultiplier || 1}x</span>
            </span>
          </div>
        </div>
        
        <div style="position: relative;">
          <button class="click-button" id="click-button">
            💰
          </button>
        </div>
        
        <p class="text-secondary text-center">Click the golden button to earn gold!</p>
      </div>
    `;
  }

  /**
   * Upgrades tab content
   */
  private getUpgradesTabContent(): string {
    const upgrades = this.game.getUpgradeManager()
      .getFiltered((u: Upgrade) => this.isClickPowerUpgrade(u));
    
    // Calculate total click multiplier
    let clickMultiplier = 1;
    upgrades.forEach(u => {
      if (u.level > 0) {
        clickMultiplier *= Math.pow(u.effect, u.level);
      }
    });
    
    if (upgrades.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">⬆️</div>
          <div class="empty-state__message">No upgrades available</div>
        </div>
      `;
    }

    return `
      <h2 class="section-heading">Click Power Upgrades</h2>
      
      <div class="card" style="margin-bottom: var(--spacing-lg);">
        <div class="card__body">
          <div class="stat">
            <span class="stat__label">Total Click Power</span>
            <span class="stat__value">
              <span class="stat__icon">⚡</span>
              <span>${this.formatNumber(clickMultiplier)}x</span>
            </span>
          </div>
        </div>
      </div>
      
      <div class="grid grid--auto-fit">
        ${upgrades.map((upgrade: Upgrade) => this.getUpgradeCardHTML(upgrade)).join('')}
      </div>
    `;
  }

  /**
   * Check if upgrade is a click power upgrade
   */
  private isClickPowerUpgrade(upgrade: Upgrade): boolean {
    return upgrade.id.startsWith('click-power') || upgrade.id === 'critical-click';
  }

  /**
   * Workers tab content
   */
  private getWorkersTabContent(): string {
    const workers = this.game.getUpgradeManager()
      .getFiltered((u: Upgrade) => u.id.startsWith('worker-'));
    
    // Calculate total production from workers
    let totalProduction = 0;
    workers.forEach(worker => {
      totalProduction += worker.effect * worker.level;
    });
    
    if (workers.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">👷</div>
          <div class="empty-state__message">No workers available</div>
        </div>
      `;
    }

    return `
      <h2 class="section-heading">Workers (Passive Income)</h2>
      
      <div class="card" style="margin-bottom: var(--spacing-lg);">
        <div class="card__body">
          <div class="stat">
            <span class="stat__label">Total Production</span>
            <span class="stat__value">
              <span class="stat__icon">🏭</span>
              <span>${this.formatNumber(totalProduction)}/s</span>
            </span>
          </div>
          <div class="stat" style="margin-top: var(--spacing-sm);">
            <span class="stat__label">With Multiplier</span>
            <span class="stat__value">
              <span class="stat__icon">✨</span>
              <span>${this.formatNumber(this.game.getDisplayProduction('gold'))}/s</span>
            </span>
          </div>
        </div>
      </div>
      
      <div class="grid grid--auto-fit">
        ${workers.map((worker: Upgrade) => this.getUpgradeCardHTML(worker)).join('')}
      </div>
    `;
  }

  /**
   * Achievements tab content
   */
  private getAchievementsTabContent(): string {
    const achievements = this.game.getAchievements();
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked && !a.hidden);
    const completion = this.game.getAchievementCompletion();

    return `
      <h2 class="section-heading">Achievements</h2>
      <div style="margin-bottom: var(--spacing-lg);">
        <div class="stat">
          <span class="stat__label">Completion</span>
          <span class="stat__value">${completion.toFixed(1)}%</span>
        </div>
        <div class="stat" style="margin-top: var(--spacing-sm);">
          <span class="stat__label">Unlocked</span>
          <span class="stat__value">${unlocked.length} / ${achievements.filter(a => !a.hidden).length}</span>
        </div>
      </div>

      ${unlocked.length > 0 ? `
        <h3 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">Unlocked</h3>
        <div class="grid grid--auto-fit" style="margin-bottom: var(--spacing-xl);">
          ${unlocked.map(achievement => `
            <div class="achievement-card achievement-card--unlocked">
              <div class="achievement-card__icon">${achievement.icon || '🏆'}</div>
              <div class="achievement-card__name">${achievement.name}</div>
              <div class="achievement-card__description">${achievement.description}</div>
              <div class="achievement-card__badge">✓ Unlocked</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${locked.length > 0 ? `
        <h3 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">Locked</h3>
        <div class="grid grid--auto-fit">
          ${locked.map(achievement => {
            const progressPercent = (achievement.progress / achievement.target) * 100;
            return `
              <div class="achievement-card achievement-card--locked">
                <div class="achievement-card__icon">${achievement.icon || '🏆'}</div>
                <div class="achievement-card__name">${achievement.name}</div>
                <div class="achievement-card__description">${achievement.description}</div>
                <div class="achievement-card__progress">
                  <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${progressPercent}%"></div>
                  </div>
                  <div class="progress-text">${this.formatNumber(achievement.progress)} / ${this.formatNumber(achievement.target)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    `;
  }

  /**
   * Prestige tab content
   */
  private getPrestigeTabContent(): string {
    const paradigms = this.game.getParadigmManager().getAll();
    const currentParadigm = this.game.getCurrentParadigm();

    return `
      <h2 class="section-heading">Paradigm Shifts</h2>
      <p class="text-secondary mb-0" style="margin-bottom: var(--spacing-lg);">
        Switch between different game phases to unlock powerful multipliers.
      </p>
      <div class="grid grid--2-cols">
        ${paradigms.map((paradigm: Paradigm) => {
          const isActive = paradigm.id === currentParadigm?.id;
          return `
            <div class="paradigm-card ${isActive ? 'paradigm-card--active' : ''}">
              <div class="paradigm-card__name">${paradigm.name}</div>
              <div class="paradigm-card__description">${paradigm.description}</div>
              <div class="paradigm-card__multiplier">
                ✨ ${paradigm.productionMultiplier}x Production
              </div>
              ${!isActive ? `
                <button 
                  class="btn btn--primary btn--full" 
                  style="margin-top: var(--spacing-lg);"
                  data-paradigm-id="${paradigm.id}">
                  Switch to ${paradigm.name}
                </button>
              ` : '<div style="margin-top: var(--spacing-lg); font-weight: bold;">✓ Active</div>'}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Settings tab content
   */
  private getSettingsTabContent(): string {
    const stats = this.game.getStatistics();
    
    return `
      <h2 class="section-heading">Settings</h2>
      
      <div class="card">
        <h3 class="card__title">📊 Statistics</h3>
        <div class="card__body">
          <div class="grid grid--2-cols" style="margin-top: var(--spacing-md); gap: var(--spacing-md);">
            <div class="stat">
              <span class="stat__label">Total Clicks</span>
              <span class="stat__value">${this.formatNumber(stats.totalClicks)}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Gold Earned</span>
              <span class="stat__value">💰 ${this.formatNumber(stats.totalGoldEarned)}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Upgrades Purchased</span>
              <span class="stat__value">${stats.totalUpgradesPurchased}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Highest Gold</span>
              <span class="stat__value">💰 ${this.formatNumber(stats.highestGold)}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Time Played</span>
              <span class="stat__value">${this.formatTime(stats.totalTimePlayed)}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Paradigm Changes</span>
              <span class="stat__value">${stats.paradigmChanges}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Fastest Clicking</span>
              <span class="stat__value">${stats.fastestClick} clicks/s</span>
            </div>
            <div class="stat">
              <span class="stat__label">Longest Session</span>
              <span class="stat__value">${this.formatTime(stats.longestSession)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" style="margin-top: var(--spacing-lg);">
        <h3 class="card__title">Game Controls</h3>
        <div class="card__body">
          <div class="flex flex-col gap-md" style="margin-top: var(--spacing-lg);">
            <button class="btn btn--primary" id="save-game-btn">💾 Save Game</button>
            <button class="btn btn--secondary" id="load-game-btn">📥 Load Game</button>
            <button class="btn btn--danger" id="reset-game-btn">🔄 Reset Game</button>
          </div>
        </div>
      </div>
      
      <div class="card" style="margin-top: var(--spacing-lg);">
        <h3 class="card__title">About</h3>
        <div class="card__body">
          <p>Clicker Game Engine Demo v1.0.0</p>
          <p style="margin-top: var(--spacing-sm);">
            A modular TypeScript framework for building incremental clicker games.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Get upgrade card HTML
   */
  private getUpgradeCardHTML(upgrade: Upgrade): string {
    const cost = this.game.getUpgradeCost(upgrade.id);
    const canAfford = this.game.getCurrencyAmount(upgrade.currencyId) >= cost;
    const affordClass = canAfford ? 'upgrade-card--affordable' : 'upgrade-card--unaffordable';
    
    // Calculate effect info
    let effectText = '';
    if (upgrade.id.startsWith('worker-')) {
      effectText = `+${this.formatNumber(upgrade.effect)}/s per level`;
    } else if (this.isClickPowerUpgrade(upgrade)) {
      const percentIncrease = ((upgrade.effect - 1) * 100).toFixed(0);
      effectText = `+${percentIncrease}% per level`;
    } else if (upgrade.id === 'gem-generator') {
      effectText = `+${upgrade.effect} gems/s per level`;
    } else if (upgrade.id === 'crystal-forge') {
      effectText = `+${upgrade.effect} crystals/s per level`;
    } else {
      effectText = `${upgrade.effect}x`;
    }
    
    return `
      <div class="upgrade-card ${affordClass}" data-upgrade-id="${upgrade.id}">
        <div class="upgrade-card__header">
          <div class="upgrade-card__icon">${upgrade.icon || '⬆️'}</div>
          <div class="upgrade-card__info">
            <div class="upgrade-card__name">${upgrade.name}</div>
            <div class="upgrade-card__description">${upgrade.description}</div>
            ${upgrade.level > 0 ? `<div class="upgrade-card__effect">${effectText}</div>` : ''}
          </div>
        </div>
        <div class="upgrade-card__footer">
          <div class="upgrade-card__cost">
            <span>💰</span>
            <span>${this.formatNumber(cost)}</span>
          </div>
          <div class="upgrade-card__level">
            Level: <span class="upgrade-card__level-badge">${upgrade.level}</span>
          </div>
        </div>
        <button 
          class="btn btn--primary btn--full" 
          style="margin-top: var(--spacing-md);"
          data-upgrade-buy="${upgrade.id}"
          ${!canAfford ? 'disabled' : ''}>
          Purchase
        </button>
      </div>
    `;
  }

  /**
   * Attach UI event handlers
   */
  private attachUIHandlers(): void {
    // Click button
    const clickButton = document.getElementById('click-button');
    if (clickButton) {
      clickButton.addEventListener('click', (e) => this.handleClick(e));
    }

    // Tab switching
    const tabs = document.querySelectorAll('[data-tab-id]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab-id');
        if (tabId) {
          this.game.switchTab(tabId);
          this.render(); // Re-render on tab change
        }
      });
    });

    // Upgrade purchases
    const upgradeBtns = document.querySelectorAll('[data-upgrade-buy]');
    upgradeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const upgradeId = btn.getAttribute('data-upgrade-buy');
        if (upgradeId) {
          this.game.purchaseUpgrade(upgradeId);
        }
      });
    });

    // Paradigm switches
    const paradigmBtns = document.querySelectorAll('[data-paradigm-id]');
    paradigmBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const paradigmId = btn.getAttribute('data-paradigm-id');
        if (paradigmId) {
          this.game.switchParadigm(paradigmId);
          this.render();
        }
      });
    });

    // Save/Load/Reset buttons
    const saveBtn = document.getElementById('save-game-btn');
    const loadBtn = document.getElementById('load-game-btn');
    const resetBtn = document.getElementById('reset-game-btn');
    const footerSaveBtn = document.getElementById('save-button');
    const footerResetBtn = document.getElementById('reset-button');

    if (saveBtn) saveBtn.addEventListener('click', () => this.game.saveGame());
    if (footerSaveBtn) footerSaveBtn.addEventListener('click', () => this.game.saveGame());
    if (loadBtn) loadBtn.addEventListener('click', () => {
      this.game.loadGame();
      this.render();
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the game? This cannot be undone.')) {
        this.game.reset();
        this.render();
      }
    });
    if (footerResetBtn) footerResetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the game? This cannot be undone.')) {
        this.game.reset();
        this.render();
      }
    });
  }

  /**
   * Handle click on the main click button
   */
  private handleClick(event: Event): void {
    this.game.click('gold');
    
    // Add visual feedback
    const button = event.target as HTMLElement;
    button.classList.add('click-button--pulse');
    setTimeout(() => button.classList.remove('click-button--pulse'), 600);

    // Show floating number
    this.showFloatingNumber(
      event as MouseEvent,
      `+${this.formatNumber(this.game.getClickMultiplier('gold'))}`
    );
  }

  /**
   * Show floating number animation
   */
  private showFloatingNumber(event: MouseEvent, text: string): void {
    const floatingNum = document.createElement('div');
    floatingNum.className = 'floating-number';
    floatingNum.textContent = text;
    floatingNum.style.left = `${event.clientX}px`;
    floatingNum.style.top = `${event.clientY}px`;
    
    document.body.appendChild(floatingNum);
    
    setTimeout(() => {
      floatingNum.remove();
    }, 1000);
  }

  /**
   * Setup game event listeners
   */
  private setupEventListeners(): void {
    // Update display on currency change
    this.game.on('currency:changed', () => {
      this.updateCurrencyDisplay();
    });

    // Update display on upgrade purchase
    this.game.on('upgrade:purchased', () => {
      this.render(); // Full re-render to update affordability
    });

    // Update total clicks
    this.game.on('click', () => {
      this.updateTotalClicks();
    });
  }

  /**
   * Update currency display
   */
  private updateCurrencyDisplay(): void {
    const currencies = this.game.getCurrencyManager().getAll();
    currencies.forEach((currency: Currency) => {
      const element = document.getElementById(`currency-${currency.id}`);
      if (element) {
        const amount = this.game.getCurrencyAmount(currency.id);
        element.textContent = this.formatNumber(amount);
        
        // Add animation
        const parent = element.closest('.currency-display');
        if (parent) {
          parent.classList.add('currency-display--increased');
          setTimeout(() => parent.classList.remove('currency-display--increased'), 300);
        }
      }
    });
  }

  /**
   * Update total clicks display
   */
  private updateTotalClicks(): void {
    const element = document.getElementById('total-clicks');
    if (element) {
      element.textContent = this.game.getTotalClicks().toString();
    }
  }

  /**
   * Update the entire display
   */
  private updateDisplay(): void {
    this.updateCurrencyDisplay();
    this.updateTotalClicks();
  }

  /**
   * Format number for display
   */
  private formatNumber(num: number): string {
    if (num < 1000) return num.toFixed(0);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
  }

  /**
   * Format time in seconds for display
   */
  private formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  /**
   * Start auto-refresh for production display
   */
  public startAutoRefresh(): void {
    setInterval(() => {
      this.updateCurrencyDisplay();
    }, 100); // Update every 100ms for smooth production display
  }
}
