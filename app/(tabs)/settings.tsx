/**
 * Settings Screen
 * App-wide preferences and account management
 */

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Switch,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  SafeAreaView,
  Linking,
  Share,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  loadGameSettings,
  saveGameSettings,
  clearAllData,
  exportAllData,
} from "@/lib/storage/storage-manager";
import { clearAllCache, getCacheSize } from "@/lib/content/content-manager";
import { GameSettings } from "@/lib/game-engine/types";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [cacheSize, setCacheSize] = useState(0);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const gameSettings = await loadGameSettings();
      setSettings(gameSettings);
      const bytes = await getCacheSize();
      setCacheSize(Math.round(bytes / (1024 * 1024)));
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleToggleSetting = async (key: keyof GameSettings) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);
    await saveGameSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove all cached puzzle images. You can download them again.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await clearAllCache();
              setCacheSize(0);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Failed to clear cache:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your progress, settings, and achievements. This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Success", "All data has been deleted.");
              loadSettings();
            } catch (error) {
              console.error("Failed to clear data:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      
      await Share.share({
        message: jsonString,
        title: "Jigsaw Puzzle Pro - Backup Data"
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleRateApp = () => {
    const PACKAGE_NAME = "com.sumair607.jigsawpuzzlepro";
    const url = `market://details?id=${PACKAGE_NAME}`;
    
    Alert.alert(
      "Rate App",
      "Thank you for playing! Please rate us on the Google Play Store.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Open Play Store",
          onPress: () => Linking.openURL(url).catch(() => 
            Linking.openURL(`https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`)
          ),
        },
      ]
    );
  };

  if (!settings) {
    return (
      <ScreenContainer className="p-4">
        <Text style={{ color: colors.foreground }}>Loading settings...</Text>
      </ScreenContainer>
    );
  }

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
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
        </View>

        <View style={styles.contentPadding}>
          {/* Display Settings */}
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              Display
            </Text>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: colors.foreground },
                  ]}
                >
                  Dark Mode
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.muted },
                  ]}
                >
                  Current: {colorScheme === "dark" ? "Dark" : "Light"}
                </Text>
              </View>
            </View>
          </View>

          {/* Gameplay Settings */}
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              Gameplay
            </Text>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: colors.foreground },
                    ]}
                  >
                    Sound Effects
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.muted },
                    ]}
                  >
                    Play sounds during gameplay
                  </Text>
                </View>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={() => handleToggleSetting("soundEnabled")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: colors.foreground },
                    ]}
                  >
                    Haptic Feedback
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.muted },
                    ]}
                  >
                    Vibration on interactions
                  </Text>
                </View>
                <Switch
                  value={settings.hapticsEnabled}
                  onValueChange={() => handleToggleSetting("hapticsEnabled")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: colors.foreground },
                    ]}
                  >
                    Rotation Enabled
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.muted },
                    ]}
                  >
                    Allow piece rotation by default
                  </Text>
                </View>
                <Switch
                  value={settings.rotationEnabledByDefault}
                  onValueChange={() =>
                    handleToggleSetting("rotationEnabledByDefault")
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              Data Management
            </Text>

            <Pressable
              onPress={handleClearCache}
              style={({ pressed }) => [
                styles.settingButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: colors.foreground },
                  ]}
                >
                  Clear Cache
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.muted },
                  ]}
                >
                  {cacheSize} MB cached
                </Text>
              </View>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <Pressable
              onPress={handleExportData}
              style={({ pressed }) => [
                styles.settingButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: colors.foreground },
                  ]}
                >
                  Export Progress
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.muted },
                  ]}
                >
                  Save your data as JSON
                </Text>
              </View>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <Pressable
              onPress={handleClearAllData}
              style={({ pressed }) => [
                styles.settingButton,
                {
                  backgroundColor: colors.error,
                  borderColor: colors.error,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.settingLabel,
                  { color: "white" },
                ]}
              >
                Delete All Data
              </Text>
            </Pressable>
          </View>

          {/* About */}
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              About
            </Text>

            <Pressable
              onPress={handleRateApp}
              style={({ pressed }) => [
                styles.settingButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: colors.foreground },
                  ]}
                >
                  Rate App
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.muted },
                  ]}
                >
                  Leave a review on Play Store
                </Text>
              </View>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAbout(true)}
              style={({ pressed }) => [
                styles.settingButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: colors.foreground },
                  ]}
                >
                  About This App
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.muted },
                  ]}
                >
                  Version 1.0.0
                </Text>
              </View>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* About Modal */}
      <Modal visible={showAbout} transparent animationType="fade">
        <SafeAreaView
          style={[
            styles.modal,
            { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colors.foreground },
              ]}
            >
              About Jigsaw Puzzle Pro
            </Text>

            <Text
              style={[
                styles.modalText,
                { color: colors.muted },
              ]}
            >
              A modern, viral-ready jigsaw puzzle game designed for Android. Features multiple difficulty modes, smart snapping, offline play, and engaging retention mechanics.
            </Text>

            <Text
              style={[
                styles.modalSubtitle,
                { color: colors.foreground },
              ]}
            >
              Privacy & Legal
            </Text>

            <Pressable
              onPress={() => setShowAbout(false)}
              style={({ pressed }) => [
                styles.modalButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  },
  contentPadding: {
    padding: 16,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  settingButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonArrow: {
    fontSize: 18,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
