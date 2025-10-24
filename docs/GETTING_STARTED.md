# Getting Started Guide

This guide will walk you through creating your first clicker game with the engine.

## Step 1: Basic Setup

```typescript
import { ClickerGameEngine } from './src/index';

// Create your game instance
const game = new ClickerGameEngine({
  debug: true,           // Enable console logging
  autoSaveInterval: 30000 // Auto-save every 30 seconds
});
```

## Step 2: Add Currencies

Add the resources players will gather:

```typescript
// Main currency - earned through clicks
game.addCurrency({
  id: 'gold',
  name: 'Gold',
  amount: 0,
  symbol: '💰',
  color: '#FFD700'
});

// Optional: Add secondary currency
game.addCurrency({
  id: 'gems',
  name: 'Gems',
  amount: 0,
  symbol: '💎',
  color: '#00FF00'
});
```

## Step 3: Add Upgrades

Create upgrades that enhance gameplay:

```typescript
// Click power upgrades
game.addUpgrade({
  id: 'click-power',
  name: 'Stronger Hands',
  description: 'Click power +10%',
  cost: 100,
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 1.1,
  scalable: true,
  scaleFactor: 1.15, // Cost increases 15% per level
  icon: '✊'
});

// Worker/production upgrades
game.addUpgrade({
  id: 'worker-1',
  name: 'Hire Worker',
  description: 'Generate 1 gold per second',
  cost: 50,
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 1, // Production amount
  scalable: true,
  scaleFactor: 1.15,
  icon: '👷'
});
```

## Step 4: Add UI Tabs

Organize your game into sections:

```typescript
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
  id: 'stats',
  name: 'Stats',
  icon: '📊',
  visible: true,
  active: false,
  order: 2
});
```

## Step 5: Setup Production System

Configure how currency is generated:

```typescript
// Initial production rates (per second)
game.setProductionRate('gold', 0); // Start with manual clicks only
game.setProductionRate('gems', 0.1); // Passive gem generation

// Click multiplier (currency gained per click)
game.setClickMultiplier('gold', 1); // Start with 1 gold per click
```

## Step 6: Add Event Listeners

React to gameplay events:

```typescript
// When an upgrade is purchased
game.on('upgrade:purchased', (data) => {
  console.log(`Purchased: ${data.upgradeId} at level ${data.level}`);
  
  // Update click multiplier
  if (data.upgradeId === 'click-power') {
    const upgrade = game.getUpgrade('click-power');
    const multiplier = Math.pow(upgrade.effect, upgrade.level);
    game.setClickMultiplier('gold', multiplier);
  }
  
  // Update production rate
  if (data.upgradeId === 'worker-1') {
    const upgrade = game.getUpgrade('worker-1');
    const production = upgrade.level * upgrade.effect;
    game.setProductionRate('gold', production);
  }
});

// When currency amount changes
game.on('currency:changed', (data) => {
  // Update UI to show new balance
  console.log(`${data.currencyId}: ${data.newAmount}`);
});

// When a click happens
game.on('click', (data) => {
  // Play sound, show animation, etc.
  console.log(`Gained ${data.finalAmount} ${data.currencyId}`);
});
```

## Step 7: Start the Game

Begin the game loop:

```typescript
// Try to load saved game
if (game.hasSavedGame()) {
  game.loadGame();
  console.log('Game loaded!');
} else {
  console.log('Starting new game!');
}

// Start the game loop
game.start();
```

## Step 8: Handle User Input

Connect UI buttons to game actions:

```typescript
// Click button handler
function onClickButtonPressed() {
  game.click('gold');
}

// Purchase upgrade button handler
function onPurchaseUpgradeButtonPressed(upgradeId) {
  if (game.purchaseUpgrade(upgradeId)) {
    console.log('Purchase successful!');
  } else {
    console.log('Not enough currency!');
  }
}

// Switch tab handler
function onTabSwitched(tabId) {
  game.switchTab(tabId);
}

// Save game handler
function onSaveButtonPressed() {
  game.saveGame();
  console.log('Game saved!');
}

// Pause/Resume handler
function onPauseButtonPressed() {
  if (game.isGameRunning()) {
    game.pause();
  } else {
    game.resume();
  }
}
```

## Step 9: Display Game State

Update UI to show game information:

