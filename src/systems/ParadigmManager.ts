/**
 * @fileoverview Paradigm system for the clicker game engine.
 * Manages major game phases/modes with different mechanics.
 */

import { Paradigm } from '../core/types';
import { EventBus, GameEvents } from '../core/EventBus';

/**
 * ParadigmManager - Handles paradigm shifts and management
 * 
 * Paradigms represent major game phases (e.g., "Early Game", "Mid Game", "Prestige Mode").
 * Each paradigm can have different production multipliers and custom mechanics.
 * 
 * @example
 * ```typescript
 * const paradigmManager = new ParadigmManager(eventBus);
 * 
 * paradigmManager.addParadigm({
 *   id: 'prestige',
 *   name: 'Prestige Mode',
 *   description: 'Reset and gain permanent bonuses',
 *   active: false,
 *   productionMultiplier: 1.5,
 *   data: { prestigeCount: 0 }
 * });
 * 
 * paradigmManager.switchTo('prestige');
 * ```
 */
export class ParadigmManager {
  /** Map of paradigm ID to paradigm data */
  private paradigms: Map<string, Paradigm> = new Map();
  
  /** Currently active paradigm ID */
  private currentParadigm: string | null = null;

  /**
   * Create a new ParadigmManager
   * @param eventBus - The event bus for emitting events
   */
  constructor(private eventBus: EventBus) {}

  /**
   * Register a new paradigm
   * @param paradigm - Paradigm configuration
   * @throws Error if paradigm with same ID already exists
   */
  public addParadigm(paradigm: Paradigm): void {
    if (this.paradigms.has(paradigm.id)) {
      throw new Error(`Paradigm with ID '${paradigm.id}' already exists`);
    }

    // Ensure only one paradigm is active initially
    if (paradigm.active && this.currentParadigm === null) {
      this.currentParadigm = paradigm.id;
    } else if (paradigm.active) {
      paradigm.active = false;
    }

    this.paradigms.set(paradigm.id, { ...paradigm });
  }

  /**
   * Switch to a different paradigm
   * @param paradigmId - ID of paradigm to switch to
   * @throws Error if paradigm doesn't exist
   */
  public switchTo(paradigmId: string): void {
    if (!this.paradigms.has(paradigmId)) {
      throw new Error(`Paradigm '${paradigmId}' does not exist`);
    }

    // Deactivate current paradigm
    if (this.currentParadigm) {
      const current = this.paradigms.get(this.currentParadigm);
      if (current) {
        current.active = false;
      }
    }

    // Activate new paradigm
    const newParadigm = this.paradigms.get(paradigmId)!;
    newParadigm.active = true;
    this.currentParadigm = paradigmId;

    this.eventBus.emit(GameEvents.PARADIGM_CHANGED, {
      paradigmId,
      paradigmName: newParadigm.name,
      multiplier: newParadigm.productionMultiplier
    });
  }

  /**
   * Get current paradigm
   * @returns Current paradigm or undefined if none active
   */
  public getCurrent(): Paradigm | undefined {
    if (!this.currentParadigm) return undefined;
    return this.paradigms.get(this.currentParadigm);
  }

  /**
   * Get current paradigm ID
   * @returns Current paradigm ID or null
   */
  public getCurrentId(): string | null {
    return this.currentParadigm;
  }

  /**
   * Get paradigm by ID
   * @param paradigmId - ID of paradigm
   * @returns Paradigm or undefined if not found
   */
  public getParadigm(paradigmId: string): Paradigm | undefined {
    return this.paradigms.get(paradigmId);
  }

  /**
   * Get current production multiplier
   * @returns Production multiplier of current paradigm (1 if none active)
   */
  public getCurrentMultiplier(): number {
    const current = this.getCurrent();
    return current?.productionMultiplier ?? 1;
  }

  /**
   * Get all paradigms
   * @returns Array of all paradigms
   */
  public getAll(): Paradigm[] {
    return Array.from(this.paradigms.values());
  }

  /**
   * Check if paradigm is available (can be switched to)
   * @param paradigmId - ID of paradigm to check
   * @returns Whether paradigm exists
   */
  public isAvailable(paradigmId: string): boolean {
    return this.paradigms.has(paradigmId);
  }

  /**
   * Update paradigm data
   * @param paradigmId - ID of paradigm
   * @param data - New data to merge
   */
  public updateData(paradigmId: string, data: Record<string, unknown>): void {
    const paradigm = this.paradigms.get(paradigmId);
    if (!paradigm) {
      throw new Error(`Paradigm '${paradigmId}' does not exist`);
    }
    paradigm.data = { ...paradigm.data, ...data };
  }

  /**
   * Get paradigm data
   * @param paradigmId - ID of paradigm
   * @returns Paradigm data or empty object if not found
   */
  public getData(paradigmId: string): Record<string, unknown> {
    return this.paradigms.get(paradigmId)?.data ?? {};
  }

  /**
   * Update paradigm production multiplier
   * @param paradigmId - ID of paradigm
   * @param multiplier - New multiplier
   */
  public setMultiplier(paradigmId: string, multiplier: number): void {
    const paradigm = this.paradigms.get(paradigmId);
    if (!paradigm) {
      throw new Error(`Paradigm '${paradigmId}' does not exist`);
    }
    paradigm.productionMultiplier = multiplier;
  }

  /**
   * Remove a paradigm
   * @param paradigmId - ID of paradigm to remove
   */
  public removeParadigm(paradigmId: string): void {
    if (this.currentParadigm === paradigmId) {
      this.currentParadigm = null;
    }
    this.paradigms.delete(paradigmId);
  }

  /**
   * Clear all paradigms
   */
  public clear(): void {
    this.paradigms.clear();
    this.currentParadigm = null;
  }
}
