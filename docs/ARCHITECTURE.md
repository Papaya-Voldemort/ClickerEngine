# Architecture Guide

## Overview

The Clicker Game Engine is built on a **modular, event-driven architecture**. Each system is independent but communicates through a central event bus, making it easy to extend and maintain.

## Core Principles

1. **Separation of Concerns**: Each manager handles one aspect of the game
2. **Event-Driven**: Systems communicate through events, not direct references
3. **Extensibility**: Easy to add new systems or extend existing ones
4. **Type Safety**: Full TypeScript support throughout
5. **Testability**: Each system can be tested independently

## System Architecture

### 1. EventBus (Core Communication)

**Location**: `src/core/EventBus.ts`

The EventBus implements the Observer pattern and serves as the central communication hub.

```
EventBus
├── on(eventType, observer)      // Subscribe to events
├── once(eventType, observer)    // One-time subscription
├── off(eventType, observer)     // Unsubscribe
├── emit(eventType, data)        // Emit event
└── clear()                      // Clean up
```

**Key Features**:
- Type-safe event subscribers
- Unsubscribe functions
- Error handling in observers
- Event name constants (GameEvents)

**Example**:
```typescript
const unsubscribe = eventBus.on('currency:changed', (data) => {
  console.log('Currency changed:', data);
});

// Later, unsubscribe
unsubscribe();
```

### 2. CurrencyManager (Resource Management)

**Location**: `src/systems/CurrencyManager.ts`

Manages multiple in-game currencies with automatic formatting and event emission.

```
CurrencyManager
├── addCurrency(currency)        // Register new currency
├── get(currencyId)              // Get current amount
├── add(currencyId, amount)      // Add amount
├── subtract(currencyId, amount) // Remove amount
├── has(currencyId, amount)      // Check if enough
├── format(currencyId, amount)   // Format for display
└── getAll()                     // Get all currencies
```

**Key Features**:
- Multiple currencies
- Automatic number abbreviation (1.2K, 3.4M, etc.)
- Custom formatters
- Event emission on changes
- Prevents negative amounts

**Internal State**:
```typescript
private currencies: Map<string, Currency>
```

### 3. UpgradeManager (Enhancement System)

**Location**: `src/systems/UpgradeManager.ts`

Manages purchasable upgrades with levels and effects.

```
UpgradeManager
├── addUpgrade(upgrade)          // Register upgrade
├── purchase(upgradeId)          // Purchase/level up
├── calculateCost(upgrade)       // Get current cost
├── getTotalEffect(pattern)      // Combined effects
├── getFiltered(filter)          // Filter upgrades
└── reset()                      // Reset all upgrades
```

**Key Features**:
- Scalable costs (increase per level)
- Effect tracking
- Purchase history
- Pattern-based effect calculation
- Integration with CurrencyManager

**Scaling Formula**:
```typescript
cost = baseCost * (scaleFactor ^ level)
```

**Internal State**:
```typescript
private upgrades: Map<string, Upgrade>
```

### 4. ParadigmManager (Game Phases)

**Location**: `src/systems/ParadigmManager.ts`

Manages major game phases with different mechanics.

```
ParadigmManager
├── addParadigm(paradigm)        // Register paradigm
├── switchTo(paradigmId)         // Change current paradigm
├── getCurrent()                 // Get active paradigm
├── getCurrentMultiplier()       // Get production multiplier
├── updateData(paradigmId, data) // Update paradigm data
└── getAll()                     // Get all paradigms
```

**Key Features**:
- Production multipliers
- Custom data storage
- Clean paradigm switching
- Single active paradigm
- Automatic event emission

**Use Cases**:
- Prestige systems
- Game progression phases
- Different game modes
- Seasonal events

**Internal State**:
```typescript
private paradigms: Map<string, Paradigm>
private currentParadigm: string | null
```

### 5. ProductionManager (Generation & Clicks)

**Location**: `src/systems/ProductionManager.ts`

Handles passive production (per second) and active clicks.

```
ProductionManager
├── setProductionRate(currencyId, rate)
├── setClickMultiplier(currencyId, multiplier)
├── tick(deltaTimeMs)            // Process passive production
├── click(currencyId, baseAmount)// Handle player click
└── getDisplayProduction()       // Get with multipliers
```

**Key Features**:
- Passive generation per second
- Click value multipliers
- Paradigm multiplier application
- Delta time handling
- Event emission on ticks

**Multiplier Application**:
```
finalAmount = baseAmount × clickMultiplier × paradigmMultiplier
```

**Internal State**:
```typescript
private productionRates: Map<string, number>
private clickMultipliers: Map<string, number>
```

### 6. UIManager (Tab Organization)

**Location**: `src/ui/UIManager.ts`

Manages UI tabs for organizing game features.

```
UIManager
├── addTab(tab)                  // Register tab
├── switchTab(tabId)             // Change active tab
├── getActive()                  // Get current tab
├── setTabVisible(tabId, visible)
└── getVisible()                 // Get visible tabs
```

**Key Features**:
- Multiple tabs with ordering
- Visibility control
- Icon/emoji support
- Active tab tracking
- Automatic switching on hide

**Internal State**:
```typescript
private tabs: Map<string, UITab>
private activeTab: string | null
```

### 7. StateManager (Persistence)

**Location**: `src/systems/StateManager.ts`

Handles game state serialization and storage.

```
StateManager
├── save(key, customState)       // Save current state
├── load(key)                    // Load saved state
├── snapshot()                   // Create state snapshot
├── delete(key)                  // Delete save file
└── setStorageAdapter(adapter)   // Use custom storage
```

**Key Features**:
- Pluggable storage backends
- State serialization
- Automatic restoration
- LocalStorage by default
- Custom adapter support

