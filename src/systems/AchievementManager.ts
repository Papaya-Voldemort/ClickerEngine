/**
 * @fileoverview Achievement system for tracking player accomplishments
 */

import { EventBus } from '../core/EventBus';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlocked: boolean;
  progress: number;
  target: number;
  reward?: {
    currencyId?: string;
    amount?: number;
    multiplier?: number;
  };
  hidden?: boolean;
  category?: string;
}

export class AchievementManager {
  private achievements: Map<string, Achievement> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Add a new achievement
   */
  public addAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }

  /**
   * Update achievement progress
   */
  public updateProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.progress = progress;

    if (progress >= achievement.target) {
      this.unlockAchievement(achievementId);
    }

    this.eventBus.emit('achievement:progress', {
      achievementId,
      progress,
      target: achievement.target
    });
  }

  /**
   * Unlock an achievement
   */
  public unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.progress = achievement.target;

    this.eventBus.emit('achievement:unlocked', {
      achievementId,
      achievement
    });
  }

  /**
   * Check if achievement is unlocked
   */
  public isUnlocked(achievementId: string): boolean {
    return this.achievements.get(achievementId)?.unlocked ?? false;
  }

  /**
   * Get all achievements
   */
  public getAll(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  public getUnlocked(): Achievement[] {
    return this.getAll().filter(a => a.unlocked);
  }

  /**
   * Get locked achievements
   */
  public getLocked(): Achievement[] {
    return this.getAll().filter(a => !a.unlocked && !a.hidden);
  }

  /**
   * Get achievement by ID
   */
  public getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId);
  }

  /**
   * Get achievements by category
   */
  public getByCategory(category: string): Achievement[] {
    return this.getAll().filter(a => a.category === category);
  }

  /**
   * Get completion percentage
   */
  public getCompletionPercentage(): number {
    const total = this.achievements.size;
    if (total === 0) return 0;
    const unlocked = this.getUnlocked().length;
    return (unlocked / total) * 100;
  }

  /**
   * Serialize state for saving
   */
  public serialize(): Record<string, { unlocked: boolean; progress: number }> {
    const state: Record<string, { unlocked: boolean; progress: number }> = {};
    this.achievements.forEach((achievement, id) => {
      state[id] = {
        unlocked: achievement.unlocked,
        progress: achievement.progress
      };
    });
    return state;
  }

  /**
   * Deserialize state from loading
   */
  public deserialize(state: Record<string, { unlocked: boolean; progress: number }>): void {
    Object.entries(state).forEach(([id, data]) => {
      const achievement = this.achievements.get(id);
      if (achievement) {
        achievement.unlocked = data.unlocked;
        achievement.progress = data.progress;
      }
    });
  }

  /**
   * Clear all achievements
   */
  public clear(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.progress = 0;
    });
  }
}
