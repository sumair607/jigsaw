/**
 * Image Slicing Algorithm
 * Converts an image into puzzle pieces based on grid size
 */

import { Difficulty, GridSize, GRID_SIZES, PuzzlePiece } from "./types";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "react-native";

export interface SlicingOptions {
  canvasSize?: number; // Default: 1024
  quality?: number; // 0-1, default: 0.8
}

/**
 * Slices an image into puzzle pieces based on difficulty level
 * @param imageUri - URI of the image to slice
 * @param difficulty - Puzzle difficulty (2x2, 3x3, etc.)
 * @param options - Slicing options
 * @returns Array of puzzle pieces
 */
export async function sliceImage(
  imageUri: string,
  difficulty: Difficulty,
  options: SlicingOptions = {}
): Promise<PuzzlePiece[]> {
  console.log("🔀 [SLICE] Slicing image into", GRID_SIZES[difficulty].totalPieces, "pieces for", difficulty);
  console.log("🔀 [SLICE] Image URI:", imageUri);
  
  const canvasSize = options.canvasSize || 1024;
  const gridSize = GRID_SIZES[difficulty];
  const pieceSize = canvasSize / Math.max(gridSize.rows, gridSize.cols);

  console.log("🔀 [SLICE] Canvas:", canvasSize, "PieceSize:", pieceSize);

  // Validate image URI
  if (!imageUri || imageUri.trim() === "") {
    throw new Error("Image URI is empty or invalid");
  }

  // Use the imageUri directly - works for both local and remote images
  const normalizedImageUri = imageUri;

  // Generate puzzle pieces
  const pieces: PuzzlePiece[] = [];
  let pieceIndex = 0;

  // Spread pieces across the full board with randomized slot assignment.
  // This ensures each new game has a different jumble pattern.
  const slotCount = gridSize.totalPieces;
  const slots = Array.from({ length: slotCount }, (_, idx) => idx);
  const shuffledSlots = shuffleArray(slots);

  // Avoid pieces starting exactly at their target slot when possible.
  if (slotCount > 1) {
    for (let i = 0; i < shuffledSlots.length; i++) {
      if (shuffledSlots[i] === i) {
        const swapWith = (i + 1) % shuffledSlots.length;
        [shuffledSlots[i], shuffledSlots[swapWith]] = [
          shuffledSlots[swapWith],
          shuffledSlots[i],
        ];
      }
    }
  }

  const maxX = Math.max(0, canvasSize - pieceSize - 2);
  const maxY = Math.max(0, canvasSize - pieceSize - 2);

  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      const sourceIndex = row * gridSize.cols + col;
      const startIndex = shuffledSlots[sourceIndex];
      const startRow = Math.floor(startIndex / gridSize.cols);
      const startCol = startIndex % gridSize.cols;

      const jitter = Math.max(2, Math.floor(pieceSize * 0.12));
      const jitterX = Math.round((Math.random() * 2 - 1) * jitter);
      const jitterY = Math.round((Math.random() * 2 - 1) * jitter);
      const startX = Math.max(0, Math.min(startCol * pieceSize + jitterX, maxX));
      const startY = Math.max(0, Math.min(startRow * pieceSize + jitterY, maxY));

      const piece: PuzzlePiece = {
        id: `piece_${difficulty}_${pieceIndex}`,
        gridX: col,
        gridY: row,
        imageUri: normalizedImageUri,
        sourceRect: {
          x: col * pieceSize,
          y: row * pieceSize,
          width: pieceSize,
          height: pieceSize,
        },
        currentPosition: {
          x: startX,
          y: startY,
        },
        targetPosition: {
          x: col * pieceSize,
          y: row * pieceSize,
        },
        rotation: 0,
        isSnapped: false,
        zIndex: pieceIndex,
      };

      pieces.push(piece);
      pieceIndex++;
    }
  }

  console.log("🔀 [SLICE] Created", pieces.length, "pieces successfully");
  // Return pieces (no shuffle - keep them in staging area order)
  return pieces;
}

/**
 * Get image dimensions without loading the full image into memory
 */
