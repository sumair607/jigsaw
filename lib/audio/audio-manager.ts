/**
 * Audio Manager
 * Handles all sound effects for the game
 */

import { Audio as ExpoAudio } from "expo-av";
import { Platform } from "react-native";

/**
 * Audio configuration
 */
export interface AudioConfig {
  enabled: boolean;
  volume: number; // 0-1
  soundEffects: boolean;
  haptics: boolean;
}

/**
 * Sound effect types
 */
export type SoundEffectType = "snap" | "completion" | "achievement" | "click" | "error" | "hint";

/**
 * Audio Manager Singleton
 */
class AudioManager {
  private static instance: AudioManager;
  private config: AudioConfig = {
    enabled: true,
    volume: 0.7,
    soundEffects: true,
    haptics: true,
  };

  private soundPlayers: Map<SoundEffectType, ExpoAudio.Sound | null> = new Map();
  private isInitialized = false;

  private constructor() {
    // Initialize sound map
    this.soundPlayers.set("snap", null);
    this.soundPlayers.set("completion", null);
    this.soundPlayers.set("achievement", null);
    this.soundPlayers.set("click", null);
    this.soundPlayers.set("error", null);
    this.soundPlayers.set("hint", null);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Only initialize on native platforms
      if (Platform.OS !== "web") {
        await ExpoAudio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        console.log("✅ Audio system initialized");
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize audio system:", error);
    }
  }

  /**
   * Load a sound effect
   */
  private async loadSound(soundType: SoundEffectType): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Map sound types to audio files
      const soundMap: Record<SoundEffectType, any> = {
        snap: require("@/assets/sounds/snap.mp3"),
        completion: require("@/assets/sounds/completion.mp3"),
        achievement: require("@/assets/sounds/achievement.mp3"),
        click: require("@/assets/sounds/click.mp3"),
        error: require("@/assets/sounds/error.mp3"),
        hint: require("@/assets/sounds/hint.mp3"),
      };

      const soundSource = soundMap[soundType];

      if (!soundSource) {
        console.warn(`⚠️ Sound not found: ${soundType}`);
        return null;
      }

      const sound = new ExpoAudio.Sound();
      await sound.loadAsync(soundSource as any);
      await sound.setVolumeAsync(this.config.volume);

      console.log(`✅ Loaded sound: ${soundType}`);
      return sound;
    } catch (error) {
      console.error(`❌ Failed to load sound ${soundType}:`, error);
      return null;
    }
  }

  /**
   * Play a sound effect
   */
  async playSound(soundType: SoundEffectType): Promise<void> {
    try {
      if (!this.config.enabled || !this.config.soundEffects) {
        return;
      }

      // Load sound if not already loaded
      let sound = this.soundPlayers.get(soundType);

      if (!sound) {
        sound = await this.loadSound(soundType);
        if (!sound) {
          return;
        }
        this.soundPlayers.set(soundType, sound);
      }

      // Play the sound
      await sound.playAsync();
      console.log(`🔊 Playing sound: ${soundType}`);
    } catch (error) {
      console.error(`❌ Failed to play sound ${soundType}:`, error);
    }
  }

  /**
   * Stop a sound effect
   */
  async stopSound(soundType: SoundEffectType): Promise<void> {
    try {
      const sound = this.soundPlayers.get(soundType);

      if (sound) {
        await sound.stopAsync();
        console.log(`⏹️ Stopped sound: ${soundType}`);
      }
    } catch (error) {
      console.error(`❌ Failed to stop sound ${soundType}:`, error);
    }
  }

  /**
   * Stop all sounds
   */
  async stopAllSounds(): Promise<void> {
    try {
      for (const [soundType, sound] of this.soundPlayers.entries()) {
        if (sound) {
          await sound.stopAsync();
        }
      }
      console.log("⏹️ Stopped all sounds");
    } catch (error) {
      console.error("❌ Failed to stop all sounds:", error);
    }
  }

  /**
   * Unload all sounds (cleanup)
   */
  async unloadAllSounds(): Promise<void> {
    try {
      for (const [soundType, sound] of this.soundPlayers.entries()) {
        if (sound) {
          await sound.unloadAsync();
          this.soundPlayers.set(soundType, null);
        }
      }
      console.log("🗑️ Unloaded all sounds");
    } catch (error) {
      console.error("❌ Failed to unload sounds:", error);
    }
  }

  /**
   * Set volume (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.config.volume = clampedVolume;

      // Update all loaded sounds
      for (const sound of this.soundPlayers.values()) {
        if (sound) {
          await sound.setVolumeAsync(clampedVolume);
        }
      }

      console.log(`🔊 Volume set to: ${Math.round(clampedVolume * 100)}%`);
    } catch (error) {
      console.error("❌ Failed to set volume:", error);
    }
  }

  /**
   * Enable/disable sound effects
   */
  setSoundEffectsEnabled(enabled: boolean): void {
    this.config.soundEffects = enabled;
    console.log(`🔊 Sound effects ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Enable/disable all audio
   */
  setAudioEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🔊 Audio ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Get current config
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("⚙️ Audio config updated:", this.config);
  }
}

/**
 * Export singleton instance
 */
export const audioManager = AudioManager.getInstance();

/**
 * Hook to use audio manager
 */
export function useAudioManager() {
  return {
    playSound: (soundType: SoundEffectType) => audioManager.playSound(soundType),
    stopSound: (soundType: SoundEffectType) => audioManager.stopSound(soundType),
    stopAllSounds: () => audioManager.stopAllSounds(),
    setVolume: (volume: number) => audioManager.setVolume(volume),
    setSoundEffectsEnabled: (enabled: boolean) => audioManager.setSoundEffectsEnabled(enabled),
    setAudioEnabled: (enabled: boolean) => audioManager.setAudioEnabled(enabled),
    getConfig: () => audioManager.getConfig(),
    updateConfig: (config: Partial<AudioConfig>) => audioManager.updateConfig(config),
  };
}