```typescript
// Get current values
function getGameState() {
  return {
    gold: game.getCurrencyAmount('gold'),
    gems: game.getCurrencyAmount('gems'),
    goldProduction: game.getDisplayProduction('gold'),
    clickMultiplier: game.getClickMultiplier('gold'),
    currentTab: game.getActiveTab(),
    upgrades: game.getUpgrades(),
    totalClicks: game.getTotalClicks(),
    isRunning: game.isGameRunning()
  };
}

// Format for display
function formatCurrency(amount) {
  const gold = game.getCurrency('gold');
  return gold.formatter ? gold.formatter(amount) : gold.symbol + amount;
}

// Get upgrade info
function getUpgradeInfo(upgradeId) {
  const upgrade = game.getUpgrade(upgradeId);
  const cost = game.getUpgradeCost(upgradeId);
  const canAfford = game.getCurrencyManager()
    .has(upgrade.currencyId, cost);
  
  return {
    name: upgrade.name,
    description: upgrade.description,
    level: upgrade.level,
    cost,
    canAfford,
    nextCost: cost
  };
}
```

## Step 10: Add Paradigm (Optional)

Add prestige/reset mechanics:

```typescript
// Define prestige paradigm
game.addParadigm({
  id: 'prestige-1',
  name: 'First Prestige',
  description: 'Reset for 1.5x multiplier',
  active: false,
  productionMultiplier: 1.5,
  data: { prestigeLevel: 0 }
});

// Create prestige upgrade (expensive)
game.addUpgrade({
  id: 'prestige',
  name: 'Prestige',
  description: 'Reset everything for 1.5x multiplier',
  cost: 1_000_000,
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 1.5,
  icon: '👑'
});

// Handle prestige
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId === 'prestige') {
    // Switch to prestige paradigm (applies multiplier)
    game.switchParadigm('prestige-1');
    
    // Reset the game
    game.reset();
    
    // Show prestige message
    console.log('You have entered prestige mode!');
  }
});
```

## Complete Example

```typescript
import { ClickerGameEngine, GameEvents } from './src/index';

function createMyFirstGame() {
  // Create engine
  const game = new ClickerGameEngine({ debug: true });

  // Add currency
  game.addCurrency({
    id: 'gold',
    name: 'Gold',
    amount: 0,
    symbol: '💰'
  });

  // Add upgrades
  game.addUpgrade({
    id: 'click-power',
    name: 'Stronger Hands',
    description: 'Click power +10%',
    cost: 100,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1.1,
    scalable: true,
    scaleFactor: 1.15,
    icon: '✊'
  });

  game.addUpgrade({
    id: 'worker',
    name: 'Hire Worker',
    description: '1 gold per second',
    cost: 50,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: 1,
    scalable: true,
    scaleFactor: 1.15,
    icon: '👷'
  });

  // Add tabs
  game.addTab({
    id: 'main',
    name: 'Main',
    visible: true,
    active: true,
    order: 0
  });

  // Setup production
  game.setProductionRate('gold', 0);
  game.setClickMultiplier('gold', 1);

  // Setup events
  game.on('upgrade:purchased', (data) => {
    // Update multipliers
    if (data.upgradeId === 'click-power') {
      const upgrade = game.getUpgrade('click-power');
      const multiplier = Math.pow(1.1, upgrade.level);
      game.setClickMultiplier('gold', multiplier);
    }
    
    if (data.upgradeId === 'worker') {
      const upgrade = game.getUpgrade('worker');
      game.setProductionRate('gold', upgrade.level * 1);
    }
  });

  // Load or start new game
  if (game.hasSavedGame()) {
    game.loadGame();
  }

  // Start
  game.start();

  return game;
}

// Create and run the game
const game = createMyFirstGame();

// Expose to global scope for console testing
(window as any).game = game;
```

## Testing Your Game

In the browser console, you can now test your game:

```javascript
// Get game status
game.getCurrencyAmount('gold')

// Simulate a click
game.click('gold')

// Try to purchase an upgrade
game.purchaseUpgrade('click-power')

// Check production
game.getDisplayProduction('gold')

// Get all upgrades
game.getUpgrades()

// Save the game
game.saveGame()

// Pause the game
game.pause()

// Resume
game.resume()
```

## Next Steps

1. **UI Implementation**: Create HTML/CSS for your game interface
2. **Advanced Features**: Add prestige systems, achievements, mini-games
3. **Balancing**: Adjust costs and effects to create engaging progression
4. **Polish**: Add animations, sounds, and visual feedback
5. **Deploy**: Build and host your game online

See [FEATURES.md](./FEATURES.md) for advanced feature implementations.
