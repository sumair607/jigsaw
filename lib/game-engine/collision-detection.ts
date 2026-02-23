/**
 * Collision Detection & Snapping System
 * Handles piece-to-piece collision detection and smart snapping
 */

import { PuzzlePiece, Vector2, SnappingResult, PieceCollision } from "./types";

/**
 * Calculate distance between two points
 */
export function distance(p1: Vector2, p2: Vector2): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two pieces are colliding (bounding box intersection)
 */
export function checkCollision(
  piece1: PuzzlePiece,
  piece2: PuzzlePiece,
  pieceSize: number
): boolean {
  const p1 = piece1.currentPosition;
  const p2 = piece2.currentPosition;

  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;

  return (
    x1 < x2 + pieceSize &&
    x1 + pieceSize > x2 &&
    y1 < y2 + pieceSize &&
    y1 + pieceSize > y2
  );
}

/**
 * Get all colliding pieces for a given piece
 */
export function getCollidingPieces(
  piece: PuzzlePiece,
  allPieces: PuzzlePiece[],
  pieceSize: number
): PieceCollision[] {
  const collisions: PieceCollision[] = [];

  for (const otherPiece of allPieces) {
    if (piece.id === otherPiece.id) continue;

    const isColliding = checkCollision(piece, otherPiece, pieceSize);
    if (isColliding) {
      const dist = distance(piece.currentPosition, otherPiece.currentPosition);
      collisions.push({
        piece1: piece,
        piece2: otherPiece,
        distance: dist,
        isColliding: true,
      });
    }
  }

  return collisions;
}

/**
 * Check if a piece should snap to its target position
 * Returns snapping result with target piece if applicable
 */
export function checkSnapping(
  piece: PuzzlePiece,
  allPieces: PuzzlePiece[],
  snappingRadius: number,
  pieceSize: number
): SnappingResult {
  // Check distance to target position
  const distToTarget = distance(piece.currentPosition, piece.targetPosition);

  if (distToTarget <= snappingRadius) {
    return {
      isSnapped: true,
      snapDistance: distToTarget,
    };
  }

  return {
    isSnapped: false,
    snapDistance: distToTarget,
  };
}

/**
 * Get adjacent pieces (pieces that should be next to this one)
 */
export function getAdjacentPieces(
  piece: PuzzlePiece,
  allPieces: PuzzlePiece[]
): PuzzlePiece[] {
  const adjacent: PuzzlePiece[] = [];

  // Check all four directions
  const directions = [
    { dx: 0, dy: -1 }, // top
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: 1 }, // bottom
    { dx: -1, dy: 0 }, // left
  ];

  for (const dir of directions) {
    const adjacentPiece = allPieces.find(
      (p) => p.gridX === piece.gridX + dir.dx && p.gridY === piece.gridY + dir.dy
    );
    if (adjacentPiece) {
      adjacent.push(adjacentPiece);
    }
  }

  return adjacent;
}

/**
 * Check if a piece is on the edge of the puzzle
 */
export function isEdgePiece(piece: PuzzlePiece): boolean {
  return piece.gridX === 0 || piece.gridY === 0;
}

/**
 * Check if a piece is in a corner
 */
export function isCornerPiece(
  piece: PuzzlePiece,
  gridRows: number,
  gridCols: number
): boolean {
  return (
    (piece.gridX === 0 || piece.gridX === gridCols - 1) &&
    (piece.gridY === 0 || piece.gridY === gridRows - 1)
  );
}

/**
 * Snap a piece to its target position with smooth animation
 */
export function snapPiece(piece: PuzzlePiece): PuzzlePiece {
  return {
    ...piece,
    currentPosition: { ...piece.targetPosition },
    isSnapped: true,
    rotation: 0, // Reset rotation to 0 when snapped
  };
}

/**
 * Check if all pieces are snapped (puzzle complete)
 */
export function isPuzzleComplete(pieces: PuzzlePiece[]): boolean {
  return pieces.every((piece) => piece.isSnapped);
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(pieces: PuzzlePiece[]): number {
  if (pieces.length === 0) return 0;
  const snappedCount = pieces.filter((p) => p.isSnapped).length;
  return Math.round((snappedCount / pieces.length) * 100);
}

/**
 * Find the closest snappable piece to a given piece
 */
export function findClosestSnappablePiece(
  piece: PuzzlePiece,
  allPieces: PuzzlePiece[],
  maxDistance: number = 100
): PuzzlePiece | null {
  let closest: PuzzlePiece | null = null;
  let closestDistance = maxDistance;

  for (const otherPiece of allPieces) {
    if (piece.id === otherPiece.id) continue;
    if (!otherPiece.isSnapped) continue;

    const dist = distance(piece.currentPosition, otherPiece.currentPosition);
    if (dist < closestDistance) {
      closestDistance = dist;
      closest = otherPiece;
    }
  }

  return closest;
}

/**
 * Calculate magnetic attraction force between pieces
 * Used for smooth snapping animation
 */
export function calculateMagneticForce(
  piece: PuzzlePiece,
  targetPiece: PuzzlePiece,
  strength: number = 0.1
): Vector2 {
  const dx = targetPiece.currentPosition.x - piece.currentPosition.x;
  const dy = targetPiece.currentPosition.y - piece.currentPosition.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { x: 0, y: 0 };

  return {
    x: (dx / dist) * strength,
    y: (dy / dist) * strength,
  };
}

/**
 * Detect if a piece overlaps with multiple pieces (pile detection)
 */
export function detectPilePieces(
  piece: PuzzlePiece,
  allPieces: PuzzlePiece[],
  pieceSize: number
): PuzzlePiece[] {
  const pile: PuzzlePiece[] = [];

  for (const otherPiece of allPieces) {
    if (piece.id === otherPiece.id) continue;

    const isColliding = checkCollision(piece, otherPiece, pieceSize);
    if (isColliding) {
      pile.push(otherPiece);
    }
  }

  return pile;
}

/**
 * Separate overlapping pieces by pushing them apart
 */
export function separateOverlappingPieces(
  piece: PuzzlePiece,
  otherPiece: PuzzlePiece,
  pieceSize: number,
  separationForce: number = 10
): { piece1: PuzzlePiece; piece2: PuzzlePiece } {
  const dx = piece.currentPosition.x - otherPiece.currentPosition.x;
  const dy = piece.currentPosition.y - otherPiece.currentPosition.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const pushX = (dx / dist) * separationForce;
  const pushY = (dy / dist) * separationForce;

  return {
    piece1: {
      ...piece,
      currentPosition: {
        x: piece.currentPosition.x + pushX,
        y: piece.currentPosition.y + pushY,
      },
    },
    piece2: {
      ...otherPiece,
      currentPosition: {
        x: otherPiece.currentPosition.x - pushX,
        y: otherPiece.currentPosition.y - pushY,
      },
    },
  };
}
