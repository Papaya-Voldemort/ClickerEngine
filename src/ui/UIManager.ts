/**
 * @fileoverview UI system for the clicker game engine.
 * Manages tabs, panel organization, and UI state.
 */

import { UITab } from '../core/types';
import { EventBus, GameEvents } from '../core/EventBus';

/**
 * UIManager - Handles UI organization and state
 * 
 * Manages tabs and UI panels, allowing games to organize
 * different features into distinct UI sections.
 * 
 * @example
 * ```typescript
 * const uiManager = new UIManager(eventBus);
 * 
 * uiManager.addTab({
 *   id: 'buildings',
 *   name: 'Buildings',
 *   icon: '🏢',
 *   visible: true,
 *   active: false,
 *   order: 0
 * });
 * 
 * uiManager.switchTab('buildings');
 * ```
 */
export class UIManager {
  /** Map of tab ID to tab data */
  private tabs: Map<string, UITab> = new Map();
  
  /** Currently active tab ID */
  private activeTab: string | null = null;

  /**
   * Create a new UIManager
   * @param eventBus - The event bus for emitting events
   */
  constructor(private eventBus: EventBus) {}

  /**
   * Add a new tab
   * @param tab - Tab configuration
   * @throws Error if tab with same ID already exists
   */
  public addTab(tab: UITab): void {
    if (this.tabs.has(tab.id)) {
      throw new Error(`Tab with ID '${tab.id}' already exists`);
    }

    // Set as active if first tab or marked active
    if (this.activeTab === null && tab.active) {
      this.activeTab = tab.id;
      tab.active = true;
    } else {
      tab.active = false;
    }

    this.tabs.set(tab.id, { ...tab });
  }

  /**
   * Switch to a different tab
   * @param tabId - ID of tab to switch to
   * @throws Error if tab doesn't exist or is not visible
   */
  public switchTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab '${tabId}' does not exist`);
    }
    if (!tab.visible) {
      throw new Error(`Tab '${tabId}' is not visible`);
    }

    // Deactivate current tab
    if (this.activeTab) {
      const current = this.tabs.get(this.activeTab);
      if (current) {
        current.active = false;
      }
    }

    // Activate new tab
    tab.active = true;
    this.activeTab = tabId;

    this.eventBus.emit(GameEvents.TAB_SWITCHED, {
      tabId,
      tabName: tab.name
    });
  }

  /**
   * Get current active tab
   * @returns Active tab or undefined
   */
  public getActive(): UITab | undefined {
    if (!this.activeTab) return undefined;
    return this.tabs.get(this.activeTab);
  }

  /**
   * Get current active tab ID
   * @returns Active tab ID or null
   */
  public getActiveId(): string | null {
    return this.activeTab;
  }

  /**
   * Get tab by ID
   * @param tabId - ID of tab
   * @returns Tab or undefined if not found
   */
  public getTab(tabId: string): UITab | undefined {
    return this.tabs.get(tabId);
  }

  /**
   * Get all tabs
   * @returns Array of all tabs
   */
  public getAll(): UITab[] {
    return Array.from(this.tabs.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get visible tabs
   * @returns Array of visible tabs sorted by order
   */
  public getVisible(): UITab[] {
    return this.getAll().filter(tab => tab.visible);
  }

  /**
   * Toggle tab visibility
   * @param tabId - ID of tab
   * @param visible - Whether to show tab
   */
  public setTabVisible(tabId: string, visible: boolean): void {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab '${tabId}' does not exist`);
    }

    tab.visible = visible;

    // If hiding active tab, switch to first visible tab
    if (!visible && this.activeTab === tabId) {
      const firstVisible = this.getVisible()[0];
      if (firstVisible) {
        this.switchTab(firstVisible.id);
      } else {
        this.activeTab = null;
      }
    }

    this.eventBus.emit(GameEvents.UI_UPDATED, { tabId, visible });
  }

  /**
   * Update tab order
   * @param tabId - ID of tab
   * @param order - New order value
   */
  public setTabOrder(tabId: string, order: number): void {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab '${tabId}' does not exist`);
    }
    tab.order = order;
  }

  /**
   * Remove a tab
   * @param tabId - ID of tab to remove
   */
  public removeTab(tabId: string): void {
    if (this.activeTab === tabId) {
      this.activeTab = null;
      const firstVisible = this.getVisible()[0];
      if (firstVisible) {
        this.activeTab = firstVisible.id;
      }
    }
    this.tabs.delete(tabId);
  }

  /**
   * Clear all tabs
   */
  public clear(): void {
    this.tabs.clear();
    this.activeTab = null;
  }
}
