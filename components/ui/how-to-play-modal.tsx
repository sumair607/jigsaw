import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ visible, onClose }: HowToPlayModalProps) {
  const colors = useColors();

  const steps = [
    {
      emoji: "🧩",
      title: "Drag & Drop",
      description:
        "Drag pieces from the bottom scroll bar onto the main board. You can move them anywhere on the canvas.",
    },
    {
      emoji: "✨",
      title: "Smart Snapping",
      description:
        "When a piece is close to its correct position, it will automatically snap and lock into place.",
    },
    {
      emoji: "🔄",
      title: "Rotation",
      description:
        "If rotation is enabled, tap a piece to rotate it 90 degrees, or use two fingers to rotate manually.",
    },
    {
      emoji: "💡",
      title: "Need a Hint?",
      description:
        "Stuck? Tap the lightbulb icon to see where a specific piece belongs or to preview the full image.",
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView
        style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              How to Play
            </Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {steps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepContainer,
                  { borderBottomColor: colors.border },
                  index === steps.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.emoji}>{step.emoji}</Text>
                <View style={styles.textContainer}>
                  <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepDesc, { color: colors.muted }]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.closeButtonText}>Got it!</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 24,
    maxWidth: 500,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});