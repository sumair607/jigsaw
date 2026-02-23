/**
 * Home Screen
 * Main entry point showing daily challenge and puzzle categories
 */

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { loadUserStats } from "@/lib/storage/storage-manager";
import { UserStats } from "@/lib/game-engine/types";
import { AppBannerAd } from "@/components/ads/banner-ad";
import * as Haptics from "expo-haptics";

let getBannerAdUnitId: any = () => "";
if (Platform.OS !== "web") {
  try {
    getBannerAdUnitId = require("@/lib/ads/ad-manager").getBannerAdUnitId;
  } catch (e) {
    console.log("Ad manager not available");
  }
}

const CATEGORIES = [
  { id: "nature", name: "Nature", icon: "🌿" },
  { id: "cities", name: "Cities", icon: "🏙️" },
  { id: "animals", name: "Animals", icon: "🦁" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "kids", name: "Kids", icon: "🎈" },
  { id: "abstract", name: "Abstract", icon: "🌈" },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await loadUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Failed to load user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/puzzle-selection",
      params: { category: categoryId },
    });
  };

  const handleDailyChallenge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/puzzle-selection",
      params: { category: "daily" },
    });
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.headerTitle}>🧩 Jigsaw Puzzle Pro</Text>
          <Text style={styles.headerSubtitle}>Master the art of puzzles</Text>
        </View>

        {/* Daily Challenge Card */}
        <View style={styles.contentPadding}>
          <Pressable
            onPress={handleDailyChallenge}
            style={({ pressed }) => [
              styles.dailyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.dailyCardContent}>
              <Text style={[styles.dailyCardTitle, { color: colors.foreground }]}>
                📅 Daily Challenge
              </Text>
              <Text style={[styles.dailyCardSubtitle, { color: colors.muted }]}>
                New puzzle every day
              </Text>
              <View style={styles.dailyCardStats}>
                <Text style={[styles.statBadge, { color: colors.primary }]}>
                  🔥 Streak: {userStats?.currentStreak || 0}
                </Text>
              </View>
            </View>
            <Text style={styles.dailyCardArrow}>→</Text>
          </Pressable>

          {/* Stats Bar */}
          <View
            style={[
              styles.statsBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Completed
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary },
                ]}
              >
                {userStats?.totalPuzzlesCompleted || 0}
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Streak
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.success },
                ]}
              >
                {userStats?.currentStreak || 0} days
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Avg Time
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.warning },
                ]}
              >
                {Math.round(userStats?.averageCompletionTime || 0)}s
              </Text>
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              Choose a Category
            </Text>

            <FlatList
              data={CATEGORIES}
              numColumns={3}
              columnWrapperStyle={styles.categoryGrid}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleCategoryPress(item.id)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: colors.foreground },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              Your Progress
            </Text>

            <View
              style={[
                styles.progressCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.progressItem}>
                <Text style={[styles.progressLabel, { color: colors.muted }]}>
                  Highest Difficulty
                </Text>
                <Text
                  style={[
                    styles.progressValue,
                    { color: colors.primary },
                  ]}
                >
                  {userStats?.highestDifficultyCompleted || "2×2"}
                </Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={[styles.progressLabel, { color: colors.muted }]}>
                  Total Time
                </Text>
                <Text
                  style={[
                    styles.progressValue,
                    { color: colors.primary },
                  ]}
                >
                  {Math.round((userStats?.totalTimeSpent || 0) / 60)} min
                </Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={[styles.progressLabel, { color: colors.muted }]}>
                  Longest Streak
                </Text>
                <Text
                  style={[
                    styles.progressValue,
                    { color: colors.primary },
                  ]}
                >
                  {userStats?.longestStreak || 0} days
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={handleDailyChallenge}
            style={({ pressed }) => [
              styles.ctaButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={styles.ctaButtonText}>Start Playing Now</Text>
          </Pressable>

          {/* Banner Ad */}
          {Platform.OS !== "web" && (
            <View style={styles.bannerContainer}>
              <AppBannerAd unitId={getBannerAdUnitId()} />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contentPadding: {
    padding: 16,
    gap: 16,
  },
  dailyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dailyCardContent: {
    flex: 1,
  },
  dailyCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dailyCardSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  dailyCardStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  dailyCardArrow: {
    fontSize: 24,
  },
  statsBar: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryGrid: {
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  progressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  ctaButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bannerContainer: {
    alignItems: "center",
    marginTop: 8,
  },
});
