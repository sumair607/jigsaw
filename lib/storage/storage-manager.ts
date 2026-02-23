/**
 * Storage Management System
 * Handles AsyncStorage for progress, settings, and achievements
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GameSettings,
  PuzzleProgress,
  UserStats,
  DailyChallenge,
  AchievementBadge,
} from "@/lib/game-engine/types";

const STORAGE_KEYS = {
  GAME_SETTINGS: "jigsaw_game_settings",
  PUZZLE_PROGRESS: "jigsaw_puzzle_progress",
  USER_STATS: "jigsaw_user_stats",
  DAILY_CHALLENGE: "jigsaw_daily_challenge",
  ACHIEVEMENTS: "jigsaw_achievements",
  LAST_PLAYED: "jigsaw_last_played",
};

/**
 * Initialize default game settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  darkMode: false,
  soundEnabled: true,
  hapticsEnabled: true,
  rotationEnabledByDefault: true,
  hintsPerPuzzle: 3,
  autoSaveInterval: 5000, // 5 seconds
};

/**
 * Initialize default user stats
 */
export const DEFAULT_STATS: UserStats = {
  totalPuzzlesCompleted: 0,
  totalTimeSpent: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageCompletionTime: 0,
  highestDifficultyCompleted: "2x2",
  achievements: [],
  lastPlayedAt: 0,
};

/**
 * Load game settings from storage
 */
export async function loadGameSettings(): Promise<GameSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to load game settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save game settings to storage
 */
export async function saveGameSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.GAME_SETTINGS,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Failed to save game settings:", error);
  }
}

/**
 * Load all puzzle progress
 */
export async function loadPuzzleProgress(): Promise<PuzzleProgress[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PUZZLE_PROGRESS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load puzzle progress:", error);
    return [];
  }
}

/**
 * Save puzzle progress
 */
export async function savePuzzleProgress(
  progress: PuzzleProgress[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PUZZLE_PROGRESS,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.error("Failed to save puzzle progress:", error);
  }
}

/**
 * Update single puzzle progress
 */
export async function updatePuzzleProgress(
  puzzleId: string,
  updates: Partial<PuzzleProgress>
): Promise<void> {
  try {
    const progress = await loadPuzzleProgress();
    const index = progress.findIndex((p) => p.puzzleId === puzzleId);

    if (index >= 0) {
      progress[index] = { ...progress[index], ...updates };
    } else {
      progress.push({
        puzzleId,
        imageId: updates.imageId || "",
        difficulty: updates.difficulty || "2x2",
        category: updates.category || "default",
        isCompleted: updates.isCompleted || false,
        bestTime: updates.bestTime || null,
        bestMoves: updates.bestMoves || null,
        lastPlayedAt: updates.lastPlayedAt || Date.now(),
        completedAt: updates.completedAt || null,
        starRating: updates.starRating || 0,
      });
    }

    await savePuzzleProgress(progress);
  } catch (error) {
    console.error("Failed to update puzzle progress:", error);
  }
}

/**
 * Get progress for specific puzzle
 */
export async function getPuzzleProgress(puzzleId: string): Promise<PuzzleProgress | null> {
  try {
    const progress = await loadPuzzleProgress();
    return progress.find((p) => p.puzzleId === puzzleId) || null;
  } catch (error) {
    console.error("Failed to get puzzle progress:", error);
    return null;
  }
}

/**
 * Load user statistics
 */
export async function loadUserStats(): Promise<UserStats> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
    return stored ? JSON.parse(stored) : DEFAULT_STATS;
  } catch (error) {
    console.error("Failed to load user stats:", error);
    return DEFAULT_STATS;
  }
}

/**
 * Save user statistics
 */
export async function saveUserStats(stats: UserStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save user stats:", error);
  }
}

/**
 * Update user statistics after puzzle completion
 */
export async function updateUserStatsAfterCompletion(
  timeSpent: number,
  difficulty: string
): Promise<void> {
  try {
    const stats = await loadUserStats();

    stats.totalPuzzlesCompleted += 1;
    stats.totalTimeSpent += timeSpent;
    stats.averageCompletionTime =
      stats.totalTimeSpent / stats.totalPuzzlesCompleted;
    stats.lastPlayedAt = Date.now();

    // Update highest difficulty
    const difficultyOrder = ["2x2", "3x3", "4x4", "6x6", "8x8"];
    const currentIndex = difficultyOrder.indexOf(
      stats.highestDifficultyCompleted
    );
    const newIndex = difficultyOrder.indexOf(difficulty);
    if (newIndex > currentIndex) {
      stats.highestDifficultyCompleted = difficulty as any;
    }

    await saveUserStats(stats);
  } catch (error) {
    console.error("Failed to update user stats:", error);
  }
}