export async function getImageDimensions(
  imageUri: string
): Promise<{ width: number; height: number } | null> {
  // Skip dimension check for now - just return default dimensions
  // This avoids Image.getSize timeout issues with placeholder services
  console.log("📸 Using default image dimensions (1024x1024) without pre-check for:", imageUri);
  return { width: 1024, height: 1024 };
}

/**
 * Normalize image to a square canvas
 * Crops or pads the image to fit the canvas size
 */
export async function normalizeImage(
  imageUri: string,
  canvasSize: number
): Promise<string> {
  // For now, return the original URI
  // In a production app, you would use a native image processing library
  // to actually resize and normalize the image
  // This would involve:
  // 1. Loading the image
  // 2. Calculating crop/pad dimensions to make it square
  // 3. Resizing to canvasSize x canvasSize
  // 4. Saving to cache directory
  // 5. Returning the new URI

  // Placeholder: return original URI
  // TODO: Implement actual image normalization using react-native-image-crop-picker
  // or native modules for better performance
  return imageUri;
}

/**
 * Calculate snapping radius based on difficulty
 * Higher difficulty = smaller snapping radius
 */
export function getSnappingRadius(difficulty: Difficulty): number {
  const radiusMap: Record<Difficulty, number> = {
    "2x2": 40,
    "3x3": 35,
    "4x4": 30,
    "5x5": 27,
    "6x6": 25,
    "8x8": 20,
  };
  return radiusMap[difficulty];
}

/**
 * Calculate piece size based on canvas size and grid
 */
export function calculatePieceSize(
  canvasSize: number,
  gridSize: GridSize
): number {
  return canvasSize / Math.max(gridSize.rows, gridSize.cols);
}

/**
 * Shuffle array in-place (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate piece outline for snapping visualization
 * Returns SVG path data for the piece outline
 */
export function generatePieceOutline(
  piece: PuzzlePiece,
  pieceSize: number
): string {
  // Simple rectangular outline for now
  // In a production app, you might add interlocking tabs/blanks
  const x = piece.sourceRect.x;
  const y = piece.sourceRect.y;
  const w = piece.sourceRect.width;
  const h = piece.sourceRect.height;

  // Basic rectangle outline
  return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
}

/**
 * Calculate piece interlocking tabs and blanks
 * Creates realistic jigsaw piece shapes
 */
export function generateInterlockingShape(
  piece: PuzzlePiece,
  gridSize: { rows: number; cols: number },
  pieceSize: number,
  tabSize: number = 0.2 // 20% of piece size
): string {
  const x = piece.sourceRect.x;
  const y = piece.sourceRect.y;
  const w = pieceSize;
  const h = pieceSize;
  const tab = pieceSize * tabSize;

  let path = `M ${x} ${y}`;

  // Top edge
  if (piece.gridY > 0) {
    // Has piece above - add interlocking
    path += ` L ${x + w / 2 - tab / 2} ${y}`;
    path += ` Q ${x + w / 2} ${y - tab} ${x + w / 2 + tab / 2} ${y}`;
  }
  path += ` L ${x + w} ${y}`;

  // Right edge
  if (piece.gridX < gridSize.cols - 1) {
    // Has piece to the right
    path += ` L ${x + w} ${y + h / 2 - tab / 2}`;
    path += ` Q ${x + w + tab} ${y + h / 2} ${x + w} ${y + h / 2 + tab / 2}`;
  }
  path += ` L ${x + w} ${y + h}`;

  // Bottom edge
  if (piece.gridY < gridSize.rows - 1) {
    // Has piece below
    path += ` L ${x + w / 2 + tab / 2} ${y + h}`;
    path += ` Q ${x + w / 2} ${y + h + tab} ${x + w / 2 - tab / 2} ${y + h}`;
  }
  path += ` L ${x} ${y + h}`;

  // Left edge
  if (piece.gridX > 0) {
    // Has piece to the left
    path += ` L ${x} ${y + h / 2 + tab / 2}`;
    path += ` Q ${x - tab} ${y + h / 2} ${x} ${y + h / 2 - tab / 2}`;
  }
  path += ` L ${x} ${y}`;

  path += " Z";
  return path;
}
