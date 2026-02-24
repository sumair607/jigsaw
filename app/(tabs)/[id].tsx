/**
 * Quick Play Screen
 * Instantly start a random puzzle
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PuzzleCanvas } from "@/components/game/puzzle-canvas";
import { getAllPuzzleImages } from "@/lib/content/content-manager";

export default function QuickPlayScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [puzzleConfig, setPuzzleConfig] = useState<any>(null);

  useEffect(() => {
    loadRandomPuzzle();
  }, []);

  const loadRandomPuzzle = async () => {
    try {
      const puzzles = await getAllPuzzleImages();
      if (puzzles.length > 0) {
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        const difficulties = ["2x2", "3x3", "4x4", "5x5", "6x6"];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        setPuzzleConfig({
          imageUri: randomPuzzle.imageUri,
          imageId: randomPuzzle.id,
          difficulty: randomDifficulty,
          puzzleId: randomPuzzle.id,
          title: randomPuzzle.name,
        });
      }
    } catch (error) {
      console.error("Failed to load random puzzle:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Loading random puzzle...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!puzzleConfig) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            No puzzles available
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <Stack.Screen options={{ headerShown: false }} />
      <PuzzleCanvas
        imageUri={puzzleConfig.imageUri}
        imageId={puzzleConfig.imageId}
        difficulty={puzzleConfig.difficulty}
        puzzleId={puzzleConfig.puzzleId}
        onExit={() => {
          loadRandomPuzzle();
        }}
        onCompletion={() => {
          setTimeout(() => loadRandomPuzzle(), 2000);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
  },
});