/**
 * Load daily challenge
 */
export async function loadDailyChallenge(): Promise<DailyChallenge | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load daily challenge:", error);
    return null;
  }
}

/**
 * Save daily challenge
 */
export async function saveDailyChallenge(challenge: DailyChallenge): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_CHALLENGE,
      JSON.stringify(challenge)
    );
  } catch (error) {
    console.error("Failed to save daily challenge:", error);
  }
}

/**
 * Check if daily challenge is completed today
 */
export async function isDailyChallengeCompletedToday(): Promise<boolean> {
  try {
    const challenge = await loadDailyChallenge();
    if (!challenge || !challenge.completedAt) return false;

    const today = new Date().toISOString().split("T")[0];
    const completedDate = new Date(challenge.completedAt)
      .toISOString()
      .split("T")[0];

    return today === completedDate;
  } catch (error) {
    console.error("Failed to check daily challenge completion:", error);
    return false;
  }
}

/**
 * Load achievements
 */
export async function loadAchievements(): Promise<AchievementBadge[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load achievements:", error);
    return [];
  }
}

/**
 * Save achievements
 */
export async function saveAchievements(achievements: AchievementBadge[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ACHIEVEMENTS,
      JSON.stringify(achievements)
    );
  } catch (error) {
    console.error("Failed to save achievements:", error);
  }
}

/**
 * Update achievement progress
 */
export async function updateAchievementProgress(
  achievementId: string,
  progress: number,
  maxProgress: number
): Promise<void> {
  try {
    const achievements = await loadAchievements();
    const achievement = achievements.find((a) => a.id === achievementId);

    if (achievement) {
      achievement.progress = Math.min(progress, maxProgress);
      if (achievement.progress >= maxProgress && !achievement.unlockedAt) {
        achievement.unlockedAt = Date.now();
      }
      await saveAchievements(achievements);
    }
  } catch (error) {
    console.error("Failed to update achievement progress:", error);
  }
}

/**
 * Update streak
 */
export async function updateStreak(): Promise<void> {
  try {
    const stats = await loadUserStats();
    const lastPlayed = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYED);

    if (lastPlayed) {
      const lastPlayedDate = new Date(lastPlayed);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastPlayedDateOnly = new Date(
        lastPlayedDate.getFullYear(),
        lastPlayedDate.getMonth(),
        lastPlayedDate.getDate()
      );
      const yesterdayOnly = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );

      if (lastPlayedDateOnly.getTime() === yesterdayOnly.getTime()) {
        // Played yesterday, continue streak
        stats.currentStreak += 1;
      } else if (lastPlayedDateOnly.getTime() !== new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
        // Didn't play yesterday, reset streak
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }

    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    await saveUserStats(stats);
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_PLAYED,
      new Date().toISOString()
    );
  } catch (error) {
    console.error("Failed to update streak:", error);
  }
}

/**
 * Clear all data (for testing or user request)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error("Failed to clear all data:", error);
  }
}

/**
 * Export all data as JSON
 */
export async function exportAllData(): Promise<string> {
  try {
    const settings = await loadGameSettings();
    const progress = await loadPuzzleProgress();
    const stats = await loadUserStats();
    const challenge = await loadDailyChallenge();
    const achievements = await loadAchievements();

    const data = {
      settings,
      progress,
      stats,
      challenge,
      achievements,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Failed to export data:", error);
    throw error;
  }
}

/**
 * Import data from JSON
 */
export async function importData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);

    if (data.settings) await saveGameSettings(data.settings);
    if (data.progress) await savePuzzleProgress(data.progress);
    if (data.stats) await saveUserStats(data.stats);
    if (data.challenge) await saveDailyChallenge(data.challenge);
    if (data.achievements) await saveAchievements(data.achievements);
  } catch (error) {
    console.error("Failed to import data:", error);
    throw error;
  }
}
