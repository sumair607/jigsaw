/**
 * AdMob Manager
 * Handles Banner, Interstitial, and Rewarded ads
 */

import { Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AD_UNIT_IDS = {
  banner: __DEV__ ? TestIds.BANNER : "ca-app-pub-9970688716348020/9493203715",
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : "ca-app-pub-9970688716348020/3178572226",
  rewarded: __DEV__ ? TestIds.REWARDED : "ca-app-pub-9970688716348020/7852314405",
};

const STORAGE_KEYS = {
  PUZZLE_COUNT: "ad_puzzle_count",
  LAST_AD_TIME: "ad_last_shown_time",
};

const AD_CONFIG = {
  interstitialFrequency: 3,
  interstitialCooldown: 60000,
  rewardedHints: 3,
};

let interstitialAd: InterstitialAd | null = null;
let interstitialLoaded = false;
let rewardedAd: RewardedAd | null = null;
let rewardedLoaded = false;

export function initializeInterstitialAd() {
  interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
  
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialLoaded = false;
    interstitialAd?.load();
  });

  interstitialAd.load();
}

export function initializeRewardedAd() {
  rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded);
  
  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewardedLoaded = true;
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    rewardedLoaded = false;
    rewardedAd?.load();
  });

  rewardedAd.load();
}

export async function showInterstitialAfterPuzzle(): Promise<boolean> {
  try {
    const countStr = await AsyncStorage.getItem(STORAGE_KEYS.PUZZLE_COUNT);
    const puzzleCount = countStr ? parseInt(countStr, 10) : 0;
    const newCount = puzzleCount + 1;

    await AsyncStorage.setItem(STORAGE_KEYS.PUZZLE_COUNT, newCount.toString());

    if (newCount % AD_CONFIG.interstitialFrequency !== 0) {
      return false;
    }

    const lastAdTimeStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AD_TIME);
    if (lastAdTimeStr) {
      const lastAdTime = parseInt(lastAdTimeStr, 10);
      const timeSinceLastAd = Date.now() - lastAdTime;
      if (timeSinceLastAd < AD_CONFIG.interstitialCooldown) {
        return false;
      }
    }

    if (interstitialLoaded && interstitialAd) {
      await interstitialAd.show();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_AD_TIME, Date.now().toString());
      return true;
    } else {
      interstitialAd?.load();
      return false;
    }
  } catch (error) {
    console.error("Error showing interstitial:", error);
    return false;
  }
}

export async function showRewardedAdForHints(
  onRewarded: (hints: number) => void,
  onFailed: () => void
): Promise<void> {
  try {
    if (!rewardedLoaded || !rewardedAd) {
      onFailed();
      return;
    }

    const unsubscribe = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onRewarded(AD_CONFIG.rewardedHints);
        unsubscribe();
      }
    );

    await rewardedAd.show();
  } catch (error) {
    console.error("Error showing rewarded ad:", error);
    onFailed();
  }
}

export function isRewardedAdReady(): boolean {
  return rewardedLoaded;
}

export function getBannerAdUnitId(): string {
  return AD_UNIT_IDS.banner;
}

initializeInterstitialAd();
initializeRewardedAd();
