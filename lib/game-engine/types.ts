import type { ImageSourcePropType } from "react-native";

/**
 * Core type definitions for the Jigsaw Puzzle game engine
 */

export type Difficulty = "2x2" | "3x3" | "4x4" | "5x5" | "6x6" | "8x8";

export interface GridSize {
  rows: number;
  cols: number;
  totalPieces: number;
}

export const GRID_SIZES: Record<Difficulty, GridSize> = {
  "2x2": { rows: 2, cols: 2, totalPieces: 4 },
  "3x3": { rows: 3, cols: 3, totalPieces: 9 },
  "4x4": { rows: 4, cols: 4, totalPieces: 16 },
  "5x5": { rows: 5, cols: 5, totalPieces: 25 },
  "6x6": { rows: 6, cols: 6, totalPieces: 36 },
  "8x8": { rows: 8, cols: 8, totalPieces: 64 },
};

export interface Vector2 {
  x: number;
  y: number;
}

export interface PuzzlePiece {
  id: string;
  gridX: number;
  gridY: number;
  imageUri: string;
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  currentPosition: Vector2;
  targetPosition: Vector2;
  rotation: number;
  isSnapped: boolean;
  zIndex: number;
}

export interface PuzzleState {
  id: string;
  imageUri: string;
  imageId: string;
  difficulty: Difficulty;
  gridSize: GridSize;
  pieces: PuzzlePiece[];
  canvasSize: number; // Square canvas size (e.g., 1024)
  pieceSize: number; // Size of each piece
  snappingRadius: number;
  isComplete: boolean;
  startTime: number;
  endTime: number | null;
  moveCount: number;
  hintsUsed: number;
  maxHints: number;
  rotationEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface PuzzleProgress {
  puzzleId: string;
  imageId: string;
  difficulty: Difficulty;
  category: string;
  isCompleted: boolean;
  bestTime: number | null;
  bestMoves: number | null;
  lastPlayedAt: number;
  completedAt: number | null;
  starRating: number; // 1-3 stars based on performance
}

export interface GameSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  rotationEnabledByDefault: boolean;
  hintsPerPuzzle: number;
  autoSaveInterval: number; // milliseconds
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  maxProgress: number;
  type: "oneTime" | "progressive";
}

export interface UserStats {
  totalPuzzlesCompleted: number;
  totalTimeSpent: number; // seconds
  currentStreak: number;
  longestStreak: number;
  averageCompletionTime: number;
  highestDifficultyCompleted: Difficulty;
  achievements: AchievementBadge[];
  lastPlayedAt: number;
}

export interface PuzzleImage {
  id: string;
  name: string;
  category: string;
  imageUri: string;
  thumbnailUri: string;
  imageSource?: ImageSourcePropType;
  thumbnailSource?: ImageSourcePropType;
  source: "default" | "shutterstock" | "custom";
  sourceUrl?: string;
  license: string;
  uploadedAt: number;
  puzzles: {
    difficulty: Difficulty;
    id: string;
  }[];
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  puzzleId: string;
  imageId: string;
  difficulty: Difficulty;
  isCompleted: boolean;
  completedAt: number | null;
  bestTime: number | null;
  bestMoves: number | null;
}

export interface SnappingResult {
  isSnapped: boolean;
  targetPiece?: PuzzlePiece;
  snapDistance: number;
}

export interface PieceCollision {
  piece1: PuzzlePiece;
  piece2: PuzzlePiece;
  distance: number;
  isColliding: boolean;
}
