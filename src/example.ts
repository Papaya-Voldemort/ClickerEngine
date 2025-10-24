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
    description: 'You are getting stronger',
    active: false,
    productionMultiplier: 2,
    data: { milestone: 'first-prestige' }
  });

  game.addParadigm({
    id: 'prestige',
    name: 'Prestige Mode',
    description: 'Reset for massive bonuses',
    active: false,
    productionMultiplier: 5,
    data: { prestigeLevel: 0 }
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
    id: 'prestige',
    name: 'Prestige',
    icon: '👑',
    visible: true,
    active: false,
    order: 3
  });

  game.addTab({
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    visible: true,
    active: false,
    order: 4
  });

  // ============================================================
  // SETUP INITIAL PRODUCTION
  // ============================================================

  game.setProductionRate('gold', 0); // Start with no passive production
  game.setClickMultiplier('gold', 1); // 1 gold per click initially

  // ============================================================
  // SETUP EVENT LISTENERS
  // ============================================================

  // Log currency changes
  game.on(GameEvents.CURRENCY_CHANGED, (data: any) => {
    console.log(
      `Currency '${data.currencyId}' changed: ${data.oldAmount} -> ${data.newAmount}`
    );
  });

  // Update production when upgrades are purchased
  game.on(GameEvents.UPGRADE_PURCHASED, (data: any) => {
    const upgrade = game.getUpgrade(data.upgradeId);
    if (!upgrade) return;

    // Update click multiplier based on click power upgrades
    if (data.upgradeId.startsWith('click-power')) {
      const multiplier = game.getUpgradeManager().getTotalEffect('click-power');
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
    }
  });

  // Log paradigm changes
  game.on(GameEvents.PARADIGM_CHANGED, (data: any) => {
    console.log(
      `Paradigm changed to '${data.paradigmName}' with ${data.multiplier}x multiplier`
    );
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
