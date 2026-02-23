/**
 * Puzzle Game Logic & State Management
 * Handles game state, actions, and game flow
 */

import { PuzzleState, PuzzlePiece, Difficulty, GRID_SIZES } from "./types";
import {
  checkSnapping,
  isPuzzleComplete,
  getCompletionPercentage,
  snapPiece,
} from "./collision-detection";
import { sliceImage, getSnappingRadius } from "./image-slicer";

export type PieceLayoutMode = "spread" | "tray";

export type PuzzleAction =
  | { type: "INIT_PUZZLE"; payload: InitPuzzlePayload }
  | { type: "INIT_PUZZLE_COMPLETE"; payload: PuzzleState }
  | { type: "BRING_PIECE_TO_FRONT"; payload: { pieceId: string } }
  | { type: "SET_UNSNAPPED_LAYOUT"; payload: { mode: PieceLayoutMode } }
  | {
      type: "REPACK_UNSNAPPED";
      payload: { mode: PieceLayoutMode; excludePieceId?: string };
    }
  | { type: "UPDATE_PIECE_POSITION"; payload: { pieceId: string; x: number; y: number } }
  | { type: "UPDATE_PIECE_ROTATION"; payload: { pieceId: string; rotation: number } }
  | { type: "SNAP_PIECE"; payload: { pieceId: string } }
  | { type: "UNDO_MOVE"; payload?: undefined }
  | { type: "USE_HINT"; payload?: undefined }
  | { type: "SHUFFLE_UNSNAPPED"; payload?: undefined }
  | { type: "TOGGLE_SOUND"; payload?: undefined }
  | { type: "TOGGLE_HAPTICS"; payload?: undefined }
  | { type: "CHECK_COMPLETION"; payload?: undefined }
  | { type: "RESET_PUZZLE"; payload?: undefined };

export interface InitPuzzlePayload {
  puzzleId: string;
  imageId: string;
  imageUri: string;
  difficulty: Difficulty;
  canvasSize?: number;
  rotationEnabled?: boolean;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

/**
 * Initialize puzzle state from image and difficulty
 */
export async function initializePuzzle(
  payload: InitPuzzlePayload
): Promise<PuzzleState> {
  const difficulty = payload.difficulty;
  const gridSize = GRID_SIZES[difficulty];
  const canvasSize = payload.canvasSize || 1024;
  const snappingRadius = getSnappingRadius(difficulty);

  // Slice image into pieces
  const pieces = await sliceImage(payload.imageUri, difficulty, { canvasSize });

  return {
    id: payload.puzzleId,
    imageUri: payload.imageUri,
    imageId: payload.imageId,
    difficulty,
    gridSize,
    pieces,
    canvasSize,
    pieceSize: canvasSize / Math.max(gridSize.rows, gridSize.cols),
    snappingRadius,
    isComplete: false,
    startTime: Date.now(),
    endTime: null,
    moveCount: 0,
    hintsUsed: 0,
    maxHints: 3,
    rotationEnabled: payload.rotationEnabled ?? true,
    soundEnabled: payload.soundEnabled ?? true,
    hapticsEnabled: payload.hapticsEnabled ?? true,
  };
}

/**
 * Puzzle state reducer
 */
export function puzzleReducer(
  state: PuzzleState | null,
  action: PuzzleAction
): PuzzleState | null {
  // Handle initialization
  if (action.type === "INIT_PUZZLE_COMPLETE") {
    return (action as any).payload as PuzzleState;
  }

  // All other actions require a valid state
  if (!state) return state;

  const computeUnsnappedLayoutPositions = (
    mode: PieceLayoutMode,
    excludePieceId?: string
  ): Map<string, { x: number; y: number }> => {
    const unsnapped = state.pieces.filter(
      (piece) => !piece.isSnapped && piece.id !== excludePieceId
    );
    const positions = new Map<string, { x: number; y: number }>();
    if (unsnapped.length === 0) return positions;

    const maxX = Math.max(0, state.canvasSize - state.pieceSize - 2);
    const maxY = Math.max(0, state.canvasSize - state.pieceSize - 2);

    if (mode === "spread") {
      const count = unsnapped.length;
      const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
      const rows = Math.max(1, Math.ceil(count / cols));
      const stepX = cols === 1 ? 0 : maxX / (cols - 1);
      const stepY = rows === 1 ? 0 : maxY / (rows - 1);
      const sorted = [...unsnapped].sort((a, b) => a.id.localeCompare(b.id));

      sorted.forEach((piece, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = Math.max(0, Math.min(Math.round(col * stepX), maxX));
        const y = Math.max(0, Math.min(Math.round(row * stepY), maxY));
        positions.set(piece.id, { x, y });
      });
      return positions;
    }

    const trayStartX = Math.floor(state.canvasSize * 0.62);
    const stepX = Math.max(18, Math.floor(state.pieceSize * 0.42));
    const stepY = Math.max(18, Math.floor(state.pieceSize * 0.42));
    const availableWidth = Math.max(stepX, state.canvasSize - trayStartX - state.pieceSize - 8);
    const cols = Math.max(1, Math.floor(availableWidth / stepX));

    // Compact by current visual order so gap is filled predictably.
    const sorted = [...unsnapped].sort((a, b) => {
      if (a.currentPosition.y !== b.currentPosition.y) {
        return a.currentPosition.y - b.currentPosition.y;
      }
      return a.currentPosition.x - b.currentPosition.x;
    });

    sorted.forEach((piece, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = Math.max(0, Math.min(trayStartX + col * stepX, maxX));
      const y = Math.max(0, Math.min(16 + row * stepY, maxY));
      positions.set(piece.id, { x, y });
    });
    return positions;
  };

  switch (action.type) {
    case "BRING_PIECE_TO_FRONT": {
      const { pieceId } = action.payload;
      const targetPiece = state.pieces.find((piece) => piece.id === pieceId);
      if (!targetPiece || targetPiece.isSnapped) {
        return state;
      }

      return {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.id === pieceId ? { ...piece, zIndex: Date.now() } : piece
        ),
      };
    }

    case "UPDATE_PIECE_POSITION": {
      const { pieceId, x, y } = action.payload;
      const targetPiece = state.pieces.find((piece) => piece.id === pieceId);
      if (!targetPiece || targetPiece.isSnapped) {
        return state;
      }
      return {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.id === pieceId
            ? { ...piece, currentPosition: { x, y }, zIndex: Date.now() }
            : piece
        ),
        moveCount: state.moveCount + 1,
      };
    }

