/**
 * Browse Screen
 * Browse all puzzle categories in one place
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
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const CATEGORIES = [
  { id: "nature", name: "Nature", icon: "🌿", description: "Beautiful landscapes" },
  { id: "cities", name: "Cities", icon: "🏙️", description: "Urban photography" },
  { id: "animals", name: "Animals", icon: "🦁", description: "Wildlife photos" },
  { id: "art", name: "Art", icon: "🎨", description: "Artistic designs" },
  { id: "kids", name: "Kids", icon: "🎈", description: "Fun for all ages" },
  { id: "abstract", name: "Abstract", icon: "🌈", description: "Modern patterns" },
];

export default function BrowseScreen() {
  const colors = useColors();
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/puzzle-selection",
      params: { category: categoryId },
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
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={styles.headerTitle}>🔍 Browse Puzzles</Text>
          <Text style={styles.headerSubtitle}>Explore all categories</Text>
        </View>

        {/* Categories List */}
        <View style={styles.contentPadding}>
          <FlatList
            data={CATEGORIES}
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
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: colors.foreground }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.categoryDescription, { color: colors.muted }]}>
                    {item.description}
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
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
  },
  list: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
  },
  arrow: {
    fontSize: 24,
  },
});
