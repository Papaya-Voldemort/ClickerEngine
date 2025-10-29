/**
 * @fileoverview Example game using the ClickerGameEngine
 * Demonstrates basic setup and usage of the game engine.
 */

import { ClickerGameEngine, GameEvents } from './index';

/**
 * Create and setup a simple clicker game
 */
export function createExampleGame(): ClickerGameEngine {
  // Initialize the engine
  const game = new ClickerGameEngine({
    debug: true,
    autoSaveInterval: 30000
  });

  // ============================================================
  // SETUP CURRENCIES
  // ============================================================

  game.addCurrency({
    id: 'gold',
    name: 'Gold',
    amount: 0,
    symbol: '💰',
    color: '#FFD700'
  });

  game.addCurrency({
    id: 'gems',
    name: 'Gems',
    amount: 0,
    symbol: '💎',
    color: '#00FF00'
  });

  game.addCurrency({
    id: 'prestige-points',
    name: 'Prestige Points',
    amount: 0,
    symbol: '⭐',
    color: '#FF00FF'
  });

  game.addCurrency({
    id: 'crystals',
    name: 'Crystals',
    amount: 0,
    symbol: '💠',
    color: '#00FFFF'
  });

  // ============================================================
  // SETUP UPGRADES - CLICK POWER
  // ============================================================

  game.addUpgrade({
    id: 'click-power',
    name: 'Click Power',
    description: 'Increase click value by 10%',
    cost: 100,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1.1,
    scalable: true,
    scaleFactor: 1.15,
    icon: '⚡'
  });

  game.addUpgrade({
    id: 'click-power-2',
    name: 'Mega Click',
    description: 'Increase click value by 50%',
    cost: 1000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1.5,
    scalable: true,
    scaleFactor: 1.2,
    icon: '💥'
  });

  game.addUpgrade({
    id: 'click-power-3',
    name: 'Ultra Click',
    description: 'Double your click value',
    cost: 10000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 2.0,
    scalable: true,
    scaleFactor: 1.25,
    icon: '🚀'
  });

  game.addUpgrade({
    id: 'critical-click',
    name: 'Critical Strikes',
    description: 'Increase click value by 25%',
    cost: 5000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1.25,
    scalable: true,
    scaleFactor: 1.18,
    icon: '⚔️'
  });

  // ============================================================
  // SETUP UPGRADES - WORKERS (Passive Production)
  // ============================================================

  game.addUpgrade({
    id: 'worker-1',
    name: 'Basic Worker',
    description: 'Gain 1 gold per second',
    cost: 50,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1,
    scalable: true,
    scaleFactor: 1.15,
    icon: '👷'
  });

  game.addUpgrade({
    id: 'worker-2',
    name: 'Advanced Worker',
    description: 'Gain 10 gold per second',
    cost: 500,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 10,
    scalable: true,
    scaleFactor: 1.15,
    icon: '🤖'
  });

  game.addUpgrade({
    id: 'worker-3',
    name: 'Expert Engineer',
    description: 'Gain 50 gold per second',
    cost: 5000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 50,
    scalable: true,
    scaleFactor: 1.15,
    icon: '👨‍🔧'
  });

  game.addUpgrade({
    id: 'worker-4',
    name: 'Automation System',
    description: 'Gain 200 gold per second',
    cost: 25000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 200,
    scalable: true,
    scaleFactor: 1.15,
    icon: '🏭'
  });

  game.addUpgrade({
    id: 'worker-5',
    name: 'AI Processor',
    description: 'Gain 1000 gold per second',
    cost: 100000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1000,
    scalable: true,
    scaleFactor: 1.15,
    icon: '🧠'
  });

  // ============================================================
  // SETUP UPGRADES - MULTIPLIERS
  // ============================================================

  game.addUpgrade({
    id: 'gold-multiplier-1',
    name: 'Golden Touch',
    description: 'Boost all gold production by 20%',
    cost: 2000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1.2,
    scalable: true,
    scaleFactor: 1.3,
    icon: '✨'
  });

  game.addUpgrade({
    id: 'gold-multiplier-2',
    name: 'Midas Hand',
    description: 'Boost all gold production by 50%',
    cost: 20000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1.5,
    scalable: true,
    scaleFactor: 1.4,
    icon: '🌟'
  });

  // ============================================================
  // SETUP UPGRADES - SPECIAL
  // ============================================================

  game.addUpgrade({
    id: 'gem-generator',
    name: 'Gem Generator',
    description: 'Generate 1 gem per second',
    cost: 50000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1,
    scalable: true,
    scaleFactor: 1.5,
    icon: '💎'
  });

  game.addUpgrade({
    id: 'crystal-forge',
    name: 'Crystal Forge',
    description: 'Generate 0.5 crystals per second',
    cost: 100000,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 0.5,
    scalable: true,
    scaleFactor: 1.6,
    icon: '💠'
  });

  // ============================================================
  // SETUP PARADIGMS
  // ============================================================

  game.addParadigm({
    id: 'early-game',
    name: 'Early Game',
    description: 'Just getting started',
    active: true,
    productionMultiplier: 1,
    data: { prestigeCount: 0 }
  });

  game.addParadigm({
    id: 'mid-game',
    name: 'Mid Game',
    description: 'You are getting stronger - 2x production',
    active: false,
    productionMultiplier: 2,
    data: { milestone: 'first-prestige' }
  });

  game.addParadigm({
    id: 'late-game',
    name: 'Late Game',
    description: 'Advanced gameplay - 5x production',
    active: false,
    productionMultiplier: 5,
    data: { unlocked: false }
  });

  game.addParadigm({
    id: 'prestige',
    name: 'Prestige Mode',
    description: 'Reset for massive bonuses - 10x production',
    active: false,
    productionMultiplier: 10,
    data: { prestigeLevel: 0 }
  });

  game.addParadigm({
    id: 'transcendence',
    name: 'Transcendence',
    description: 'Beyond normal limits - 25x production',
    active: false,
    productionMultiplier: 25,
    data: { transcendenceLevel: 0 }
  });

  game.addParadigm({
    id: 'infinity',
    name: 'Infinity',
    description: 'Endless power - 100x production',
    active: false,
    productionMultiplier: 100,
    data: { infinityLevel: 0 }
  });

  // ============================================================
  // SETUP TABS
  // ============================================================

  game.addTab({
    id: 'main',
    name: 'Main',
    icon: '🎮',
    visible: true,
    active: true,
    order: 0
  });

  game.addTab({
    id: 'upgrades',
    name: 'Upgrades',
    icon: '⬆️',
    visible: true,
    active: false,
    order: 1
  });

  game.addTab({
    id: 'workers',
    name: 'Workers',
    icon: '👥',
    visible: true,
    active: false,
    order: 2
  });

  game.addTab({
    id: 'achievements',
    name: 'Achievements',
    icon: '🏆',
    visible: true,
    active: false,
    order: 3
  });

  game.addTab({
    id: 'prestige',
    name: 'Prestige',
    icon: '👑',
    visible: true,
    active: false,
    order: 4
  });

  game.addTab({
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    visible: true,
    active: false,
    order: 5
  });

  // ============================================================
  // SETUP ACHIEVEMENTS
  // ============================================================

  game.addAchievement({
    id: 'first-click',
    name: 'First Steps',
    description: 'Click for the first time',
    icon: '👆',
    unlocked: false,
    progress: 0,
    target: 1,
    category: 'clicks'
  });

  game.addAchievement({
    id: 'click-100',
    name: 'Clicking Novice',
    description: 'Click 100 times',
    icon: '🖱️',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'clicks'
  });

  game.addAchievement({
    id: 'click-1000',
    name: 'Clicking Expert',
    description: 'Click 1000 times',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    target: 1000,
    category: 'clicks'
  });

  game.addAchievement({
    id: 'click-10000',
    name: 'Clicking Master',
    description: 'Click 10000 times',
    icon: '💥',
    unlocked: false,
    progress: 0,
    target: 10000,
    category: 'clicks'
  });

  game.addAchievement({
    id: 'gold-1k',
    name: 'Wealthy Beginner',
    description: 'Accumulate 1,000 gold',
    icon: '💰',
    unlocked: false,
    progress: 0,
    target: 1000,
    category: 'currency'
  });

  game.addAchievement({
    id: 'gold-100k',
    name: 'Rich',
    description: 'Accumulate 100,000 gold',
    icon: '💎',
    unlocked: false,
    progress: 0,
    target: 100000,
    category: 'currency'
  });

  game.addAchievement({
    id: 'gold-1m',
    name: 'Millionaire',
    description: 'Accumulate 1,000,000 gold',
    icon: '👑',
    unlocked: false,
    progress: 0,
    target: 1000000,
    category: 'currency'
  });

  game.addAchievement({
    id: 'first-upgrade',
    name: 'Upgrader',
    description: 'Purchase your first upgrade',
    icon: '⬆️',
    unlocked: false,
    progress: 0,
    target: 1,
    category: 'upgrades'
  });

  game.addAchievement({
    id: 'upgrade-10',
    name: 'Upgrade Enthusiast',
    description: 'Purchase 10 upgrades',
    icon: '📈',
    unlocked: false,
    progress: 0,
    target: 10,
    category: 'upgrades'
  });

  game.addAchievement({
    id: 'upgrade-50',
    name: 'Upgrade Collector',
    description: 'Purchase 50 upgrades',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'upgrades'
  });

  game.addAchievement({
    id: 'first-worker',
    name: 'Employer',
    description: 'Hire your first worker',
    icon: '👷',
    unlocked: false,
    progress: 0,
    target: 1,
    category: 'workers'
  });

  game.addAchievement({
    id: 'worker-army',
    name: 'Army of Workers',
    description: 'Have 50 total worker levels',
    icon: '👥',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'workers'
  });

  game.addAchievement({
    id: 'production-100',
    name: 'Production Line',
    description: 'Reach 100 gold per second production',
    icon: '🏭',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'production'
  });

  game.addAchievement({
    id: 'production-1000',
    name: 'Industrial Complex',
    description: 'Reach 1000 gold per second production',
    icon: '🏗️',
    unlocked: false,
    progress: 0,
    target: 1000,
    category: 'production'
  });

  game.addAchievement({
    id: 'first-paradigm',
    name: 'Paradigm Shifter',
    description: 'Switch paradigms for the first time',
    icon: '🔄',
    unlocked: false,
    progress: 0,
    target: 1,
    category: 'paradigm'
  });

  game.addAchievement({
    id: 'speedrun',
    name: 'Speed Demon',
    description: 'Reach 10,000 gold in under 5 minutes',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    target: 1,
    category: 'special',
    hidden: true
  });

  // ============================================================
  // SETUP INITIAL PRODUCTION
  // ============================================================

  game.setProductionRate('gold', 0); // Start with no passive production
  game.setClickMultiplier('gold', 1); // 1 gold per click initially

  // ============================================================
  // SETUP EVENT LISTENERS
  // ============================================================

  // Log currency changes and track statistics
  game.on(GameEvents.CURRENCY_CHANGED, (data: any) => {
    console.log(
      `Currency '${data.currencyId}' changed: ${data.oldAmount} -> ${data.newAmount}`
    );
    
    // Track gold earned and highest gold
    if (data.currencyId === 'gold' && data.newAmount > data.oldAmount) {
      const earned = data.newAmount - data.oldAmount;
      game.getStatisticsManager().recordGoldEarned(earned);
      game.getStatisticsManager().updateHighestGold(data.newAmount);
      
      // Check gold achievements
      game.updateAchievementProgress('gold-1k', data.newAmount);
      game.updateAchievementProgress('gold-100k', data.newAmount);
      game.updateAchievementProgress('gold-1m', data.newAmount);
    }
  });

  // Update production when upgrades are purchased
  game.on(GameEvents.UPGRADE_PURCHASED, (data: any) => {
    const upgrade = game.getUpgrade(data.upgradeId);
    if (!upgrade) return;

    // Track upgrade purchase
    game.getStatisticsManager().recordUpgradePurchase();

    // Update click multiplier based on click power upgrades
    if (data.upgradeId.startsWith('click-power') || data.upgradeId === 'critical-click') {
      let multiplier = 1;
      const clickUpgrades = game.getUpgradeManager().getFiltered(u => 
        u.id.startsWith('click-power') || u.id === 'critical-click'
      );
      clickUpgrades.forEach(u => {
        if (u.level > 0) {
          multiplier *= Math.pow(u.effect, u.level);
        }
      });
      game.setClickMultiplier('gold', multiplier);
      console.log(`Click multiplier updated to ${multiplier.toFixed(2)}x`);
    }

    // Update production rate based on worker upgrades
    if (data.upgradeId.startsWith('worker-')) {
      let totalProduction = 0;
      const workers = game.getUpgradeManager().getFiltered(u => u.id.startsWith('worker-'));
      workers.forEach(worker => {
        totalProduction += worker.effect * worker.level;
      });
      game.setProductionRate('gold', totalProduction);
      console.log(`Production rate updated to ${totalProduction} per second`);
      
      // Update production achievement
      game.updateAchievementProgress('production-100', totalProduction);
      game.updateAchievementProgress('production-1000', totalProduction);
      
      // Update worker achievements
      const totalWorkerLevels = workers.reduce((sum, w) => sum + w.level, 0);
      game.updateAchievementProgress('worker-army', totalWorkerLevels);
    }

    // Handle gem generator
    if (data.upgradeId === 'gem-generator') {
      let gemProduction = 0;
      const gemGen = game.getUpgrade('gem-generator');
      if (gemGen) {
        gemProduction = gemGen.effect * gemGen.level;
      }
      game.setProductionRate('gems', gemProduction);
    }

    // Handle crystal forge
    if (data.upgradeId === 'crystal-forge') {
      let crystalProduction = 0;
      const crystalForge = game.getUpgrade('crystal-forge');
      if (crystalForge) {
        crystalProduction = crystalForge.effect * crystalForge.level;
      }
      game.setProductionRate('crystals', crystalProduction);
    }

    // Update upgrade achievements
    const totalUpgradeLevels = game.getUpgradeManager().getAll()
      .reduce((sum, u) => sum + u.level, 0);
    game.updateAchievementProgress('first-upgrade', totalUpgradeLevels);
    game.updateAchievementProgress('upgrade-10', totalUpgradeLevels);
    game.updateAchievementProgress('upgrade-50', totalUpgradeLevels);
    
    // Check for first worker
    if (data.upgradeId.startsWith('worker-')) {
      game.updateAchievementProgress('first-worker', 1);
    }
  });

  // Track clicks for achievements
  game.on('click', () => {
    const clicks = game.getTotalClicks();
    game.updateAchievementProgress('first-click', clicks);
    game.updateAchievementProgress('click-100', clicks);
    game.updateAchievementProgress('click-1000', clicks);
    game.updateAchievementProgress('click-10000', clicks);
  });

  // Log paradigm changes and track statistics
  game.on(GameEvents.PARADIGM_CHANGED, (data: any) => {
    console.log(
      `Paradigm changed to '${data.paradigmName}' with ${data.multiplier}x multiplier`
    );
    game.updateAchievementProgress('first-paradigm', 1);
    game.getStatisticsManager().recordParadigmChange();
  });

  // Log achievement unlocks
  game.on('achievement:unlocked', (data: any) => {
    console.log(`🏆 Achievement unlocked: ${data.achievement.name}`);
  });

  // Log tab switches
  game.on(GameEvents.TAB_SWITCHED, (data: any) => {
    console.log(`Switched to tab: ${data.tabName}`);
  });

  return game;
}

