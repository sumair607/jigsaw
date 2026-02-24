/**
 * Progression System
 * Handles difficulty unlocking and progress tracking
 */

import { Difficulty } from "./types";
import { loadPuzzleProgress, updateUserStatsAfterCompletion, updateStreak } from "@/lib/storage/storage-manager";

export const UNLOCK_REQUIREMENTS: Record<Difficulty, { requiredDifficulty: Difficulty | null; requiredCount: number }> = {
  "2x2": { requiredDifficulty: null, requiredCount: 0 },
  "3x3": { requiredDifficulty: null, requiredCount: 0 },
  "4x4": { requiredDifficulty: "3x3", requiredCount: 3 },
  "5x5": { requiredDifficulty: "4x4", requiredCount: 3 },
  "6x6": { requiredDifficulty: "5x5", requiredCount: 3 },
  "8x8": { requiredDifficulty: "6x6", requiredCount: 3 },
};

export async function isDifficultyUnlocked(difficulty: Difficulty): Promise<boolean> {
  const requirement = UNLOCK_REQUIREMENTS[difficulty];
  if (!requirement.requiredDifficulty) return true;

  const progress = await loadPuzzleProgress();
  const completedCount = progress.filter(
    (p) => p.difficulty === requirement.requiredDifficulty && p.isCompleted
  ).length;

  return completedCount >= requirement.requiredCount;
}

export async function getUnlockedDifficulties(): Promise<Difficulty[]> {
  const difficulties: Difficulty[] = ["2x2", "3x3", "4x4", "5x5", "6x6", "8x8"];
  const unlocked: Difficulty[] = [];

  for (const diff of difficulties) {
    if (await isDifficultyUnlocked(diff)) {
      unlocked.push(diff);
    }
  }

  return unlocked;
}

export async function getProgressToNextUnlock(currentDifficulty: Difficulty): Promise<{
  nextDifficulty: Difficulty | null;
  current: number;
  required: number;
  remaining: number;
} | null> {
  const difficulties: Difficulty[] = ["2x2", "3x3", "4x4", "5x5", "6x6", "8x8"];
  const currentIndex = difficulties.indexOf(currentDifficulty);
  
  if (currentIndex === -1 || currentIndex === difficulties.length - 1) {
    return null;
  }

  const nextDifficulty = difficulties[currentIndex + 1];
  const requirement = UNLOCK_REQUIREMENTS[nextDifficulty];
  
  const progress = await loadPuzzleProgress();
  const completedCount = progress.filter(
    (p) => p.difficulty === currentDifficulty && p.isCompleted
  ).length;

  return {
    nextDifficulty,
    current: completedCount,
    required: requirement.requiredCount,
    remaining: Math.max(0, requirement.requiredCount - completedCount),
  };
}

export async function recordPuzzleCompletion(difficulty: Difficulty): Promise<void> {
  await updateUserStatsAfterCompletion(0, difficulty);
  await updateStreak();
}
