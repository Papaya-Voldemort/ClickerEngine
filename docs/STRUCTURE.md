# Project Structure & File Guide

## Directory Tree

```
clicker-game-engine/
│
├── src/                           # Source code
│   ├── core/                      # Core systems
│   │   ├── types.ts              # 📋 Type definitions (100+ lines)
│   │   │   ├── Observer pattern
│   │   │   ├── GameConfig interface
│   │   │   ├── Currency, Upgrade, Paradigm, UITab
│   │   │   ├── GameState for persistence
│   │   │   └── GameEvent for events
│   │   │
│   │   └── EventBus.ts           # 🔔 Central event system (150+ lines)
│   │       ├── EventBus class (Observer pattern)
│   │       ├── GameEvents constants
│   │       ├── Type-safe event subscribers
│   │       └── Unsubscribe functions
│   │
│   ├── systems/                   # Game systems
│   │   ├── CurrencyManager.ts    # 💰 Currency handling (200+ lines)
│   │   │   ├── addCurrency() - Register currencies
│   │   │   ├── get/add/subtract() - Modify amounts
│   │   │   ├── has() - Check affordability
│   │   │   ├── format() - Display formatting
│   │   │   └── Automatic number abbreviation
│   │   │
│   │   ├── UpgradeManager.ts     # ⬆️ Upgrade system (200+ lines)
│   │   │   ├── addUpgrade() - Register upgrades
│   │   │   ├── purchase() - Buy and level up
│   │   │   ├── calculateCost() - Scaling costs
│   │   │   ├── getTotalEffect() - Combine effects
│   │   │   └── getFiltered() - Filter upgrades
│   │   │
│   │   ├── ParadigmManager.ts    # 👑 Game phases (180+ lines)
│   │   │   ├── addParadigm() - Register paradigms
│   │   │   ├── switchTo() - Change active paradigm
│   │   │   ├── getCurrent() - Get active paradigm
│   │   │   ├── getCurrentMultiplier() - Get production multiplier
│   │   │   ├── updateData() - Paradigm custom data
│   │   │   └── Perfect for prestige systems
│   │   │
│   │   ├── ProductionManager.ts  # 📈 Production & clicks (180+ lines)
│   │   │   ├── setProductionRate() - Passive generation
│   │   │   ├── setClickMultiplier() - Click value
│   │   │   ├── click() - Handle player clicks
│   │   │   ├── tick() - Process each frame
│   │   │   ├── getDisplayProduction() - With multipliers
│   │   │   └── Applies paradigm multipliers
│   │   │
│   │   └── StateManager.ts       # 💾 Save/Load (180+ lines)
│   │       ├── save() - Serialize state
│   │       ├── load() - Restore state
│   │       ├── snapshot() - Create state object
│   │       ├── StorageAdapter interface
│   │       ├── LocalStorageAdapter built-in
│   │       └── MemoryStorageAdapter for testing
│   │
│   ├── ui/                        # UI systems
│   │   └── UIManager.ts          # 🎨 Tab organization (150+ lines)
│   │       ├── addTab() - Register UI tabs
│   │       ├── switchTab() - Change active tab
│   │       ├── getVisible() - Get visible tabs
│   │       ├── setTabVisible() - Hide/show tabs
│   │       └── Automatic tab ordering
│   │
│   ├── index.ts                  # 🎮 Main engine (400+ lines)
│   │   ├── ClickerGameEngine class
│   │   ├── Orchestrates all systems
│   │   ├── Unified API for game development
│   │   ├── Game loop management
│   │   ├── Auto-save system
│   │   ├── Lifecycle: start, pause, resume, reset
│   │   ├── Direct manager access for advanced use
│   │   └── Full JSDoc documentation
│   │
│   └── example.ts                # 📚 Example game (250+ lines)
│       ├── createExampleGame() function
│       ├── Shows currency setup
│       ├── Demonstrates upgrade creation
│       ├── Event handling patterns
│       ├── Production rate updates
│       ├── Paradigm switching
│       ├── runExample() for automated demo
│       └── Runnable in browser console
│
├── docs/                          # 📖 Documentation
│   ├── PROJECT_SUMMARY.md        # ⭐ Overview of everything (this helps you!)
│   ├── README.md                 # Main documentation (in root, moved to docs for reference)
│   ├── ARCHITECTURE.md           # 🏗️ System design (300+ lines)
│   │   ├── Core principles
│   │   ├── System architecture diagram
│   │   ├── Data flow diagrams
│   │   ├── Extension points
│   │   ├── Performance considerations
│   │   └── Testing strategy
│   │
│   ├── FEATURES.md               # 🎯 Feature implementations (500+ lines)
│   │   ├── Prestige/Reset systems
│   │   ├── Multiple currencies
│   │   ├── Worker/building systems
│   │   ├── Achievement systems
│   │   ├── Multiplier stacking
│   │   ├── Limited-time boosts
│   │   ├── Research/tech trees
│   │   └── Mini-games
│   │
│   ├── GETTING_STARTED.md        # 🚀 Tutorial (10 steps, 300+ lines)
│   │   ├── Step 1-10 walkthrough
│   │   ├── Complete example code
│   │   ├── Testing instructions
│   │   └── Next steps
│   │
│   └── QUICK_REFERENCE.md        # 📋 API cheat sheet (200+ lines)
│       ├── Main Engine API
│       ├── All manager methods
│       ├── Event names
│       ├── Type definitions
│       └── Common patterns
│
├── dist/                          # 🔨 Compiled output
│   ├── main.[hash].js            # Bundled game engine
│   ├── index.d.ts                # TypeScript type definitions
│   └── index.html                # Demo page
│
├── README.md                      # 📖 Main documentation
│   ├── Features overview
│   ├── Quick start
│   ├── Core concepts
│   ├── Architecture overview
│   ├── Advanced usage
│   ├── Best practices
│   └── Common patterns
│
├── package.json                   # 📦 Dependencies & scripts
│   ├── dev: webpack dev server
│   ├── build: webpack production
│   ├── type-check: tsc --noEmit
│   ├── lint: eslint
│   └── docs: typedoc
│
├── tsconfig.json                  # ⚙️ TypeScript configuration
├── webpack.config.js              # 📦 Webpack build config
└── index.html                     # 🌐 Demo HTML page
```

