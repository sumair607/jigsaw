/**
 * Hint System Component
 * Displays hints and hint usage
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface HintSystemProps {
  hintsAvailable: number;
  hintsUsed: number;
  onUseHint: () => void;
  onWatchAd?: () => void;
  disabled?: boolean;
}

export function HintSystem({
  hintsAvailable,
  hintsUsed,
  onUseHint,
  onWatchAd,
  disabled = false,
}: HintSystemProps) {
  const colors = useColors();
  const [showHintModal, setShowHintModal] = React.useState(false);

  const handleUseHint = () => {
    if (disabled || hintsUsed >= hintsAvailable) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUseHint();
    setShowHintModal(false);
  };

  const handleWatchAd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onWatchAd?.();
    setShowHintModal(false);
  };

  const remainingHints = hintsAvailable - hintsUsed;

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowHintModal(true);
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.hintButton,
          {
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={styles.hintIcon}>💡</Text>
        <Text
          style={[
            styles.hintText,
            { color: colors.foreground },
          ]}
        >
          {remainingHints}
        </Text>
      </Pressable>

      <Modal visible={showHintModal} transparent animationType="fade">
        <SafeAreaView
          style={[
            styles.modalOverlay,
            { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          ]}
        >
          <View
            style={[
              styles.hintModal,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colors.foreground },
              ]}
            >
              💡 Hints Available
            </Text>

            <Text
              style={[
                styles.modalDescription,
                { color: colors.muted },
              ]}
            >
              You have {remainingHints} hint{remainingHints !== 1 ? "s" : ""} remaining.
            </Text>

            {remainingHints > 0 ? (
              <View style={styles.hintInfo}>
                <Text
                  style={[
                    styles.hintInfoText,
                    { color: colors.foreground },
                  ]}
                >
                  A hint will show you the location of one unplaced piece.
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.noHintsInfo,
                  { backgroundColor: colors.warning },
                ]}
              >
                <Text style={styles.noHintsText}>
                  No hints remaining
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowHintModal(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: colors.foreground },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              {remainingHints > 0 ? (
                <Pressable
                  onPress={handleUseHint}
                  style={({ pressed }) => [
                    styles.useHintButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={styles.useHintButtonText}>
                    Use Hint
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleWatchAd}
                  style={({ pressed }) => [
                    styles.useHintButton,
                    {
                      backgroundColor: colors.success,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={styles.useHintButtonText}>
                    📺 Watch Ad for Hint
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  hintIcon: {
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hintModal: {
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  hintInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 20,
  },
  hintInfoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  noHintsInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  noHintsText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  useHintButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  useHintButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
