/**
 * Puzzle Game Screen
 * Main game screen with PuzzleCanvas
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Animated, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { PuzzleCanvas } from "@/components/game/puzzle-canvas";
import { useColors } from "@/hooks/use-colors";
import { recordPuzzleCompletion, getProgressToNextUnlock } from "@/lib/game-engine/progression";
import { Difficulty } from "@/lib/game-engine/types";
import { updatePuzzleProgress } from "@/lib/storage/storage-manager";
import * as Haptics from "expo-haptics";

let showInterstitialAfterPuzzle: any;
if (Platform.OS !== "web") {
  showInterstitialAfterPuzzle = require("@/lib/ads/ad-manager").showInterstitialAfterPuzzle;
}

export default function PuzzleGameScreen() {
  const colors = useColors();
  const router = useRouter();
  const { puzzleId, imageUri, difficulty, category } = useLocalSearchParams<{
    puzzleId: string;
    imageUri: string;
    difficulty: string;
    category?: string;
  }>();

  const [showCompletion, setShowCompletion] = useState(false);
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const [hasRecordedCompletion, setHasRecordedCompletion] = useState(false);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const handleCompletion = async (stats: any) => {
    if (hasRecordedCompletion) return;
    
    setCompletionStats(stats);
    setHasRecordedCompletion(true);

    // Record completion
    await updatePuzzleProgress(puzzleId, {
      puzzleId,
      imageId: puzzleId,
      difficulty: difficulty as Difficulty,
      category: category || "default",
      isCompleted: true,
      bestTime: stats.timeSpent,
      bestMoves: stats.moveCount,
      completedAt: Date.now(),
      starRating: stats.starRating,
      lastPlayedAt: Date.now(),
    });
    
    await recordPuzzleCompletion(difficulty as Difficulty);

    // Check unlock progress
    const progress = await getProgressToNextUnlock(difficulty as Difficulty);
    if (progress) {
      if (progress.remaining === 0) {
        setUnlockMessage(`🔓 ${progress.nextDifficulty} Unlocked! Try harder puzzles now!`);
      } else if (progress.remaining <= 3) {
        setUnlockMessage(`🎯 Complete ${progress.remaining} more ${difficulty} puzzle${progress.remaining > 1 ? 's' : ''} to unlock ${progress.nextDifficulty}!`);
      }
    }

    // Trigger confetti animation
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!showCompletion && !completionTimeoutRef.current) {
      completionTimeoutRef.current = setTimeout(async () => {
        setShowCompletion(true);
        completionTimeoutRef.current = null;
        
        if (Platform.OS !== "web" && showInterstitialAfterPuzzle) {
          setTimeout(() => {
            showInterstitialAfterPuzzle();
          }, 500);
        }
      }, 1500);
    }
  };

  const handleExit = () => {
    router.back();
  };

  if (!puzzleId || !imageUri || !difficulty) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.error }}>Missing puzzle parameters</Text>
        <Pressable onPress={handleExit}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PuzzleCanvas
        imageUri={imageUri}
        imageId={puzzleId}
        difficulty={difficulty as any}
        puzzleId={puzzleId}
        onCompletion={handleCompletion}
        onExit={handleExit}
      />

      {/* Confetti Effect */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.confettiContainer,
          {
            opacity: confettiAnim,
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 600],
                }),
              },
            ],
          },
        ]}
      >
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                left: `${(i * 5) % 100}%`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 5],
                transform: [
                  {
                    rotate: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${360 * (i % 2 === 0 ? 1 : -1)}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Completion Modal */}
      <Modal visible={showCompletion} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.35)" }]}>
          <View style={[styles.completionCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.completionTitle, { color: colors.success }]}>
              🎉 Puzzle Complete!
            </Text>
            {unlockMessage && (
              <View style={[styles.unlockBanner, { backgroundColor: colors.primary }]}>
                <Text style={styles.unlockText}>{unlockMessage}</Text>
              </View>
            )}
            {completionStats && (
              <View style={styles.stats}>
                <Text style={[styles.statText, { color: colors.foreground }]}>
                  Time: {Math.floor(completionStats.timeSpent / 60)}:{(completionStats.timeSpent % 60).toString().padStart(2, "0")}
                </Text>
                <Text style={[styles.statText, { color: colors.foreground }]}>
                  Moves: {completionStats.moveCount}
                </Text>
                <Text style={[styles.statText, { color: colors.foreground }]}>
                  Rating: {"⭐".repeat(completionStats.starRating)}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => {
                setShowCompletion(false);
                router.back();
              }}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  completionCard: {
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  unlockBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  unlockText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  stats: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  statText: {
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: 9999,
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