## Code Statistics

| Component | Lines | Purpose |
|-----------|-------|---------|
| **Core Types** | 100+ | Interface definitions |
| **EventBus** | 150+ | Event system |
| **CurrencyManager** | 200+ | Currency management |
| **UpgradeManager** | 200+ | Upgrade system |
| **ParadigmManager** | 180+ | Game phases |
| **ProductionManager** | 180+ | Production & clicks |
| **StateManager** | 180+ | Save/Load |
| **UIManager** | 150+ | Tab system |
| **Main Engine** | 400+ | Orchestrator |
| **Example Game** | 250+ | Demo implementation |
| **Documentation** | 1300+ | Guides and references |
| **TOTAL** | 3400+ | Production-ready system |

## Key Patterns Used

### 1. Manager Pattern
Each system is a self-contained manager that handles one aspect:
```typescript
CurrencyManager    // Handles all currency operations
UpgradeManager     // Handles all upgrade operations
// etc.
```

### 2. Observer Pattern (EventBus)
Systems communicate through events instead of direct references:
```typescript
eventBus.on('upgrade:purchased', (data) => { ... })
eventBus.emit('upgrade:purchased', data)
```

### 3. Factory Pattern
Managers are created by the main engine:
```typescript
new ClickerGameEngine()
  ├── new CurrencyManager(eventBus)
  ├── new UpgradeManager(eventBus, currencyManager)
  └── // ... all other managers
```

### 4. Adapter Pattern
Storage is pluggable:
```typescript
interface StorageAdapter {
  save(key, state): void
  load(key): GameState | null
  // ...
}

stateManager.setStorageAdapter(customAdapter)
```

## Main Engine Public API

The main `ClickerGameEngine` class provides 100+ public methods organized into groups:

### Currency Management (6 methods)
- addCurrency()
- getCurrency()
- getCurrencies()
- getCurrencyAmount()
- addCurrencyAmount()
- removeCurrencyAmount()

### Upgrade Management (6 methods)
- addUpgrade()
- getUpgrade()
- getUpgrades()
- getPurchasedUpgrades()
- purchaseUpgrade()
- getUpgradeCost()

### Paradigm Management (6 methods)
- addParadigm()
- getCurrentParadigm()
- getParadigms()
- switchParadigm()
- getParadigmMultiplier()

### Production Management (6 methods)
- setProductionRate()
- getProductionRate()
- getDisplayProduction()
- setClickMultiplier()
- getClickMultiplier()
- click()

### UI Management (5 methods)
- addTab()
- getTabs()
- getVisibleTabs()
- getActiveTab()
- switchTab()
- setTabVisible()

### State Management (4 methods)
- saveGame()
- loadGame()
- hasSavedGame()
- deleteSavedGame()

### Event System (3 methods)
- on()
- once()
- emit()

### Lifecycle (5 methods)
- start()
- pause()
- resume()
- reset()
- isGameRunning()

### Advanced Access (7 methods)
- getCurrencyManager()
- getUpgradeManager()
- getParadigmManager()
- getProductionManager()
- getStateManager()
- getUIManager()
- getEventBus()

## File Dependencies

```
EventBus (no dependencies)
├── CurrencyManager → EventBus
├── UpgradeManager → EventBus + CurrencyManager
├── ParadigmManager → EventBus
├── ProductionManager → EventBus + CurrencyManager + UpgradeManager + ParadigmManager
├── UIManager → EventBus
├── StateManager → EventBus + CurrencyManager + UpgradeManager + ParadigmManager
└── ClickerGameEngine → All of the above

Types → no dependencies (used everywhere)
```

## Documentation Organization

### For Game Developers
1. Start with **README.md** - Understand what you have
2. Read **GETTING_STARTED.md** - Build your first game
3. Reference **QUICK_REFERENCE.md** - Look up API methods
4. Check **FEATURES.md** - Implement advanced features

### For Engine Developers
1. Study **ARCHITECTURE.md** - Understand the design
2. Review **src/core/types.ts** - Understand the data model
3. Review **src/index.ts** - Understand orchestration
4. Review individual managers - Understand implementations
5. Review **docs/PROJECT_SUMMARY.md** - Get the big picture

## Getting Started Recommendations

1. **Read** - `docs/PROJECT_SUMMARY.md` (5 min)
2. **Understand** - `README.md` Quick Start section (10 min)
3. **Tutorial** - `docs/GETTING_STARTED.md` Step 1-5 (30 min)
4. **Experiment** - `src/example.ts` (15 min)
5. **Build** - Create your first game (1-2 hours)
6. **Reference** - Use `docs/QUICK_REFERENCE.md` as needed
7. **Advanced** - Implement features from `docs/FEATURES.md`

---

**Everything is well-documented and organized for easy navigation and development!** 🚀
