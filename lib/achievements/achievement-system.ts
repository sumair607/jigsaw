/**
 * Achievement System
 * Defines achievement badges and unlock conditions
 */

import { AchievementBadge, Difficulty } from "@/lib/game-engine/types";

export const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<AchievementBadge, "unlockedAt">> = {
  FIRST_PUZZLE: {
    id: "first_puzzle",
    name: "First Steps",
    description: "Complete your first puzzle",
    icon: "🧩",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  SPEED_DEMON: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a puzzle in under 2 minutes",
    icon: "⚡",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  PERFECTIONIST: {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete a puzzle without using any hints",
    icon: "🎯",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  STREAK_MASTER_7: {
    id: "streak_master_7",
    name: "Streak Master",
    description: "Maintain a 7-day playing streak",
    icon: "🔥",
    progress: 0,
    maxProgress: 7,
    type: "progressive",
  },
  STREAK_MASTER_30: {
    id: "streak_master_30",
    name: "Unstoppable",
    description: "Maintain a 30-day playing streak",
    icon: "🌟",
    progress: 0,
    maxProgress: 30,
    type: "progressive",
  },
  PUZZLE_COLLECTOR_10: {
    id: "puzzle_collector_10",
    name: "Puzzle Collector",
    description: "Complete 10 puzzles",
    icon: "📚",
    progress: 0,
    maxProgress: 10,
    type: "progressive",
  },
  PUZZLE_COLLECTOR_50: {
    id: "puzzle_collector_50",
    name: "Master Collector",
    description: "Complete 50 puzzles",
    icon: "👑",
    progress: 0,
    maxProgress: 50,
    type: "progressive",
  },
  CATEGORY_MASTER_NATURE: {
    id: "category_master_nature",
    name: "Nature Lover",
    description: "Complete all Nature category puzzles",
    icon: "🌿",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  CATEGORY_MASTER_CITIES: {
    id: "category_master_cities",
    name: "Urban Explorer",
    description: "Complete all Cities category puzzles",
    icon: "🏙️",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  CATEGORY_MASTER_ANIMALS: {
    id: "category_master_animals",
    name: "Animal Lover",
    description: "Complete all Animals category puzzles",
    icon: "🦁",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  CATEGORY_MASTER_ART: {
    id: "category_master_art",
    name: "Art Enthusiast",
    description: "Complete all Art category puzzles",
    icon: "🎨",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  DIFFICULTY_CLIMBER_EASY: {
    id: "difficulty_climber_easy",
    name: "Beginner",
    description: "Complete a 2×2 puzzle",
    icon: "🏔️",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  DIFFICULTY_CLIMBER_MEDIUM: {
    id: "difficulty_climber_medium",
    name: "Intermediate",
    description: "Complete a 3×3 puzzle",
    icon: "⛰️",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  DIFFICULTY_CLIMBER_HARD: {
    id: "difficulty_climber_hard",
    name: "Advanced",
    description: "Complete a 4×4 puzzle",
    icon: "🏔️",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  DIFFICULTY_CLIMBER_EXPERT: {
    id: "difficulty_climber_expert",
    name: "Expert",
    description: "Complete a 6×6 puzzle",
    icon: "🗻",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  DIFFICULTY_CLIMBER_MASTER: {
    id: "difficulty_climber_master",
    name: "Master",
    description: "Complete an 8×8 puzzle",
    icon: "🚀",
    progress: 0,
    maxProgress: 1,
    type: "oneTime",
  },
  CUSTOM_CREATOR: {
    id: "custom_creator",
    name: "Custom Creator",
    description: "Upload 5 custom images",
    icon: "🎬",
    progress: 0,
    maxProgress: 5,
    type: "progressive",
  },
  DAILY_DEVOTEE: {
    id: "daily_devotee",
    name: "Daily Devotee",
    description: "Complete the daily challenge 7 days in a row",
    icon: "📅",
    progress: 0,
    maxProgress: 7,
    type: "progressive",
  },
  SHARE_MASTER: {
    id: "share_master",
    name: "Share Master",
    description: "Share 10 puzzle completions",
    icon: "📤",
    progress: 0,
    maxProgress: 10,
    type: "progressive",
  },
  HINT_HOARDER: {
    id: "hint_hoarder",
    name: "Hint Hoarder",
    description: "Use 50 hints in total",
    icon: "💡",
    progress: 0,
    maxProgress: 50,
    type: "progressive",
  },
};

/**
 * Initialize achievements for new user
 */
export function initializeAchievements(): AchievementBadge[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS).map((def) => ({
    ...def,
    unlockedAt: null,
  } as AchievementBadge));
}

/**
 * Check if achievement should be unlocked based on game state
 */
export function checkAchievementUnlock(
  achievementId: string,
  stats: {
    totalPuzzlesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    highestDifficultyCompleted: Difficulty;
    totalTimeSpent: number;
  },
  lastGameStats?: {
    timeSpent: number;
    hintsUsed: number;
    difficulty: Difficulty;
  }
): boolean {
  if (!lastGameStats) return false;

  switch (achievementId) {
    case "first_puzzle":
      return stats.totalPuzzlesCompleted >= 1;

    case "speed_demon":
      return lastGameStats.timeSpent < 120; // 2 minutes

    case "perfectionist":
      return lastGameStats.hintsUsed === 0;

    case "streak_master_7":
      return stats.currentStreak >= 7;

    case "streak_master_30":
      return stats.currentStreak >= 30;

    case "puzzle_collector_10":
      return stats.totalPuzzlesCompleted >= 10;

    case "puzzle_collector_50":
      return stats.totalPuzzlesCompleted >= 50;

    case "difficulty_climber_easy":
      return stats.highestDifficultyCompleted === "2x2" || isDifficultyHigherOrEqual("2x2", stats.highestDifficultyCompleted);

    case "difficulty_climber_medium":
      return isDifficultyHigherOrEqual("3x3", stats.highestDifficultyCompleted);

    case "difficulty_climber_hard":
      return isDifficultyHigherOrEqual("4x4", stats.highestDifficultyCompleted);

    case "difficulty_climber_expert":
      return isDifficultyHigherOrEqual("6x6", stats.highestDifficultyCompleted);

    case "difficulty_climber_master":
      return isDifficultyHigherOrEqual("8x8", stats.highestDifficultyCompleted);

    default:
      return false;
  }
}

/**
 * Check if one difficulty is higher or equal to another
 */
function isDifficultyHigherOrEqual(target: Difficulty, current: Difficulty): boolean {
  const order: Difficulty[] = ["2x2", "3x3", "4x4", "6x6", "8x8"];
  const targetIndex = order.indexOf(target);
  const currentIndex = order.indexOf(current);
  return currentIndex >= targetIndex;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(
  achievements: AchievementBadge[],
  id: string
): AchievementBadge | undefined {
  return achievements.find((a) => a.id === id);
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(
  achievements: AchievementBadge[]
): AchievementBadge[] {
  return achievements.filter((a) => a.unlockedAt !== null);
}

/**
 * Get locked achievements
 */
export function getLockedAchievements(
  achievements: AchievementBadge[]
): AchievementBadge[] {
  return achievements.filter((a) => a.unlockedAt === null);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  achievements: AchievementBadge[],
  category: "difficulty" | "collection" | "streak" | "special"
): AchievementBadge[] {
  const categoryMap: Record<string, string[]> = {
    difficulty: [
      "difficulty_climber_easy",
      "difficulty_climber_medium",
      "difficulty_climber_hard",
      "difficulty_climber_expert",
      "difficulty_climber_master",
    ],
    collection: [
      "puzzle_collector_10",
      "puzzle_collector_50",
      "category_master_nature",
      "category_master_cities",
      "category_master_animals",
      "category_master_art",
      "custom_creator",
    ],
    streak: ["streak_master_7", "streak_master_30", "daily_devotee"],
    special: [
      "first_puzzle",
      "speed_demon",
      "perfectionist",
      "share_master",
      "hint_hoarder",
    ],
  };

  const ids = categoryMap[category] || [];
  return achievements.filter((a) => ids.includes(a.id));
}

/**
 * Calculate achievement progress percentage
 */
export function getAchievementProgressPercentage(
  achievement: AchievementBadge
): number {
  if (achievement.maxProgress === 0) return 0;
  return Math.round((achievement.progress / achievement.maxProgress) * 100);
}

/**
 * Get next achievement milestone
 */
export function getNextMilestone(
  achievement: AchievementBadge
): number | null {
  if (achievement.unlockedAt) return null;
  if (achievement.maxProgress === 1) return null;

  // Return next 25% milestone
  const milestones = [
    Math.ceil(achievement.maxProgress * 0.25),
    Math.ceil(achievement.maxProgress * 0.5),
    Math.ceil(achievement.maxProgress * 0.75),
    achievement.maxProgress,
  ];

  return milestones.find((m) => m > achievement.progress) || null;
}
