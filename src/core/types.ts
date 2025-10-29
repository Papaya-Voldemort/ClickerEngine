/**
 * @fileoverview Base types and interfaces for the clicker game engine.
 * These define the fundamental data structures used throughout the engine.
 */

/**
 * Observer pattern callback function type
 * Used for event listeners in the game engine
 */
export type Observer<T> = (data: T) => void;

/**
 * Configuration object for initializing the game engine
 */
export interface GameConfig {
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Initial game state (optional) */
  initialState?: Record<string, unknown>;
  /** Auto-save interval in milliseconds (0 to disable) */
  autoSaveInterval?: number;
}

/**
 * Generic structure for a resource/currency in the game
 */
export interface Currency {
  /** Unique identifier for the currency */
  id: string;
  /** Display name of the currency */
  name: string;
  /** Current amount of this currency */
  amount: number;
  /** Symbol to display (e.g., "$", "⭐") */
  symbol: string;
  /** Color for UI representation */
  color?: string;
  /** Whether this currency is visible in UI */
  visible?: boolean;
  /** Custom formatter for display */
  formatter?: (amount: number) => string;
}

/**
 * Generic structure for an upgrade that can be purchased
 */
export interface Upgrade {
  /** Unique identifier for the upgrade */
  id: string;
  /** Display name */
  name: string;
  /** Description of what this upgrade does */
  description: string;
  /** Cost in currency to purchase */
  cost: number;
  /** Currency type required to purchase this upgrade */
  currencyId: string;
  /** Current level/count of this upgrade */
  level: number;
  /** Whether this upgrade has been purchased at least once */
  purchased: boolean;
  /** Effect provided by each level */
  effect: number;
  /** Whether cost increases with level */
  scalable?: boolean;
  /** Scaling factor for cost (if scalable) */
  scaleFactor?: number;
  /** Icon or emoji for the upgrade */
  icon?: string;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a game paradigm - a major game phase/mode
 */
export interface Paradigm {
  /** Unique identifier */
  id: string;
  /** Display name of the paradigm */
  name: string;
  /** Description of this paradigm */
  description: string;
  /** Whether this paradigm is currently active */
  active: boolean;
  /** Multiplier for production/clicks in this paradigm */
  productionMultiplier: number;
  /** Custom logic or data for this paradigm */
  data?: Record<string, unknown>;
}

/**
 * Represents a UI tab that groups related content
 */
export interface UITab {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Icon or emoji */
  icon?: string;
  /** Whether this tab is visible */
  visible: boolean;
  /** Whether this tab is currently active */
  active: boolean;
  /** Order in tab list (lower = earlier) */
  order: number;
  /** Color for active state */
  activeColor?: string;
}

/**
 * Game state snapshot for persistence
 */
export interface GameState {
  /** Timestamp of state save */
  timestamp: number;
  /** All currencies and their amounts */
  currencies: Record<string, number>;
  /** All upgrades and their levels */
  upgrades: Record<string, number>;
  /** Current active paradigm */
  currentParadigm: string;
  /** Total clicks/taps so far */
  totalClicks: number;
  /** Achievement progress and unlock state */
  achievements?: Record<string, { unlocked: boolean; progress: number }>;
  /** Custom game-specific state */
  custom?: Record<string, unknown>;
}

/**
 * Event emitted by the game engine
 */
export interface GameEvent {
  /** Type of event */
  type: string;
  /** Data associated with the event */
  data?: unknown;
  /** Timestamp of the event */
  timestamp: number;
}
