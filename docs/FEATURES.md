# Feature Implementation Guide

This guide shows you how to implement common clicker game features using the engine.

## Table of Contents

1. [Prestige/Reset Systems](#prestigereset-systems)
2. [Multiple Currencies](#multiple-currencies)
3. [Worker/Building Systems](#workerbuilding-systems)
4. [Achievement Systems](#achievement-systems)
5. [Multiplier Stacking](#multiplier-stacking)
6. [Limited-Time Boosts](#limited-time-boosts)
7. [Research/Tech Trees](#researchttech-trees)
8. [Mini-Games](#mini-games)

## Prestige/Reset Systems

A prestige system lets players reset their progress for permanent bonuses.

### Implementation

```typescript
// Setup prestige paradigm
game.addParadigm({
  id: 'prestige-0',
  name: 'First Prestige',
  active: false,
  productionMultiplier: 1.5,
  data: { prestigeLevel: 1 }
});

// Create prestige upgrade (only available after certain threshold)
game.addUpgrade({
  id: 'prestige-upgrade',
  name: 'Prestige',
  description: 'Reset for 1.5x bonus',
  cost: 1_000_000, // Only affordable after long play
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 1.5,
  scalable: false,
  icon: '👑'
});

// Handle prestige
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId === 'prestige-upgrade') {
    // Save prestige level
    const prestigeLevel = game.getParadigmManager().getData('prestige-0').prestigeLevel as number;
    
    // Switch paradigm (applies multiplier)
    game.switchParadigm('prestige-0');
    
    // Reset everything
    game.reset();
    
    // Update prestige data
    game.getParadigmManager().updateData('prestige-0', {
      prestigeLevel: prestigeLevel + 1
    });
    
    // Emit custom event
    game.emit('prestige:activated', { prestigeLevel: prestigeLevel + 1 });
  }
});
```

### With Multiple Prestige Levels

```typescript
const MAX_PRESTIGE_LEVELS = 5;

for (let i = 0; i < MAX_PRESTIGE_LEVELS; i++) {
  const multiplier = 1.5 * (i + 1);
  
  game.addParadigm({
    id: `prestige-${i}`,
    name: `Prestige Level ${i + 1}`,
    active: false,
    productionMultiplier: multiplier,
    data: { prestigeLevel: i + 1 }
  });
}
```

## Multiple Currencies

Different currencies for different game systems.

### Implementation

```typescript
// Tier 1: Main currency (clicks)
game.addCurrency({
  id: 'gold',
  name: 'Gold',
  amount: 0,
  symbol: '💰',
  color: '#FFD700'
});

// Tier 2: Rare currency (passive/slow)
game.addCurrency({
  id: 'gems',
  name: 'Gems',
  amount: 0,
  symbol: '💎',
  color: '#00FF00'
});

// Tier 3: Premium currency (real money or very rare)
game.addCurrency({
  id: 'crystals',
  name: 'Crystals',
  amount: 0,
  symbol: '✨',
  color: '#FF69B4'
});

// Setup production for each
game.setProductionRate('gold', 0); // From clicks and workers
game.setProductionRate('gems', 1); // 1 gem per second
game.setProductionRate('crystals', 0.1); // 0.1 crystal per second

// Different upgrades for each currency
game.addUpgrade({
  id: 'gem-multiplier',
  name: 'Gem Bonus',
  description: 'Double gem production',
  cost: 100,
  currencyId: 'gold', // Paid with gold
  level: 0,
  purchased: false,
  effect: 2,
  icon: '📈'
});

// When purchased, update gem production
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId === 'gem-multiplier') {
    const multiplier = game.getUpgradeManager().getUpgrade('gem-multiplier').effect;
    game.setProductionRate('gems', multiplier);
  }
});
```

## Worker/Building Systems

Production-focused systems where players purchase buildings/workers.

### Implementation

```typescript
// Define worker tiers
const WORKERS = [
  { id: 'worker-1', name: 'Peasant', production: 1, cost: 10, icon: '👷' },
  { id: 'worker-2', name: 'Craftsman', production: 10, cost: 100, icon: '🔨' },
  { id: 'worker-3', name: 'Merchant', production: 100, cost: 1000, icon: '🏪' },
  { id: 'worker-4', name: 'Noble', production: 1000, cost: 10000, icon: '👑' }
];

// Add worker upgrades
WORKERS.forEach(worker => {
  game.addUpgrade({
    id: worker.id,
    name: worker.name,
    description: `Produce ${worker.production} gold/sec`,
    cost: worker.cost,
    currencyId: 'gold',
    level: 0,
    purchased: false,
    effect: worker.production,
    scalable: true,
    scaleFactor: 1.15,
    icon: worker.icon
  });
});

// Update production when workers are purchased
game.on('upgrade:purchased', (data) => {
  updateTotalProduction();
});

game.on('upgrade:leveled', (data) => {
  updateTotalProduction();
});

function updateTotalProduction() {
  let totalProduction = 0;
  
  WORKERS.forEach(worker => {
    const upgrade = game.getUpgrade(worker.id);
    if (upgrade) {
      totalProduction += upgrade.effect * upgrade.level;
    }
  });
  
  game.setProductionRate('gold', totalProduction);
}

// Get worker stats
function getWorkerStats() {
  return WORKERS.map(worker => {
    const upgrade = game.getUpgrade(worker.id);
    return {
      name: worker.name,
      level: upgrade?.level || 0,
      totalProduction: (upgrade?.effect || 0) * (upgrade?.level || 0),
      nextCost: upgrade ? game.getUpgradeCost(worker.id) : worker.cost
    };
  });
}
```

## Achievement Systems

Track and reward player milestones.

### Implementation

```typescript
// Define achievements
const ACHIEVEMENTS = [
  { id: 'first-click', name: 'First Click', threshold: 1, metric: 'totalClicks' },
  { id: 'hundred-clicks', name: 'Hundred Clicker', threshold: 100, metric: 'totalClicks' },
  { id: 'first-upgrade', name: 'Self Improvement', threshold: 1, metric: 'upgradesUnlocked' },
  { id: 'gold-millionaire', name: 'Gold Millionaire', threshold: 1_000_000, metric: 'gold' }
];

// Track unlocked achievements
const unlockedAchievements = new Set<string>();

// Check achievements
game.on('production:tick', () => {
  ACHIEVEMENTS.forEach(achievement => {
    if (unlockedAchievements.has(achievement.id)) return;
    
    const value = getMetricValue(achievement.metric);
    
    if (value >= achievement.threshold) {
      unlockAchievement(achievement);
    }
  });
});

function getMetricValue(metric: string): number {
  switch (metric) {
    case 'totalClicks':
      return game.getTotalClicks();
    case 'gold':
      return game.getCurrencyAmount('gold');
    case 'upgradesUnlocked':
      return game.getPurchasedUpgrades().length;
    default:
      return 0;
  }
}

function unlockAchievement(achievement: any) {
  unlockedAchievements.add(achievement.id);
  game.emit('achievement:unlocked', achievement);
  
  // Give reward (e.g., bonus currency)
  game.addCurrencyAmount('gold', 1000);
}
```

## Multiplier Stacking

Combine multiple effects for complex gameplay.

### Implementation

```typescript
// Different types of multipliers
const multiplierTypes = {
  clickPower: 1,
  production: 1,
  prestige: 1,
  event: 1,
  consumable: 1
};

// Calculate total multiplier
function getTotalMultiplier(): number {
  return Object.values(multiplierTypes).reduce((a, b) => a * b, 1);
}

// Update multipliers
game.on('upgrade:purchased', (data) => {
  if (data.upgradeId.startsWith('click-power')) {
    multiplierTypes.clickPower = 
      game.getUpgradeManager().getTotalEffect('click-power');
  }
});

game.on('paradigm:changed', () => {
  multiplierTypes.prestige = game.getParadigmMultiplier();
});

// Custom event for temporary boosts
function activateBoost(duration: number, multiplier: number) {
  multiplierTypes.event = multiplier;
  game.emit('boost:activated', { multiplier, duration });
  
  setTimeout(() => {
    multiplierTypes.event = 1;
    game.emit('boost:deactivated', {});
  }, duration);
}
```

## Limited-Time Boosts

Temporary multipliers or bonuses.

### Implementation

```typescript
interface Boost {
  id: string;
  name: string;
  multiplier: number;
  duration: number; // milliseconds
  startTime: number;
  endTime: number;
}

const activeBoosts = new Map<string, Boost>();

// Add a boost
function addBoost(boost: Omit<Boost, 'startTime' | 'endTime'>): void {
  const now = Date.now();
  const fullBoost: Boost = {
    ...boost,
    startTime: now,
    endTime: now + boost.duration
  };
  
  activeBoosts.set(boost.id, fullBoost);
  game.emit('boost:started', boost);
  
  // Update multiplier
  updateBoostMultiplier();
}

// Get total boost multiplier
function getBoostMultiplier(): number {
  const now = Date.now();
  let total = 1;
  
  activeBoosts.forEach((boost, id) => {
    if (boost.endTime < now) {
      activeBoosts.delete(id);
      game.emit('boost:ended', { boostId: id });
    } else {
      total *= boost.multiplier;
    }
  });
  
  return total;
}

function updateBoostMultiplier() {
  const multiplier = getBoostMultiplier();
  game.setClickMultiplier('gold', multiplier);
}

// Check boosts every tick
game.on('production:tick', () => {
  updateBoostMultiplier();
});

// Purchase/activate a boost
game.addUpgrade({
  id: 'temporary-boost',
  name: 'Speed Boost',
  description: '2x multiplier for 30 seconds',
  cost: 500,
  currencyId: 'gold',
  level: 0,
  purchased: false,
  effect: 2
});

game.on('upgrade:purchased', (data) => {
  if (data.upgradeId === 'temporary-boost') {
    addBoost({
      id: 'speed-boost',
      name: 'Speed Boost',
      multiplier: 2,
      duration: 30000 // 30 seconds
    });
  }
});
```

## Research/Tech Trees

Technology advancement system.

### Implementation

```typescript
interface Tech {
  id: string;
  name: string;
  unlocks: string[]; // IDs of techs it unlocks
  requirements: string[]; // IDs of techs required
  cost: number;
  effect: number;
}

const techs: Map<string, Tech> = new Map();
const unlockedTechs = new Set<string>();

function isTechUnlocked(techId: string): boolean {
  return unlockedTechs.has(techId);
}

function canUnlockTech(techId: string): boolean {
  const tech = techs.get(techId);
  if (!tech) return false;
  
  // Check if all requirements are met
  return tech.requirements.every(req => isTechUnlocked(req));
}

function unlockTech(techId: string): boolean {
  if (!canUnlockTech(techId)) return false;
  
  const tech = techs.get(techId);
  if (!tech) return false;
  
  // Check cost
  if (!game.getCurrencyManager().has('gold', tech.cost)) {
    return false;
  }
  
  // Unlock tech
  game.getCurrencyManager().subtract('gold', tech.cost);
  unlockedTechs.add(techId);
  game.emit('tech:unlocked', { techId, tech });
  
  // Unlock dependent techs become available
  tech.unlocks.forEach(unlockId => {
    if (canUnlockTech(unlockId)) {
      game.emit('tech:available', { techId: unlockId });
    }
  });
  
  return true;
}

function addTech(tech: Tech) {
  techs.set(tech.id, tech);
  
  // Check if this tech can be unlocked immediately
  if (tech.requirements.length === 0) {
    game.emit('tech:available', { techId: tech.id });
  }
}

// Example tech tree
addTech({
  id: 'basic-tools',
  name: 'Basic Tools',
  unlocks: ['iron-tools', 'basic-automation'],
  requirements: [],
  cost: 100,
  effect: 1.5
});

addTech({
  id: 'iron-tools',
  name: 'Iron Tools',
  unlocks: ['steel-tools'],
  requirements: ['basic-tools'],
  cost: 500,
  effect: 2
});

addTech({
  id: 'basic-automation',
  name: 'Basic Automation',
  unlocks: ['advanced-automation'],
  requirements: ['basic-tools'],
  cost: 1000,
  effect: 3
});
```

## Mini-Games

Small games that reward players.

### Implementation

```typescript
// Simple click-speed mini-game
function startClickMinigame() {
  const duration = 5000; // 5 seconds
  const startTime = Date.now();
  let clickCount = 0;
  
  game.emit('minigame:started', { type: 'click-speed', duration });
  
  // Override click to count for minigame
  const originalClick = game.click.bind(game);
  game.click = function(currencyId, baseAmount) {
    clickCount++;
    originalClick(currencyId, baseAmount);
  };
  
  // End minigame after duration
  setTimeout(() => {
    game.click = originalClick; // Restore original
    
    // Calculate score
    const score = clickCount;
    const bonus = Math.floor(score * 10);
    
    // Award bonus
    game.addCurrencyAmount('gold', bonus);
    game.emit('minigame:ended', { 
      type: 'click-speed', 
      score, 
      bonus 
    });
  }, duration);
}

// Slot machine mini-game
function startSlotMachine(cost: number): void {
  if (!game.getCurrencyManager().has('gold', cost)) {
    return;
  }
  
  game.removeCurrencyAmount('gold', cost);
  
  const results = [
    { symbols: ['🍒', '🍒', '🍒'], multiplier: 10 },
    { symbols: ['7️⃣', '7️⃣', '7️⃣'], multiplier: 25 },
    { symbols: ['🎰', '🎰', '🎰'], multiplier: 100 },
    { symbols: ['❌', '❌', '❌'], multiplier: 0 }
  ];
  
  // Random result
  const result = results[Math.floor(Math.random() * results.length)];
  const winnings = cost * result.multiplier;
  
  game.addCurrencyAmount('gold', winnings);
  game.emit('minigame:slot-result', { 
    symbols: result.symbols, 
    multiplier: result.multiplier,
    winnings 
  });
}
```

---

These patterns can be combined and extended to create complex, engaging clicker games. The modular architecture makes it easy to add new systems without modifying the core engine.