/**
 * Example of running the game
 */
export function runExample(): void {
  const game = createExampleGame();

  // Try to load saved game
  if (game.hasSavedGame()) {
    console.log('Loading saved game...');
    game.loadGame();
  } else {
    console.log('Starting new game...');
  }

  // Start the game
  game.start();

  // Simulate some clicks (in a real game, these would be from user input)
  let clickCount = 0;
  const clickInterval = setInterval(() => {
    game.click('gold');
    clickCount++;

    // Try to purchase upgrades automatically as demo
    if (clickCount === 100) {
      game.purchaseUpgrade('click-power');
    }
    if (clickCount === 200) {
      game.purchaseUpgrade('worker-1');
    }
    if (clickCount === 500) {
      game.purchaseUpgrade('worker-2');
    }
    if (clickCount === 1000) {
      // Switch paradigm to demonstrate
      game.switchParadigm('mid-game');
    }

    // Log state periodically
    if (clickCount % 50 === 0) {
      const gold = game.getCurrencyAmount('gold');
      const production = game.getDisplayProduction('gold');
      console.log(
        `\nClicks: ${clickCount} | Gold: ${gold.toFixed(0)} | Production: ${production.toFixed(1)}/s`
      );
    }

    // Stop after demo
    if (clickCount === 2000) {
      clearInterval(clickInterval);
      console.log('\n=== DEMO COMPLETE ===');
      console.log(`Final Gold: ${game.getCurrencyAmount('gold').toFixed(0)}`);
      console.log(`Total Clicks: ${game.getTotalClicks()}`);
      console.log(`Current Paradigm: ${game.getCurrentParadigm()?.name}`);

      // Save game
      game.saveGame();
      game.pause();
    }
  }, 50); // Simulate clicks every 50ms
}

// Run if this is the main module
if (typeof window !== 'undefined') {
  (window as any).createExampleGame = createExampleGame;
  (window as any).runExample = runExample;
  console.log('Example game functions available globally');
  console.log('Run: createExampleGame() to create a game instance');
  console.log('Run: runExample() to run the demo');
}
