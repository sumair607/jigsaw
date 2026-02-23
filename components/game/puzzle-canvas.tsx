/**
 * Puzzle Canvas Component
 * Main game canvas that renders all puzzle pieces
 */

import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Modal,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { PuzzlePiece } from "./puzzle-piece";
import { PuzzleState } from "@/lib/game-engine/types";
import {
  initializePuzzle,
  puzzleReducer,
  calculateGameStats,
  formatTime,
  type InitPuzzlePayload,
  type PieceLayoutMode,
} from "@/lib/game-engine/puzzle-logic";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface PuzzleCanvasProps {
  imageUri: string;
  imageId: string;
  difficulty: "2x2" | "3x3" | "4x4" | "6x6" | "8x8";
  puzzleId: string;
  onCompletion?: (stats: {
    timeSpent: number;
    moveCount: number;
    starRating: number;
  }) => void;
  onExit?: () => void;
}

export const PuzzleCanvas: React.FC<PuzzleCanvasProps> = ({
  imageUri,
  imageId,
  difficulty,
  puzzleId,
  onCompletion,
  onExit,
}) => {
  const colors = useColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [gameState, dispatch] = useReducer(puzzleReducer, null as any);
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [hintPieceId, setHintPieceId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [layoutMode, setLayoutMode] = useState<PieceLayoutMode>("spread");

  // Keep board inside visible area on phones/tablets.
  const responsiveCanvasSize = Math.max(
    220,
    Math.floor(Math.min(windowWidth - 24, windowHeight - 260))
  );

  // Initialize puzzle on mount
  useEffect(() => {
    const initPuzzle = async () => {
      try {
        console.log("🎮 [INIT] Starting puzzle initialization", { puzzleId, difficulty, imageUri });
        const payload: InitPuzzlePayload = {
          puzzleId,
          imageId,
          imageUri,
          difficulty,
          canvasSize: responsiveCanvasSize,
        };
        console.log("🎮 [INIT] Calling initializePuzzle...");
        const state = await initializePuzzle(payload);
        console.log("✅ [INIT] SUCCESS! Puzzle created with", state.pieces.length, "pieces");
        console.log("🎮 [INIT] Dispatching INIT_PUZZLE_COMPLETE");
        dispatch({ type: "INIT_PUZZLE_COMPLETE", payload: state } as any);
        setInitError(null);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("❌ [INIT] ERROR:", errorMsg);
        console.error("❌ [INIT] Full error:", error);
        setInitError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initPuzzle();
  }, [puzzleId, imageId, imageUri, difficulty, retryCount, responsiveCanvasSize]);

  // Timer effect
  useEffect(() => {
    if (isLoading || isPaused || !gameState) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, isPaused, gameState]);

  // Check for completion
  useEffect(() => {
    if (!gameState || !gameState.isComplete) return;

    // Trigger completion callback
    if (onCompletion) {
      const stats = calculateGameStats(gameState);
      onCompletion({
        timeSpent: stats.elapsedTime,
        moveCount: gameState.moveCount,
        starRating: stats.starRating,
      });
    }

    // Play completion sound and haptic
    if (gameState.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [gameState?.isComplete, gameState, onCompletion]);

  const handlePieceMove = useCallback(
    (pieceId: string, x: number, y: number) => {
      dispatch({
        type: "UPDATE_PIECE_POSITION",
        payload: { pieceId, x, y },
      });
      if (layoutMode === "tray") {
        dispatch({
          type: "REPACK_UNSNAPPED",
          payload: { mode: "tray", excludePieceId: pieceId },
        });
      }
      setSelectedPieceId(pieceId);
    },
    [layoutMode]
  );

  const handlePieceSnap = useCallback((pieceId: string) => {
    dispatch({ type: "SNAP_PIECE", payload: { pieceId } });
    if (layoutMode === "tray") {
      dispatch({
        type: "REPACK_UNSNAPPED",
        payload: { mode: "tray" },
      });
    }
  }, [layoutMode]);

  const handlePieceGrab = useCallback((pieceId: string) => {
    dispatch({ type: "BRING_PIECE_TO_FRONT", payload: { pieceId } });
  }, []);

  const handleHint = useCallback(() => {
    if (!gameState) return;

    const unsnappedPieces = gameState.pieces.filter((p) => !p.isSnapped);
    if (unsnappedPieces.length === 0) return;

    const randomPiece = unsnappedPieces[
      Math.floor(Math.random() * unsnappedPieces.length)
    ];
    setHintPieceId(randomPiece.id);

    dispatch({ type: "USE_HINT" });

    if (gameState.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Clear hint after 3 seconds
    setTimeout(() => setHintPieceId(null), 3000);
  }, [gameState]);

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO_MOVE" });
    if (gameState?.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [gameState?.hapticsEnabled]);

  const handleShuffle = useCallback(() => {
    dispatch({ type: "SHUFFLE_UNSNAPPED" });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleLayoutToggle = useCallback(() => {
    const nextMode: PieceLayoutMode = layoutMode === "spread" ? "tray" : "spread";
    setLayoutMode(nextMode);
    dispatch({ type: "SET_UNSNAPPED_LAYOUT", payload: { mode: nextMode } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [layoutMode]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Loading puzzle...</Text>
      </View>
    );
  }

  if (initError || !gameState) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, padding: 20 }]}>
        <Text style={{ color: colors.error, fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center", flex: 0 }}>
          ❌ Failed to load puzzle
        </Text>
        {initError && (
          <>
            <Text style={{ color: colors.muted, fontSize: 14, paddingHorizontal: 16, marginBottom: 12, textAlign: "center", flex: 0 }}>
              Error Details:
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: "monospace", flex: 0 }}>
                {initError}
              </Text>
            </View>
          </>
        )}
        <Pressable
          onPress={() => {
            setIsLoading(true);
            setInitError(null);
            setRetryCount((prev) => prev + 1);
          }}
          style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const stats = calculateGameStats(gameState);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statsContainer}>
          <Text style={[styles.stat, { color: colors.foreground }]}>
            ⏱️ {formatTime(elapsedTime)}
          </Text>
          <Text style={[styles.stat, { color: colors.foreground }]}>
            🎯 {gameState.moveCount}
          </Text>
          <Text style={[styles.stat, { color: colors.foreground }]}>
            {stats.completionPercentage}%
          </Text>
        </View>
        <Pressable
          onPress={handlePause}
          style={({ pressed }) => [
            styles.pauseButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
            {isPaused ? "Resume" : "Pause"}
          </Text>
        </Pressable>
      </View>

      {/* Game Canvas */}
      <View style={[styles.gameArea, { backgroundColor: colors.surface }]}>
        <Text style={[styles.layoutLabel, { color: colors.muted }]}>
          Layout: {layoutMode === "spread" ? "Spread" : "Tray"}
        </Text>
        <View
          style={[
            styles.canvas,
            {
              width: gameState.canvasSize,
              height: gameState.canvasSize,
              borderColor: colors.border,
            },
          ]}
        >
          {gameState.pieces.map((piece) => (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              pieceSize={gameState.pieceSize}
              canvasSize={gameState.canvasSize}
              onPieceMove={handlePieceMove}
              onPieceSnap={handlePieceSnap}
              onPieceLongPress={handlePieceGrab}
              rotationEnabled={gameState.rotationEnabled}
              isSelected={piece.id === selectedPieceId}
              showHint={piece.id === hintPieceId}
            />
          ))}
        </View>

      </View>

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleHint}
          style={({ pressed }) => [
            styles.controlButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.controlText, { color: colors.primary }]}>
            💡 Hint ({stats.hintsRemaining})
          </Text>
        </Pressable>

        <Pressable
          onPress={handleUndo}
          style={({ pressed }) => [
            styles.controlButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.controlText, { color: colors.primary }]}>
            ↶ Undo
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShuffle}
          style={({ pressed }) => [
            styles.controlButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.controlText, { color: colors.primary }]}>
            🔀 Shuffle
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLayoutToggle}
          style={({ pressed }) => [
            styles.controlButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.controlText, { color: colors.primary }]}>
            🧩 {layoutMode === "spread" ? "Tray Mode" : "Spread Mode"}
          </Text>
        </Pressable>
      </View>

      {/* Pause Modal */}
      <Modal visible={isPaused} transparent animationType="fade">
        <SafeAreaView
          style={[
            styles.pauseModal,
            { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          ]}
        >
          <View
            style={[
              styles.pauseContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[
                styles.pauseTitle,
                { color: colors.foreground },
              ]}
            >
              Game Paused
            </Text>
            <Pressable
              onPress={handlePause}
              style={({ pressed }) => [
                styles.pauseButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Resume
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                dispatch({ type: "RESET_PUZZLE" });
                setIsPaused(false);
                setElapsedTime(0);
              }}
              style={({ pressed }) => [
                styles.pauseButton,
                {
                  backgroundColor: colors.warning,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Restart
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsPaused(false);
                onExit?.();
              }}
              style={({ pressed }) => [
                styles.pauseButton,
                {
                  backgroundColor: colors.error,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Exit
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    fontSize: 12,
    fontWeight: "600",
  },
  pauseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gameArea: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: "visible",
  },
  canvas: {
    borderWidth: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  layoutLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
  },
  controls: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  controlText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  pauseModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseContent: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
    width: "80%",
    maxWidth: 300,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
});
