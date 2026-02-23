/**
 * Daily Challenge Modal
 * Shows the daily puzzle challenge
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  SafeAreaView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface DailyChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onPlay: () => void;
  puzzleName?: string;
  difficulty?: string;
  imageUri?: string;
  isCompleted?: boolean;
  bestTime?: string;
}

export function DailyChallengeModal({
  visible,
  onClose,
  onPlay,
  puzzleName = "Daily Puzzle",
  difficulty = "4x4",
  imageUri,
  isCompleted = false,
  bestTime,
}: DailyChallengeModalProps) {
  const colors = useColors();

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlay();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        ]}
      >
        <View
          style={[
            styles.content,
            { backgroundColor: colors.surface },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.headerTitle}>📅 Today's Challenge</Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Image Preview */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
            />
          )}

          {/* Content */}
          <View style={styles.body}>
            <Text
              style={[
                styles.title,
                { color: colors.foreground },
              ]}
            >
              {puzzleName}
            </Text>

            <View style={styles.difficultyBadge}>
              <Text
                style={[
                  styles.difficultyText,
                  { color: colors.primary },
                ]}
              >
                {difficulty}
              </Text>
            </View>

            {isCompleted ? (
              <View
                style={[
                  styles.completedBanner,
                  { backgroundColor: colors.success },
                ]}
              >
                <Text style={styles.completedText}>
                  ✓ Completed Today
                </Text>
                {bestTime && (
                  <Text style={styles.bestTimeText}>
                    Best Time: {bestTime}
                  </Text>
                )}
              </View>
            ) : (
              <View
                style={[
                  styles.newBadge,
                  { backgroundColor: colors.warning },
                ]}
              >
                <Text style={styles.newBadgeText}>
                  🆕 New Puzzle Today!
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.description,
                { color: colors.muted },
              ]}
            >
              Complete today's puzzle to maintain your streak and earn bonus
              points!
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleClose}
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
                Maybe Later
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isCompleted ? "Play Again" : "Play Now"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
  },
  body: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  bestTimeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  newBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
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