**Saved State Structure**:
```typescript
{
  timestamp: number,
  currencies: Record<string, number>,
  upgrades: Record<string, number>,
  currentParadigm: string,
  totalClicks: number,
  custom?: Record<string, unknown>
}
```

**Built-in Adapters**:
- `LocalStorageAdapter` - Browser localStorage
- `MemoryStorageAdapter` - In-memory (testing)

### 8. ClickerGameEngine (Main Orchestrator)

**Location**: `src/index.ts`

The main engine class that brings everything together.

```typescript
ClickerGameEngine
├── [All CurrencyManager methods]
├── [All UpgradeManager methods]
├── [All ParadigmManager methods]
├── [All ProductionManager methods]
├── [All UIManager methods]
├── [State management methods]
├── [Event system methods]
└── [Lifecycle methods: start, pause, resume, reset]
```

**Responsibilities**:
- Initialize all systems
- Provide unified API
- Manage game loop
- Handle auto-save
- Emit lifecycle events

**Game Loop**:
```
requestAnimationFrame loop
  ├── Calculate delta time
  ├── Call productionManager.tick(deltaTime)
  └── Schedule next frame
```

## Data Flow

### 1. Upgrade Purchase Flow

```
Player clicks "Buy Upgrade"
    ↓
UpgradeManager.purchase(upgradeId)
    ├─→ Check currency: CurrencyManager.has()
    ├─→ Deduct currency: CurrencyManager.subtract()
    ├─→ Update upgrade level
    └─→ Emit: GameEvents.UPGRADE_PURCHASED
         ↓
         EventBus broadcasts
         ↓
    Other systems listen and react
    ├─→ Update production: ProductionManager.setProductionRate()
    ├─→ Update click multiplier: ProductionManager.setClickMultiplier()
    └─→ Update UI display
```

### 2. Production Flow

```
Game Loop (every frame)
    ↓
ProductionManager.tick(deltaTime)
    ├─→ Calculate production: rate × deltaTime × paradigmMultiplier
    └─→ CurrencyManager.add(currencyId, amount)
         ↓
         Emit: GameEvents.CURRENCY_CHANGED
         ↓
         UI updates display
```

### 3. Click Flow

```
Player clicks button
    ↓
ProductionManager.click(currencyId)
    ├─→ Calculate: baseAmount × clickMultiplier × paradigmMultiplier
    ├─→ CurrencyManager.add(currencyId, amount)
    └─→ Emit: GameEvents.CLICK
         ↓
         EventBus broadcasts
         ↓
    UI updates display
```

### 4. Paradigm Switch Flow

```
Game calls: switchParadigm('prestige')
    ↓
ParadigmManager.switchTo('prestige')
    ├─→ Deactivate current paradigm
    ├─→ Activate new paradigm
    └─→ Emit: GameEvents.PARADIGM_CHANGED
         ↓
         EventBus broadcasts
         ↓
    ProductionManager applies new multiplier
    ├─→ All production uses new multiplier
    └─→ All clicks use new multiplier
```

## Extension Points

### 1. Custom Storage Adapter

```typescript
class DatabaseStorageAdapter implements StorageAdapter {
  async save(key: string, state: GameState): Promise<void> {
    await database.save(key, state);
  }
  
  async load(key: string): Promise<GameState | null> {
    return await database.load(key);
  }
  
  // ... implement other methods
}

game.getStateManager().setStorageAdapter(
  new DatabaseStorageAdapter()
);
```

### 2. Custom Event Handling

```typescript
// Listen to built-in events
game.on(GameEvents.UPGRADE_PURCHASED, (data) => {
  // React to upgrade purchases
});

// Emit custom events
game.emit('custom:achievement-unlocked', { achievementId: 'first-upgrade' });

// Listen to custom events
game.on('custom:achievement-unlocked', (data) => {
  console.log('Achievement unlocked!');
});
```

### 3. Extending Managers

```typescript
class CustomUpgradeManager extends UpgradeManager {
  public getAffordableUpgrades(): Upgrade[] {
    return this.getAll().filter(u => {
      const cost = this.calculateCost(u);
      return currencyManager.has(u.currencyId, cost);
    });
  }
}
```

## Performance Considerations

1. **Event Listeners**: Unsubscribe from events you no longer need
2. **Game Loop**: Tick frequency affects production accuracy
3. **Number Formatting**: Numbers are abbreviated for display
4. **State Serialization**: Large games may want compression
5. **Storage**: Consider storage limits for browser localStorage

## Dependencies Between Systems

```
EventBus
├── CurrencyManager ──→ EventBus
├── UpgradeManager ───→ EventBus, CurrencyManager
├── ParadigmManager ──→ EventBus
├── ProductionManager → EventBus, CurrencyManager, UpgradeManager, ParadigmManager
├── UIManager ────────→ EventBus
├── StateManager ─────→ EventBus, CurrencyManager, UpgradeManager, ParadigmManager
└── ClickerGameEngine → All of the above
```

## Testing Strategy

### Unit Testing Managers
```typescript
it('should calculate scaled upgrade cost', () => {
  const upgrade = { ...baseUpgrade, scalable: true, scaleFactor: 1.15 };
  upgradeManager.addUpgrade(upgrade);
  upgradeManager.purchase(upgrade.id); // level 1
  const cost = upgradeManager.calculateCost(upgrade);
  expect(cost).toBe(baseCost * 1.15);
});
```

### Integration Testing
```typescript
it('should update production on upgrade purchase', () => {
  game.on(GameEvents.PRODUCTION_CHANGED, (data) => {
    expect(data.rate).toBeGreaterThan(0);
  });
  
  game.purchaseUpgrade('worker');
});
```

---

This architecture provides a strong foundation while remaining flexible for game-specific customization.
