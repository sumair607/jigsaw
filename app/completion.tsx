/**
 * Puzzle Completion Screen
 * Celebratory screen shown when puzzle is completed
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function CompletionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { puzzleName, difficulty, time, moves, score } =
    useLocalSearchParams<{
      puzzleName?: string;
      difficulty?: string;
      time?: string;
      moves?: string;
      score?: string;
    }>();

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Play success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    try {
      const message = `🎉 I just completed "${puzzleName || "Puzzle"}" at ${difficulty || "3x3"} difficulty in ${time || "0:00"}! 🧩\n\nCan you beat my score? Download Jigsaw Puzzle Pro now!`;

      await Share.share({
        message,
        title: "Jigsaw Puzzle Pro - Puzzle Completed!",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/puzzle-play");
  };

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/");
  };

  const getStarRating = () => {
    const timeSeconds = parseInt(time?.split(":")[0] || "0") * 60 +
      parseInt(time?.split(":")[1] || "0");
    const moveCount = parseInt(moves || "0");

    // Simple star rating: 3 stars for excellent, 2 for good, 1 for completed
    if (timeSeconds < 120 && moveCount < 50) return 3;
    if (timeSeconds < 300 && moveCount < 100) return 2;
    return 1;
  };

  const stars = getStarRating();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Confetti Animation */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: `${Math.random() * 100}%`,
                    backgroundColor: [
                      colors.primary,
                      colors.success,
                      colors.warning,
                      colors.error,
                    ][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 0.5}s`,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Celebration Icon */}
        <View style={styles.celebrationIcon}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: colors.foreground },
          ]}
        >
          Puzzle Complete!
        </Text>

        {/* Star Rating */}
        <View style={styles.starContainer}>
          {[...Array(3)].map((_, i) => (
            <Text
              key={i}
              style={[
                styles.star,
                { opacity: i < stars ? 1 : 0.2 },
              ]}
            >
              ⭐
            </Text>
          ))}
        </View>

        {/* Puzzle Name */}
        <Text
          style={[
            styles.puzzleName,
            { color: colors.muted },
          ]}
        >
          {puzzleName || "Puzzle"}
        </Text>

        {/* Stats Card */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⏱</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: colors.muted },
                ]}
              >
                Time
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary },
                ]}
              >
                {time || "0:00"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statIcon}>📍</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: colors.muted },
                ]}
              >
                Moves
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary },
                ]}
              >
                {moves || "0"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: colors.muted },
                ]}
              >
                Difficulty
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary },
                ]}
              >
                {difficulty || "3x3"}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievement Badge */}
        <View
          style={[
            styles.achievementCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.achievementIcon}>🎖️</Text>
          <Text
            style={[
              styles.achievementTitle,
              { color: colors.foreground },
            ]}
          >
            Achievement Unlocked!
          </Text>
          <Text
            style={[
              styles.achievementDescription,
              { color: colors.muted },
            ]}
          >
            Puzzle Master: Complete a {difficulty || "3x3"} puzzle
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.shareButtonText}>📤 Share Achievement</Text>
          </Pressable>

          <Pressable
            onPress={handlePlayAgain}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: colors.success,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>

          <Pressable
            onPress={handleHome}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: colors.foreground },
              ]}
            >
              Back to Home
            </Text>
          </Pressable>
        </View>

        {/* Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    pointerEvents: "none",
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  celebrationIcon: {
    marginTop: 20,
    marginBottom: 16,
  },
  trophyEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  starContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  star: {
    fontSize: 28,
  },
  puzzleName: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  statsCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  achievementCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  shareButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
