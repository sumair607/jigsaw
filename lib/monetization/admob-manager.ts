/**
 * AdMob Manager
 * Handles all ad operations: loading, displaying, tracking
 */

import { useEffect, useRef, useState } from "react";
import { InterstitialAd, RewardedAd } from "react-native-google-mobile-ads";
import {
  getAdMobAppId,
  getAdUnitId,
  shouldShowAd,
  AD_FREQUENCY_LIMITS,
  AD_REWARDS,
  logAdMobStatus,
} from "./admob-config";

/**
 * Ad Manager State
 */
interface AdManagerState {
  isInitialized: boolean;
  lastInterstitialTime: number;
  interstitialCount: number;
  rewardedAdsToday: number;
  lastRewardedTime: number;
}

/**
 * Singleton AdMob Manager
 */
class AdMobManager {
  private static instance: AdMobManager;
  private state: AdManagerState = {
    isInitialized: false,
    lastInterstitialTime: 0,
    interstitialCount: 0,
    rewardedAdsToday: 0,
    lastRewardedTime: 0,
  };

  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AdMobManager {
    if (!AdMobManager.instance) {
      AdMobManager.instance = new AdMobManager();
    }
    return AdMobManager.instance;
  }

  /**
   * Initialize AdMob
   */
  async initialize(): Promise<void> {
    if (this.state.isInitialized) {
      return;
    }

    try {
      // Initialize Mobile Ads SDK
      const appId = getAdMobAppId();

      console.log("🚀 Initializing Google Mobile Ads SDK");
      console.log(`   App ID: ${appId}`);

      // Log configuration status
      logAdMobStatus();

      this.state.isInitialized = true;
      console.log("✅ AdMob initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize AdMob:", error);
    }
  }

  /**
   * Load interstitial ad
   */
  async loadInterstitialAd(adUnitId: string): Promise<void> {
    try {
      if (!this.state.isInitialized) {
        await this.initialize();
      }

      console.log(`📦 Loading interstitial ad: ${adUnitId}`);

      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        keywords: ["puzzle", "game", "casual"],
      });

      // Load the ad
      await this.interstitialAd.load();
      console.log("✅ Interstitial ad loaded");
    } catch (error) {
      console.error("❌ Failed to load interstitial ad:", error);
    }
  }

  /**
   * Show interstitial ad
   */
  async showInterstitialAd(location: string, isPremium: boolean = false): Promise<boolean> {
    try {
      if (!shouldShowAd("interstitial", location, isPremium)) {
        console.log(`⏭️ Skipping interstitial ad at ${location}`);
        return false;
      }

      // Check frequency limits
      const now = Date.now();
      const timeSinceLastAd = now - this.state.lastInterstitialTime;

      if (timeSinceLastAd < AD_FREQUENCY_LIMITS.bannerRefreshInterval * 1000) {
        console.log("⏭️ Interstitial ad shown too recently, skipping");
        return false;
      }

      if (this.state.interstitialCount >= AD_FREQUENCY_LIMITS.maxInterstitialsPerSession) {
        console.log("⏭️ Max interstitials per session reached");
        return false;
      }

      if (!this.interstitialAd) {
        console.log("⏭️ Interstitial ad not loaded");
        return false;
      }

      console.log(`📺 Showing interstitial ad at ${location}`);

      // Show the ad
      await this.interstitialAd.show();

      // Update state
      this.state.lastInterstitialTime = now;
      this.state.interstitialCount++;

      // Reload for next time
      const adUnitId = getAdUnitId("interstitial", location);
      await this.loadInterstitialAd(adUnitId);

      return true;
    } catch (error) {
      console.error("❌ Failed to show interstitial ad:", error);
      return false;
    }
  }

  /**
   * Load rewarded ad
   */
  async loadRewardedAd(adUnitId: string): Promise<void> {
    try {
      if (!this.state.isInitialized) {
        await this.initialize();
      }

      console.log(`📦 Loading rewarded ad: ${adUnitId}`);

      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        keywords: ["puzzle", "game", "casual"],
      });

      // Set reward event listener
      this.rewardedAd.addAdEventListener("onRewardedAdLoaded" as any, (reward: any) => {
        if (reward && typeof reward === "object" && "amount" in reward) {
          console.log(`🎁 User earned reward: ${reward.amount} ${reward.type}`);
        }
      });

      // Load the ad
      await this.rewardedAd.load();
      console.log("✅ Rewarded ad loaded");
    } catch (error) {
      console.error("❌ Failed to load rewarded ad:", error);
    }
  }

  /**
   * Show rewarded ad
   */
  async showRewardedAd(
    location: string,
    isPremium: boolean = false
  ): Promise<{ success: boolean; reward?: { type: string; amount: number } }> {
    try {
      if (!shouldShowAd("rewarded", location, isPremium)) {
        console.log(`⏭️ Skipping rewarded ad at ${location}`);
        return { success: false };
      }

      // Check daily limit
      if (this.state.rewardedAdsToday >= AD_FREQUENCY_LIMITS.maxRewardedAdsPerDay) {
        console.log("⏭️ Max rewarded ads per day reached");
        return { success: false };
      }

      if (!this.rewardedAd) {
        console.log("⏭️ Rewarded ad not loaded");
        return { success: false };
      }

      console.log(`🎬 Showing rewarded ad at ${location}`);

      // Show the ad
      await this.rewardedAd.show();

      // Update state
      this.state.rewardedAdsToday++;
      this.state.lastRewardedTime = Date.now();

      // Calculate reward based on location
      const reward: { type: string; amount: number } =
        location === "hint"
          ? { type: "hints", amount: AD_REWARDS.hintsForVideo }
          : { type: "coins", amount: AD_REWARDS.coinsForBonusVideo };

      // Reload for next time
      const adUnitId = getAdUnitId("rewarded", location);
      await this.loadRewardedAd(adUnitId);

      return { success: true, reward };
    } catch (error) {
      console.error("❌ Failed to show rewarded ad:", error);
      return { success: false };
    }
  }

  /**
   * Reset daily stats (call at midnight)
   */
  resetDailyStats(): void {
    this.state.rewardedAdsToday = 0;
    console.log("🔄 Daily ad stats reset");
  }

  /**
   * Reset session stats
   */
  resetSessionStats(): void {
    this.state.interstitialCount = 0;
    this.state.lastInterstitialTime = 0;
    console.log("🔄 Session ad stats reset");
  }

  /**
   * Get current state
   */
  getState(): AdManagerState {
    return { ...this.state };
  }

  /**
   * Check if ad is ready
   */
  isInterstitialReady(): boolean {
    return this.interstitialAd !== null;
  }

  isRewardedReady(): boolean {
    return this.rewardedAd !== null;
  }
}

/**
 * Hook to use AdMob Manager
 */
export function useAdMobManager() {
  const manager = useRef(AdMobManager.getInstance());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAdMob = async () => {
      await manager.current.initialize();
      setIsInitialized(true);
    };

    initializeAdMob();
  }, []);

  return {
    manager: manager.current,
    isInitialized,
    showInterstitial: (location: string, isPremium?: boolean) =>
      manager.current.showInterstitialAd(location, isPremium ?? false),
    showRewarded: (location: string, isPremium?: boolean) =>
      manager.current.showRewardedAd(location, isPremium ?? false),
    loadInterstitial: (adUnitId: string) => manager.current.loadInterstitialAd(adUnitId),
    loadRewarded: (adUnitId: string) => manager.current.loadRewardedAd(adUnitId),
  };
}

/**
 * Export singleton instance
 */
export const admobManager = AdMobManager.getInstance();
