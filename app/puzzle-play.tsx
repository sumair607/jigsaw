/**
 * Puzzle Play Screen
 * Main game screen where users solve jigsaw puzzles
 */

import React, { useEffect, useState, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { puzzleReducer, initialPuzzleState } from "@/lib/game-engine/puzzle-logic";
import { PuzzleState } from "@/lib/game-engine/types";
import * as Haptics from "expo-haptics";

export default function PuzzlePlayScreen() {
  const colors = useColors();
  const router = useRouter();
  const { puzzleId, difficulty } = useLocalSearchParams<{
    puzzleId?: string;
    difficulty?: string;
  }>();

  const [gameState, dispatch] = useReducer(
    puzzleReducer,
    initialPuzzleState as PuzzleState
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Ensure gameState is not null (it's always initialized with initialPuzzleState)
  if (!gameState) {
    return (
      <ScreenContainer>
        <Text>Error: Game state not initialized</Text>
      </ScreenContainer>
    );
  }

  // Timer effect
  useEffect(() => {
    if (!isPaused && !gameState.isComplete) {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, gameState.isComplete]);

  const handlePause = () => {
    setIsPaused(true);
    setShowPauseMenu(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleResume = () => {
    setIsPaused(false);
    setShowPauseMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleQuit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleRestart = () => {
    dispatch({ type: "RESET_PUZZLE" });
    setElapsedTime(0);
    setShowPauseMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUseHint = () => {
    dispatch({ type: "USE_HINT" });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const completionPercentage = Math.round(
    (gameState.pieces.filter((p) => p.isSnapped).length /
      gameState.pieces.length) *
      100
  );

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Pressable
          onPress={handlePause}
          style={({ pressed }) => [
            styles.pauseButtonHeader,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.pauseIcon}>⏸</Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {puzzleId || "Puzzle"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {difficulty || "3x3"} • {completionPercentage}%
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>⏱</Text>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>📍</Text>
            <Text style={styles.statValue}>{gameState.moveCount}</Text>
          </View>
        </View>
      </View>

      {/* Game Canvas Area */}
      <View
        style={[
          styles.gameArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Placeholder for puzzle canvas */}
        <View
          style={[
            styles.canvasPlaceholder,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.placeholderText, { color: colors.muted }]}>
            🧩 Puzzle Canvas
          </Text>
          <Text
            style={[
              styles.placeholderSubtext,
              { color: colors.muted },
            ]}
          >
            {gameState.pieces.length} pieces
          </Text>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.success,
                  width: `${completionPercentage}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressText,
              { color: colors.foreground },
            ]}
          >
            {gameState.pieces.filter((p) => p.isSnapped).length} /{" "}
            {gameState.pieces.length} pieces
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View
        style={[
          styles.controls,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={handleUseHint}
          disabled={gameState.hintsUsed >= gameState.maxHints}
          style={({ pressed }) => [
            styles.controlButton,
            {
              backgroundColor: colors.primary,
              opacity:
                pressed && gameState.hintsUsed < gameState.maxHints
                  ? 0.8
                  : gameState.hintsUsed >= gameState.maxHints
                    ? 0.5
                    : 1,
            },
          ]}
        >
          <Text style={styles.controlButtonText}>
            💡 Hint ({gameState.maxHints - gameState.hintsUsed})
          </Text>
        </Pressable>

        <Pressable
          onPress={handlePause}
          style={({ pressed }) => [
            styles.controlButton,
            {
              backgroundColor: colors.warning,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.controlButtonText}>⏸ Pause</Text>
        </Pressable>
      </View>

      {/* Pause Menu Modal */}
      <Modal visible={showPauseMenu} transparent animationType="fade">
        <SafeAreaView
          style={[
            styles.modalOverlay,
            { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          ]}
        >
          <View
            style={[
              styles.pauseMenu,
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

            <View style={styles.pauseStats}>
              <View style={styles.pauseStat}>
                <Text
                  style={[
                    styles.pauseStatLabel,
                    { color: colors.muted },
                  ]}
                >
                  Time
                </Text>
                <Text
                  style={[
                    styles.pauseStatValue,
                    { color: colors.primary },
                  ]}
                >
                  {formatTime(elapsedTime)}
                </Text>
              </View>
              <View style={styles.pauseStat}>
                <Text
                  style={[
                    styles.pauseStatLabel,
                    { color: colors.muted },
                  ]}
                >
                  Moves
                </Text>
                <Text
                  style={[
                    styles.pauseStatValue,
                    { color: colors.primary },
                  ]}
                >
                  {gameState.moveCount}
                </Text>
              </View>
              <View style={styles.pauseStat}>
                <Text
                  style={[
                    styles.pauseStatLabel,
                    { color: colors.muted },
                  ]}
                >
                  Progress
                </Text>
                <Text
                  style={[
                    styles.pauseStatValue,
                    { color: colors.primary },
                  ]}
                >
                  {completionPercentage}%
                </Text>
              </View>
            </View>

            <View style={styles.pauseButtons}>
              <Pressable
                onPress={handleResume}
                style={({ pressed }) => [
                  styles.pauseButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.pauseButtonText}>Resume</Text>
              </Pressable>

              <Pressable
                onPress={handleRestart}
                style={({ pressed }) => [
                  styles.pauseButton,
                  {
                    backgroundColor: colors.warning,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.pauseButtonText}>Restart</Text>
              </Pressable>

              <Pressable
                onPress={handleQuit}
                style={({ pressed }) => [
                  styles.pauseButton,
                  {
                    backgroundColor: colors.error,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.pauseButtonText}>Quit</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pauseButtonHeader: {
    padding: 8,
  },
  pauseIcon: {
    fontSize: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  gameArea: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasPlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  placeholderText: {
    fontSize: 32,
  },
  placeholderSubtext: {
    fontSize: 14,
  },
  progressBar: {
    width: "80%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  controls: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  controlButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseMenu: {
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pauseStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  pauseStat: {
    alignItems: "center",
  },
  pauseStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pauseStatValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pauseButtons: {
    gap: 12,
  },
  pauseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pauseButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
