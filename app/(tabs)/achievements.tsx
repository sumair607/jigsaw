/**
 * Achievements Screen
 * Shows badges, streaks, and progress toward milestones
 */

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { loadUserStats, loadAchievements } from "@/lib/storage/storage-manager";
import { getUnlockedAchievements, getLockedAchievements, getAchievementProgressPercentage } from "@/lib/achievements/achievement-system";
import { UserStats, AchievementBadge } from "@/lib/game-engine/types";

export default function AchievementsScreen() {
  const colors = useColors();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stats = await loadUserStats();
      const achievementsList = await loadAchievements();
      setUserStats(stats);
      setAchievements(achievementsList);
      setUnlockedCount(getUnlockedAchievements(achievementsList).length);
    } catch (error) {
      console.error("Failed to load achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedAchievements = getUnlockedAchievements(achievements);
  const lockedAchievements = getLockedAchievements(achievements);

  const renderAchievementBadge = ({ item }: { item: AchievementBadge }) => {
    const isUnlocked = item.unlockedAt !== null;
    const progress = getAchievementProgressPercentage(item);

    return (
      <View
        style={[
          styles.badgeContainer,
          {
            backgroundColor: isUnlocked ? colors.surface : colors.background,
            borderColor: isUnlocked ? colors.primary : colors.border,
            opacity: isUnlocked ? 1 : 0.6,
          },
        ]}
      >
        <Text style={styles.badgeIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.badgeName,
            { color: colors.foreground },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.badgeDescription,
            { color: colors.muted },
          ]}
        >
          {item.description}
        </Text>

        {!isUnlocked && item.maxProgress > 1 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        )}

        {!isUnlocked && item.maxProgress > 1 && (
          <Text
            style={[
              styles.progressText,
              { color: colors.muted },
            ]}
          >
            {item.progress}/{item.maxProgress}
          </Text>
        )}

        {isUnlocked && (
          <Text style={styles.unlockedBadge}>✓ Unlocked</Text>
        )}
      </View>
    );
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
          <Text style={styles.headerTitle}>🏆 Achievements</Text>
          <Text style={styles.headerSubtitle}>
            {unlockedCount}/{achievements.length} Unlocked
          </Text>
        </View>

        {/* Streak Section */}
        <View style={styles.contentPadding}>
          <View
            style={[
              styles.streakCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.streakContent}>
              <Text style={styles.streakIcon}>🔥</Text>
              <View>
                <Text
                  style={[
                    styles.streakLabel,
                    { color: colors.muted },
                  ]}
                >
                  Current Streak
                </Text>
                <Text
                  style={[
                    styles.streakValue,
                    { color: colors.primary },
                  ]}
                >
                  {userStats?.currentStreak || 0} days
                </Text>
              </View>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakContent}>
              <Text style={styles.streakIcon}>⭐</Text>
              <View>
                <Text
                  style={[
                    styles.streakLabel,
                    { color: colors.muted },
                  ]}
                >
                  Longest Streak
                </Text>
                <Text
                  style={[
                    styles.streakValue,
                    { color: colors.primary },
                  ]}
                >
                  {userStats?.longestStreak || 0} days
                </Text>
              </View>
            </View>
          </View>

          {/* Statistics */}
          <View
            style={[
              styles.statsContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Total Completed
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
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Total Time
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary },
                ]}
              >
                {Math.round((userStats?.totalTimeSpent || 0) / 60)} min
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Highest Difficulty
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary },
                ]}
              >
                {userStats?.highestDifficultyCompleted || "2×2"}
              </Text>
            </View>
          </View>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.foreground },
                ]}
              >
                Unlocked ({unlockedAchievements.length})
              </Text>
              <FlatList
                data={unlockedAchievements}
                numColumns={2}
                columnWrapperStyle={styles.badgeGrid}
                scrollEnabled={false}
                renderItem={renderAchievementBadge}
                keyExtractor={(item) => item.id}
              />
            </View>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.foreground },
                ]}
              >
                Locked ({lockedAchievements.length})
              </Text>
              <FlatList
                data={lockedAchievements}
                numColumns={2}
                columnWrapperStyle={styles.badgeGrid}
                scrollEnabled={false}
                renderItem={renderAchievementBadge}
                keyExtractor={(item) => item.id}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
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
  streakCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakIcon: {
    fontSize: 32,
  },
  streakLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  streakDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 8,
  },
  statsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  badgeGrid: {
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  badgeContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: "center",
  },
  unlockedBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#22C55E",
    marginTop: 4,
  },
});
