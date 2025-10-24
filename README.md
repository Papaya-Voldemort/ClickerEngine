# 🎮 Clicker Game Engine

[![Pages Deployment](https://github.com/Papaya-Voldemort/ClickerEngine/actions/workflows/pages.yml/badge.svg)](https://github.com/Papaya-Voldemort/ClickerEngine/actions/workflows/pages.yml)
[![License](https://img.shields.io/github/license/Papaya-Voldemort/ClickerEngine.svg)](./LICENSE)


A modular, well-documented TypeScript framework for building incremental/clicker games. The engine provides all the core systems you need to create an amazing clicker game, allowing you to focus on gameplay and design.

## 🌟 Features

- **Event-Driven Architecture**: Decoupled systems communicate through an event bus
- **Currency System**: Multiple currencies with automatic number formatting
- **Upgrade System**: Scalable costs, levels, and effects
- **Paradigm Shifts**: Major game phases with different mechanics and multipliers
- **Production System**: Both passive generation and active clicks
- **UI System**: Tab management for organized interfaces
- **State Persistence**: Save/load games with customizable storage adapters
- **Fully Typed**: Complete TypeScript support with comprehensive types
- **Zero Dependencies**: No external dependencies required
- **Highly Modular**: Pick and use only what you need

## 📦 Installation

```bash
npm install
```

## 🚀 Quick Start

```typescript
import { ClickerGameEngine } from './src/index';

// Create game instance
const game = new ClickerGameEngine({ debug: true });

// Add a currency
game.addCurrency({
  id: 'gold',
  name: 'Gold',
  amount: 0,
  symbol: '💰'
});

// Add an upgrade
game.addUpgrade({
  id: 'click-power',
  name: 'Click Power',
  description: 'Increase clicks by 10%',
  cost: 100,
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 1.1,
  scalable: true,
  scaleFactor: 1.15
});

// Add a UI tab
game.addTab({
  id: 'main',
  name: 'Main',
  visible: true,
  active: true,
  order: 0
});

// Setup event listeners
game.on('upgrade:purchased', (data) => {
  console.log('Upgrade purchased!', data);
});

// Start the game
game.start();

// Handle player clicks
game.click('gold');

// Purchase upgrades
game.purchaseUpgrade('click-power');

// Save the game
game.saveGame();
```

## 📚 Core Concepts

### 1. Currencies

Currencies represent in-game resources. Each currency has:
- **ID**: Unique identifier
- **Name**: Display name
- **Amount**: Current quantity
- **Symbol**: Display symbol (emoji or text)
- **Formatter**: Optional custom display formatting

```typescript
game.addCurrency({
  id: 'gold',
  name: 'Gold',
  amount: 0,
  symbol: '💰',
  color: '#FFD700',
  formatter: (amount) => amount.toLocaleString() // Custom formatting
});

// Manipulate currencies
game.addCurrencyAmount('gold', 100);
game.removeCurrencyAmount('gold', 50);
const amount = game.getCurrencyAmount('gold');
```

### 2. Upgrades

Upgrades are purchasable enhancements with levels and effects. They can:
- Have scalable costs that increase with level
- Provide different effects (multipliers, production bonuses, etc.)
- Be filtered by type
- Track purchase history

```typescript
game.addUpgrade({
  id: 'click-power',
  name: 'Click Power',
  description: 'Increase clicks by 10%',
  cost: 100,
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 1.1,
  scalable: true,
  scaleFactor: 1.15, // Cost increases by 15% per level
  icon: '⚡'
});

// Purchase an upgrade
if (game.purchaseUpgrade('click-power')) {
  console.log('Purchase successful!');
  const upgrade = game.getUpgrade('click-power');
  console.log(`Now level ${upgrade.level}`);
} else {
  console.log('Not enough currency!');
}

// Get upgrade cost
const cost = game.getUpgradeCost('click-power');
```

### 3. Production System

The production system manages both passive generation and active clicks:

```typescript
// Set passive production rate (per second)
game.setProductionRate('gold', 10); // Generate 10 gold per second

// Set click multiplier
game.setClickMultiplier('gold', 1.5); // Each click worth 50% more

// Handle clicks
game.click('gold'); // Add 1 gold * multiplier

// Get production info
const production = game.getDisplayProduction('gold'); // With multipliers
const rate = game.getProductionRate('gold'); // Base rate
const multiplier = game.getClickMultiplier('gold');
```

### 4. Paradigm Shifts

Paradigms represent major game phases with different mechanics and multipliers. Perfect for implementing prestige systems:

```typescript
game.addParadigm({
  id: 'early-game',
  name: 'Early Game',
  description: 'Just getting started',
  active: true,
  productionMultiplier: 1,
  data: { prestigeCount: 0 }
});

game.addParadigm({
  id: 'prestige',
  name: 'Prestige Mode',
  description: 'Reset for 5x bonus',
  active: false,
  productionMultiplier: 5,
  data: { prestigeLevel: 0 }
});

// Switch paradigms
game.switchParadigm('prestige');

// Paradigm multiplier is automatically applied to production and clicks
// Access paradigm data
const paradigm = game.getCurrentParadigm();
console.log(paradigm.data.prestigeCount);
```

### 5. UI System

The UI system manages tabs for organizing different game sections:

```typescript
// Add tabs
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

// Get tabs
const allTabs = game.getTabs(); // All tabs sorted by order
const visibleTabs = game.getVisibleTabs(); // Only visible tabs
const activeTab = game.getActiveTab();

// Switch tabs
game.switchTab('upgrades');

// Control visibility
game.setTabVisible('upgrades', false);
```

### 6. Events

The engine uses an event system for loose coupling:

```typescript
// Subscribe to events
game.on('currency:changed', (data) => {
  console.log(`Currency changed: ${data.currencyId}`);
});

// One-time events
game.once('game:started', () => {
  console.log('Game started!');
});

// Available events (from GameEvents)

## 🍴 Forking & Deploying

Want to fork and publish your own copy? Here's a quick guide:

1. Fork the repository on GitHub (click the "Fork" button).
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/<your-fork>.git
cd <your-fork>
```

3. Install dependencies and run locally:

```bash
npm ci
npm run dev     # starts webpack-dev-server on port 3000
```

4. Build for production and push to GitHub:

```bash
npm run build
git add .
git commit -m "Build for GitHub Pages"
git push origin main
```

The repository includes a GitHub Actions workflow (see `.github/workflows/pages.yml`) that builds the project and deploys the generated `dist/` folder to GitHub Pages. The workflow is configured to trigger on pushes to the `main` branch — if your default branch has a different name, either rename it to `main` or update the workflow's branch filter.

After the workflow completes, your site will be published via GitHub Pages; the URL is available in the repository's Pages settings, or at `https://<your-username>.github.io/<repo-name>/` for user/repository pages (depending on how Pages is configured).

## 🤝 Contributing

Contributions welcome! Open an issue or send a pull request. Small fixes (docs, typos, tests) are especially appreciated—please include a short description of the change and any relevant context.

## 📝 License

This project is licensed under the MIT License — see the `LICENSE` file for details.
```

### 7. State Persistence

Save and load games with automatic serialization:

```typescript
// Auto-saves every 30 seconds (configured in constructor)
// Manually save
game.saveGame('game-state');

// Load
game.loadGame('game-state');

// Check if save exists
if (game.hasSavedGame('game-state')) {
  game.loadGame('game-state');
}

// Delete save
game.deleteSavedGame('game-state');

// Custom storage adapters
const stateManager = game.getStateManager();
stateManager.setStorageAdapter(new CustomStorageAdapter());
```

## 🎮 Game Lifecycle

```typescript
// Initialize
const game = new ClickerGameEngine({ debug: true });

// Setup your game (add currencies, upgrades, etc)
game.addCurrency({ id: 'gold', name: 'Gold', amount: 0, symbol: '💰' });

// Load saved game if exists
if (game.hasSavedGame()) {
  game.loadGame();
}

// Start the game
game.start();

// Pause/Resume as needed
game.pause();
game.resume();

// Reset the game
game.reset();

// Check if running
if (game.isGameRunning()) {
  // Game is running
}
```

## 🏗️ Architecture

```
ClickerGameEngine (Main Orchestrator)
├── EventBus (Pub/Sub Communication)
├── CurrencyManager (Resource Management)
├── UpgradeManager (Enhancement System)
├── ParadigmManager (Game Phases)
├── ProductionManager (Generation & Clicks)
├── UIManager (Tab Organization)
└── StateManager (Persistence)
```

### System Interactions

Each system is independent but communicates through the event bus:

1. **CurrencyManager** emits events when amounts change
2. **UpgradeManager** handles purchases and notifies on changes
3. **ProductionManager** processes ticks and clicks, using multipliers from paradigms
4. **ParadigmManager** manages game phases and multipliers
5. **UIManager** handles tab switching
6. **StateManager** serializes/deserializes game state

## 📁 File Structure

```
src/
├── core/
│   ├── types.ts          # Core type definitions
│   └── EventBus.ts       # Event system
├── systems/
│   ├── CurrencyManager.ts     # Currency handling
│   ├── UpgradeManager.ts      # Upgrade system
│   ├── ParadigmManager.ts     # Paradigm shifts
│   ├── ProductionManager.ts   # Production & clicks
│   └── StateManager.ts        # Save/Load system
├── ui/
│   └── UIManager.ts      # UI/Tab system
├── index.ts              # Main engine class
└── example.ts            # Example game implementation
```

## 🔧 Advanced Usage

### Custom Storage Adapter

```typescript
import { StorageAdapter } from './src/systems/StateManager';

class MyCustomAdapter implements StorageAdapter {
  save(key: string, state: GameState): void {
    // Send to server or custom storage
    fetch('/api/save', { method: 'POST', body: JSON.stringify(state) });
  }

  load(key: string): GameState | null {
    // Load from server or custom storage
    return fetch(`/api/save/${key}`).then(r => r.json());
  }

  delete(key: string): void {
    fetch(`/api/save/${key}`, { method: 'DELETE' });
  }

  exists(key: string): boolean {
    return fetch(`/api/save/${key}`).then(r => r.ok);
  }
}

const stateManager = game.getStateManager();
stateManager.setStorageAdapter(new MyCustomAdapter());
```

### Accessing Managers Directly

For advanced features, access individual managers:

```typescript
const currencyMgr = game.getCurrencyManager();
const upgradeMgr = game.getUpgradeManager();
const paradigmMgr = game.getParadigmManager();
const productionMgr = game.getProductionManager();
const stateMgr = game.getStateManager();
const uiMgr = game.getUIManager();
const eventBus = game.getEventBus();
```

### Computing Complex Effects

```typescript
// Get total effect from all click power upgrades
const clickMultiplier = game.getUpgradeManager().getTotalEffect('click-power');

// Filter upgrades by custom criteria
const expensiveUpgrades = game.getUpgradeManager().getFiltered(
  u => game.getUpgradeCost(u.id) > 1000
);
```

## 📖 Examples

See `src/example.ts` for a complete example implementation demonstrating:
- Setting up currencies
- Adding upgrades with different effects
- Managing paradigm shifts
- Organizing UI with tabs
- Event handling
- Production rate updates based on upgrades
- Game state management

## 🛠️ Building

```bash
# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Generate documentation
npm run docs
```

## 📝 Best Practices

1. **Use Events**: Instead of tight coupling, emit and listen to events
2. **Organize by Features**: Use tabs and paradigms to organize game features
3. **Scale Upgrade Costs**: Use `scalable: true` for upgrades that get purchased multiple times
4. **Save Regularly**: Enable auto-save in config or manually save frequently
5. **Use Icons/Symbols**: Make currencies and tabs visually distinct
6. **Document Paradigms**: Make it clear what each paradigm does
7. **Test State Loading**: Ensure your game loads correctly from saved state

## 🎯 Common Patterns

### Implementing a Prestige System

```typescript
// Add prestige paradigm
game.addParadigm({
  id: 'prestige',
  name: 'Prestige',
  active: false,
  productionMultiplier: 5
});

// Listen for prestige event (custom event)
game.on('prestige:activated', () => {
  // Reset currencies
  game.getCurrencyManager().clear();
  // Upgrades are reset via paradigm change
  game.switchParadigm('prestige');
});
```

### Implementing Passive Production from Upgrades

```typescript
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId.startsWith('worker-')) {
    let totalProduction = 0;
    game.getUpgradeManager().getFiltered(u => u.id.startsWith('worker-'))
      .forEach(worker => {
        totalProduction += worker.effect * worker.level;
      });
    game.setProductionRate('gold', totalProduction);
  }
});
```

### Implementing Click Multipliers

```typescript
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId.startsWith('click-power')) {
    const multiplier = game.getUpgradeManager().getTotalEffect('click-power');
    game.setClickMultiplier('gold', multiplier);
  }
});
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! This is a foundation for building amazing clicker games.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Happy Game Development! 🚀**
# ClickerEngine
# ClickerEngine
# ClickerEngine
# ClickerEngine