    case "SET_UNSNAPPED_LAYOUT": {
      const positions = computeUnsnappedLayoutPositions(action.payload.mode);
      if (positions.size === 0) {
        return state;
      }

      const zBase = Date.now();
      return {
        ...state,
        pieces: state.pieces.map((piece, idx) => {
          if (piece.isSnapped) return piece;
          const pos = positions.get(piece.id);
          if (!pos) return piece;
          return {
            ...piece,
            currentPosition: pos,
            zIndex: zBase + idx,
          };
        }),
      };
    }

    case "REPACK_UNSNAPPED": {
      const positions = computeUnsnappedLayoutPositions(
        action.payload.mode,
        action.payload.excludePieceId
      );
      if (positions.size === 0) {
        return state;
      }

      const zBase = Date.now();
      return {
        ...state,
        pieces: state.pieces.map((piece, idx) => {
          if (piece.isSnapped || piece.id === action.payload.excludePieceId) {
            return piece;
          }
          const pos = positions.get(piece.id);
          if (!pos) return piece;
          return {
            ...piece,
            currentPosition: pos,
            zIndex: zBase + idx,
          };
        }),
      };
    }

    case "UPDATE_PIECE_ROTATION": {
      const { pieceId, rotation } = action.payload;
      return {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.id === pieceId ? { ...piece, rotation } : piece
        ),
      };
    }

    case "SNAP_PIECE": {
      const { pieceId } = action.payload;
      const piece = state.pieces.find((p) => p.id === pieceId);

      if (!piece) return state;

      const snappingResult = checkSnapping(
        piece,
        state.pieces,
        state.snappingRadius,
        state.pieceSize
      );

      if (snappingResult.isSnapped) {
        const snappedPiece = snapPiece(piece);
        const updatedPieces = state.pieces.map((p) =>
          p.id === pieceId ? snappedPiece : p
        );

        const isComplete = isPuzzleComplete(updatedPieces);

        return {
          ...state,
          pieces: updatedPieces,
          isComplete,
          endTime: isComplete ? Date.now() : null,
        };
      }

      return state;
    }

    case "UNDO_MOVE": {
      // Undo last move by resetting piece to random position
      // In a production app, you'd maintain a move history
      if (state.pieces.length === 0) return state;

      const lastSnappedIndex = state.pieces.findIndex((p) => p.isSnapped);
      if (lastSnappedIndex === -1) return state;

      const piece = state.pieces[lastSnappedIndex];
      const canvasSize = state.canvasSize;
      const pieceSize = state.pieceSize;

      return {
        ...state,
        pieces: state.pieces.map((p) =>
          p.id === piece.id
            ? {
                ...p,
                currentPosition: {
                  x: Math.random() * (canvasSize - pieceSize),
                  y: Math.random() * (canvasSize - pieceSize),
                },
                isSnapped: false,
              }
            : p
        ),
        moveCount: Math.max(0, state.moveCount - 1),
      };
    }

    case "USE_HINT": {
      if (state.hintsUsed >= state.maxHints) {
        return state; // No more hints available
      }

      // Find first unsnapped piece and highlight it
      const unsnappedPiece = state.pieces.find((p) => !p.isSnapped);
      if (!unsnappedPiece) return state;

      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        // In a production app, you'd add a visual hint indicator
      };
    }

    case "SHUFFLE_UNSNAPPED": {
      const unsnapped = state.pieces.filter((piece) => !piece.isSnapped);
      if (unsnapped.length === 0) {
        return state;
      }

      const maxX = Math.max(0, state.canvasSize - state.pieceSize - 2);
      const maxY = Math.max(0, state.canvasSize - state.pieceSize - 2);
      const shuffled = [...unsnapped].sort(() => Math.random() - 0.5);
      const zBase = Date.now();

      const newPositions = new Map<string, { x: number; y: number; zIndex: number }>();
      shuffled.forEach((piece, index) => {
        newPositions.set(piece.id, {
          x: Math.random() * maxX,
          y: Math.random() * maxY,
          zIndex: zBase + index,
        });
      });

      return {
        ...state,
        pieces: state.pieces.map((piece) => {
          if (piece.isSnapped) return piece;
          const next = newPositions.get(piece.id);
          if (!next) return piece;
          return {
            ...piece,
            currentPosition: { x: next.x, y: next.y },
            zIndex: next.zIndex,
          };
        }),
      };
    }

    case "TOGGLE_SOUND": {
      return {
        ...state,
        soundEnabled: !state.soundEnabled,
      };
    }

    case "TOGGLE_HAPTICS": {
      return {
        ...state,
        hapticsEnabled: !state.hapticsEnabled,
      };
    }

    case "CHECK_COMPLETION": {
      const isComplete = isPuzzleComplete(state.pieces);
      return {
        ...state,
        isComplete,
        endTime: isComplete && !state.endTime ? Date.now() : state.endTime,
      };
    }

    case "RESET_PUZZLE": {
      // Reset all pieces to random positions
      const canvasSize = state.canvasSize;
      const pieceSize = state.pieceSize;

      return {
        ...state,
        pieces: state.pieces.map((piece) => ({
          ...piece,
          currentPosition: {
            x: Math.random() * (canvasSize - pieceSize),
            y: Math.random() * (canvasSize - pieceSize),
          },
          isSnapped: false,
          rotation: 0,
        })),
        isComplete: false,
        endTime: null,
        moveCount: 0,
        hintsUsed: 0,
        startTime: Date.now(),
      };
    }

    default:
      return state;
  }
}

