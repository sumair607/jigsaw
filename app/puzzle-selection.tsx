/**
 * Puzzle Selection Screen
 * Shows available puzzles for a category
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getAllPuzzleImages, getPuzzlesByCategory } from "@/lib/content/content-manager";
import { PuzzleImage } from "@/lib/game-engine/types";
import { getUnlockedDifficulties } from "@/lib/game-engine/progression";
import * as Haptics from "expo-haptics";

export default function PuzzleSelectionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  
  const [puzzles, setPuzzles] = useState<PuzzleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedDifficulties, setUnlockedDifficulties] = useState<string[]>([]);

  useEffect(() => {
    loadPuzzles();
  }, [category]);

  const loadPuzzles = async () => {
    try {
      const allPuzzles = category === "daily" 
        ? await getAllPuzzleImages()
        : await getPuzzlesByCategory(category || "nature");
      setPuzzles(allPuzzles);
      
      const unlocked = await getUnlockedDifficulties();
      setUnlockedDifficulties(unlocked);
    } catch (error) {
      console.error("Failed to load puzzles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePuzzleSelect = (puzzle: PuzzleImage, difficulty: string) => {
    if (!unlockedDifficulties.includes(difficulty)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/puzzle-game",
      params: {
        puzzleId: puzzle.id,
        imageUri: puzzle.imageUri,
        difficulty,
        category,
      },
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <Text style={[styles.title, { color: colors.foreground }]}>
        {category === "daily" ? "Daily Challenge" : `${category} Puzzles`}
      </Text>
      
      <FlatList
        data={puzzles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.puzzleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image
              source={{ uri: item.thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.puzzleInfo}>
              <Text style={[styles.puzzleName, { color: colors.foreground }]}>
                {item.name}
              </Text>
              <View style={styles.difficultyButtons}>
                {item.puzzles.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => handlePuzzleSelect(item, p.difficulty)}
                    disabled={!unlockedDifficulties.includes(p.difficulty)}
                    style={({ pressed }) => [
                      styles.difficultyButton,
                      { 
                        backgroundColor: unlockedDifficulties.includes(p.difficulty) ? colors.primary : colors.border,
                        opacity: pressed ? 0.7 : unlockedDifficulties.includes(p.difficulty) ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {unlockedDifficulties.includes(p.difficulty) ? p.difficulty : `🔒 ${p.difficulty}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  list: {
    gap: 12,
  },
  puzzleCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  puzzleInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  puzzleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  difficultyButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
