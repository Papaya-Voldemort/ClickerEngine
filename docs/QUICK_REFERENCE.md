# API Quick Reference

## Main Engine

```typescript
import { ClickerGameEngine, GameEvents } from './src/index';

// Create engine
const game = new ClickerGameEngine({ debug: true });

// Core operations
game.start()
game.pause()
game.resume()
game.reset()
game.isGameRunning(): boolean
game.getTotalClicks(): number
```

## Currencies

```typescript
// Add currency
game.addCurrency({ id, name, amount, symbol, color, formatter })

// Get currency
game.getCurrency(currencyId): Currency
game.getCurrencies(): Currency[]
game.getCurrencyAmount(currencyId): number

// Modify
game.addCurrencyAmount(currencyId, amount): void
game.removeCurrencyAmount(currencyId, amount): void

// Formatting
currencyManager.format(currencyId, amount): string
currencyManager.abbreviateNumber(num): string
```

## Upgrades

```typescript
// Add upgrade
game.addUpgrade({
  id, name, description, cost, currencyId, level,
  purchased, effect, scalable, scaleFactor, icon
})

// Get upgrades
game.getUpgrade(upgradeId): Upgrade
game.getUpgrades(): Upgrade[]
game.getPurchasedUpgrades(): Upgrade[]

// Purchase
game.purchaseUpgrade(upgradeId): boolean
game.getUpgradeCost(upgradeId): number

// Manager methods
upgradeManager.calculateCost(upgrade): number
upgradeManager.getFiltered(filter): Upgrade[]
upgradeManager.getTotalEffect(pattern): number
```

## Paradigms

```typescript
// Add paradigm
game.addParadigm({
  id, name, description, active, productionMultiplier, data
})

// Get paradigms
game.getCurrentParadigm(): Paradigm | undefined
game.getParadigms(): Paradigm[]

// Switch
game.switchParadigm(paradigmId): void
game.getParadigmMultiplier(): number

// Data
paradigmManager.getData(paradigmId): Record<string, unknown>
paradigmManager.updateData(paradigmId, data): void
paradigmManager.setMultiplier(paradigmId, multiplier): void
```

## Production

```typescript
// Setup
game.setProductionRate(currencyId, rate): void
game.getProductionRate(currencyId): number
game.setClickMultiplier(currencyId, multiplier): void
game.getClickMultiplier(currencyId): number

// Actions
game.click(currencyId, baseAmount?): void
game.getDisplayProduction(currencyId): number
```

## UI Tabs

```typescript
// Add tab
game.addTab({ id, name, icon, visible, active, order })

// Get tabs
game.getTabs(): UITab[]
game.getVisibleTabs(): UITab[]
game.getActiveTab(): UITab

// Actions
game.switchTab(tabId): void
game.setTabVisible(tabId, visible): void
```

## State Management

```typescript
// Save/Load
game.saveGame(key?): void
game.loadGame(key?): boolean
game.hasSavedGame(key?): boolean
game.deleteSavedGame(key?): void

// Advanced
stateManager.snapshot(customState?): GameState
stateManager.setStorageAdapter(adapter): void
```

## Events

```typescript
// Subscribe
game.on<T>(eventType, callback: (data: T) => void): () => void
game.once<T>(eventType, callback: (data: T) => void): void
game.emit<T>(eventType, data?: T): void

// Built-in events
GameEvents.GAME_INITIALIZED
GameEvents.GAME_STARTED
GameEvents.GAME_PAUSED
GameEvents.GAME_RESUMED
GameEvents.GAME_RESET
GameEvents.CURRENCY_ADDED
GameEvents.CURRENCY_CHANGED
GameEvents.UPGRADE_PURCHASED
GameEvents.UPGRADE_LEVELED
GameEvents.CLICK
GameEvents.PARADIGM_CHANGED
GameEvents.TAB_SWITCHED
GameEvents.PRODUCTION_TICK
GameEvents.STATE_SAVED
GameEvents.STATE_LOADED
```

## Direct Manager Access

```typescript
game.getCurrencyManager(): CurrencyManager
game.getUpgradeManager(): UpgradeManager
game.getParadigmManager(): ParadigmManager
game.getProductionManager(): ProductionManager
game.getStateManager(): StateManager
game.getUIManager(): UIManager
game.getEventBus(): EventBus
```

## Types

```typescript
interface Currency {
  id: string
  name: string
  amount: number
  symbol: string
  color?: string
  visible?: boolean
  formatter?: (amount: number) => string
}

interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  currencyId: string
  level: number
  purchased: boolean
  effect: number
  scalable?: boolean
  scaleFactor?: number
  icon?: string
  metadata?: Record<string, unknown>
}

interface Paradigm {
  id: string
  name: string
  description: string
  active: boolean
  productionMultiplier: number
  data?: Record<string, unknown>
}

interface UITab {
  id: string
  name: string
  icon?: string
  visible: boolean
  active: boolean
  order: number
  activeColor?: string
}

interface GameState {
  timestamp: number
  currencies: Record<string, number>
  upgrades: Record<string, number>
  currentParadigm: string
  totalClicks: number
  custom?: Record<string, unknown>
}
```

## Common Patterns

### Update Production from Upgrades

```typescript
game.on('upgrade:purchased', (data) => {
  let totalProduction = 0;
  game.getUpgrades()
    .filter(u => u.id.startsWith('worker-'))
    .forEach(u => {
      totalProduction += u.effect * u.level;
    });
  game.setProductionRate('gold', totalProduction);
});
```

### Update Click Multiplier from Upgrades

```typescript
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId.startsWith('click-power')) {
    const multiplier = game.getUpgradeManager()
      .getTotalEffect('click-power');
    game.setClickMultiplier('gold', multiplier);
  }
});
```

### Check Upgrade Affordability

```typescript
const upgrade = game.getUpgrade('my-upgrade');
const cost = game.getUpgradeCost('my-upgrade');
const canAfford = game.getCurrencyManager()
  .has(upgrade.currencyId, cost);
```

### Prestige Reset

```typescript
game.reset(); // Reset currencies and upgrades
game.switchParadigm('prestige-1'); // Apply prestige multiplier
```

---

See [README.md](../README.md) for full documentation.