/**
 * Default initial puzzle state
 */
export const initialPuzzleState: PuzzleState = {
  id: "default",
  imageUri: "",
  imageId: "",
  difficulty: "3x3",
  gridSize: GRID_SIZES["3x3"],
  pieces: [],
  canvasSize: 1024,
  pieceSize: 341,
  snappingRadius: 50,
  isComplete: false,
  startTime: Date.now(),
  endTime: null,
  moveCount: 0,
  hintsUsed: 0,
  maxHints: 3,
  rotationEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
};

/**
 * Calculate game statistics
 */
export function calculateGameStats(state: PuzzleState) {
  const completionPercentage = isPuzzleComplete(state.pieces)
    ? 100
    : Math.round(
        (state.pieces.filter((p) => p.isSnapped).length / state.pieces.length) *
          100
      );

  const elapsedTime = state.endTime
    ? (state.endTime - state.startTime) / 1000
    : (Date.now() - state.startTime) / 1000;

  // Calculate star rating (1-3 stars)
  // Based on time taken and moves made
  const avgTimePerPiece = elapsedTime / state.pieces.length;
  const avgMovesPerPiece = state.moveCount / state.pieces.length;

  let starRating = 3;
  if (avgTimePerPiece > 30 || avgMovesPerPiece > 5) {
    starRating = 2;
  }
  if (avgTimePerPiece > 60 || avgMovesPerPiece > 10) {
    starRating = 1;
  }

  return {
    completionPercentage,
    elapsedTime,
    starRating,
    hintsRemaining: state.maxHints - state.hintsUsed,
  };
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: Difficulty): string {
  const labels: Record<Difficulty, string> = {
    "2x2": "Easy (4 pieces)",
    "3x3": "Medium (9 pieces)",
    "4x4": "Hard (16 pieces)",
    "6x6": "Expert (36 pieces)",
    "8x8": "Master (64 pieces)",
  };
  return labels[difficulty];
}

/**
 * Estimate completion time based on difficulty
 */
export function estimateCompletionTime(difficulty: Difficulty): string {
  const timeMap: Record<Difficulty, string> = {
    "2x2": "1-2 min",
    "3x3": "3-5 min",
    "4x4": "8-12 min",
    "6x6": "20-30 min",
    "8x8": "45-60 min",
  };
  return timeMap[difficulty];
}
