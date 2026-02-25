/**
 * Google AdMob Configuration
 * Centralized configuration for all ad units and settings
 * 
 * IMPORTANT: Replace placeholder ad unit IDs with your real AdMob IDs
 * Get your IDs from: https://admob.google.com/
 */

import { Platform } from "react-native";

/**
 * AdMob App IDs
 * Get these from Google AdMob Console
 */
export const ADMOB_APP_IDS = {
  // Android App ID
  android: "ca-app-pub-9970688716348020~3457773820",
  // iOS App ID
  ios: "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
};

/**
 * Ad Unit IDs for different ad types
 * Format: ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy
 * 
 * Test Ad Unit IDs (for development/testing):
 * - Banner: ca-app-pub-3940256099942544/6300978111
 * - Interstitial: ca-app-pub-3940256099942544/1033173712
 * - Rewarded: ca-app-pub-3940256099942544/5224354917
 */
export const AD_UNIT_IDS = {
  // Banner Ads - Home screen, category screen
  BANNER_HOME: "ca-app-pub-9970688716348020/9493203715",
  BANNER_CATEGORY: "ca-app-pub-9970688716348020/9493203715",

  // Interstitial Ads - Between puzzle completions
  INTERSTITIAL_COMPLETION: "ca-app-pub-9970688716348020/3178572226",

  // Rewarded Ads - For hints, bonus coins
  REWARDED_HINT: "ca-app-pub-9970688716348020/7852314405",
  REWARDED_COINS: "ca-app-pub-9970688716348020/7852314405",
};

/**
 * Get the appropriate app ID for current platform
 */
export function getAdMobAppId(): string {
  const appId = Platform.OS === "ios" ? ADMOB_APP_IDS.ios : ADMOB_APP_IDS.android;
  
  if (appId.includes("xxxxxxxx")) {
    console.warn(
      "⚠️ AdMob App ID not configured. Please add your real App ID from https://admob.google.com/"
    );
  }
  
  return appId;
}

/**
 * Ad Display Configuration
 * Controls when and where ads are shown
 */
export const AD_DISPLAY_CONFIG = {
  // Show banner ads on home screen
  showBannerOnHome: true,

  // Show banner ads on category screen
  showBannerOnCategory: true,

  // Show interstitial after puzzle completion
  showInterstitialOnCompletion: true,

  // Minimum time between interstitial ads (milliseconds)
  interstitialMinInterval: 120000, // 2 minutes

  // Show rewarded ads for hints
  showRewardedForHints: true,

  // Show rewarded ads for bonus coins
  showRewardedForCoins: true,

  // NO ads during active puzzle solving (user experience priority)
  showAdsDuringGameplay: false,

  // No ads on settings screen
  showAdsOnSettings: false,

  // No ads on achievements screen
  showAdsOnAchievements: false,
};

/**
 * Ad Frequency Limits
 * Prevents ad fatigue and improves retention
 */
export const AD_FREQUENCY_LIMITS = {
  // Maximum interstitials per session
  maxInterstitialsPerSession: 5,

  // Minimum puzzles between interstitials
  minPuzzlesBetweenInterstitials: 3,

  // Banner refresh interval (seconds)
  bannerRefreshInterval: 30,

  // Maximum rewarded ads per day
  maxRewardedAdsPerDay: 10,
};

/**
 * Ad Reward Configuration
 */
export const AD_REWARDS = {
  // Coins earned for watching hint reward video
  coinsForHintVideo: 3,

  // Coins earned for watching bonus video
  coinsForBonusVideo: 10,

  // Hints earned for watching hint reward video
  hintsForVideo: 1,
};

/**
 * User Consent & Privacy Configuration
 * GDPR and CCPA compliant
 */
export const CONSENT_CONFIG = {
  // Show consent form on first launch
  showConsentOnFirstLaunch: true,

  // Privacy policy URL
  privacyPolicyUrl: "https://example.com/privacy-policy",

  // Terms of service URL
  termsUrl: "https://example.com/terms",

  // Collect personalized ads consent
  collectPersonalizedAdsConsent: true,

  // Collect non-personalized ads consent
  collectNonPersonalizedAdsConsent: true,
};

/**
 * Test Device Configuration
 * Add your device ID for testing with real ads
 * Get device ID from logcat when running app
 */
export const TEST_DEVICES = [
  // Example: "33BE2250B43518CCDA7DE426D04EE232"
  // Add your device ID here for testing
];

/**
 * Helper function to check if ad should be shown
 */
export function shouldShowAd(
  adType: "banner" | "interstitial" | "rewarded",
  location: string,
  isPremiumUser: boolean
): boolean {
  // Don't show ads to premium users
  if (isPremiumUser) {
    return false;
  }

  // Check display config
  switch (adType) {
    case "banner":
      if (location === "home") return AD_DISPLAY_CONFIG.showBannerOnHome;
      if (location === "category") return AD_DISPLAY_CONFIG.showBannerOnCategory;
      if (location === "settings") return AD_DISPLAY_CONFIG.showAdsOnSettings;
      if (location === "achievements") return AD_DISPLAY_CONFIG.showAdsOnAchievements;
      return false;

    case "interstitial":
      if (location === "completion") return AD_DISPLAY_CONFIG.showInterstitialOnCompletion;
      return false;

    case "rewarded":
      if (location === "hint") return AD_DISPLAY_CONFIG.showRewardedForHints;
      if (location === "coins") return AD_DISPLAY_CONFIG.showRewardedForCoins;
      return false;

    default:
      return false;
  }
}

/**
 * Get ad unit ID by type and location
 */
export function getAdUnitId(
  adType: "banner" | "interstitial" | "rewarded",
  location: string
): string {
  switch (adType) {
    case "banner":
      if (location === "home") return AD_UNIT_IDS.BANNER_HOME;
      if (location === "category") return AD_UNIT_IDS.BANNER_CATEGORY;
      break;

    case "interstitial":
      if (location === "completion") return AD_UNIT_IDS.INTERSTITIAL_COMPLETION;
      break;

    case "rewarded":
      if (location === "hint") return AD_UNIT_IDS.REWARDED_HINT;
      if (location === "coins") return AD_UNIT_IDS.REWARDED_COINS;
      break;
  }

  return "";
}

/**
 * Validation function to check if AdMob is properly configured
 */
export function validateAdMobConfig(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check App ID
  const appId = getAdMobAppId();
  if (appId.includes("xxxxxxxx")) {
    errors.push("AdMob App ID not configured. Add your real App ID from admob.google.com");
  }

  // Check ad unit IDs
  Object.entries(AD_UNIT_IDS).forEach(([key, value]) => {
    if (value.includes("xxxxxxxx")) {
      warnings.push(`Ad unit ID not configured for ${key}. Using test ID.`);
    }
  });

  // Check test devices
  if (TEST_DEVICES.length === 0) {
    warnings.push("No test devices configured. Add your device ID for testing with real ads.");
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Log AdMob configuration status
 */
export function logAdMobStatus(): void {
  const validation = validateAdMobConfig();

  console.log("📊 AdMob Configuration Status");
  console.log("============================");

  if (validation.isValid) {
    console.log("✅ AdMob is properly configured");
  } else {
    console.log("❌ AdMob configuration has errors:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log("⚠️ Warnings:");
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  console.log("\nAd Unit IDs:");
  Object.entries(AD_UNIT_IDS).forEach(([key, value]) => {
    const status = value.includes("xxxxxxxx") ? "⚠️ TEST" : "✅ REAL";
    console.log(`  ${key}: ${status}`);
  });
}
