/**
 * @fileoverview Main application entry point
 * Initializes and runs the game with UI
 */

// Import styles
import './styles/main.css';

// Import game engine and UI
import { createExampleGame } from './example';
import { GameUI } from './ui/GameUI';

/**
 * Initialize and start the game
 */
function initGame(): void {
  console.log('🎮 Initializing Clicker Game Engine...');

  // Create game instance
  const game = createExampleGame();

  // Try to load saved game
  if (game.hasSavedGame()) {
    console.log('📥 Loading saved game...');
    game.loadGame();
  } else {
    console.log('🆕 Starting new game...');
  }

  // Create UI
  const ui = new GameUI(game, 'game-container');
  
  // Render the UI
  ui.render();

  // Start the game loop
  game.start();

  // Start UI auto-refresh
  ui.startAutoRefresh();

  // Make game available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).game = game;
    (window as any).ui = ui;
    console.log('✅ Game initialized successfully!');
    console.log('💡 Access game via window.game or ui via window.ui');
  }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Export for external use
export { initGame };
