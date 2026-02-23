/**
 * Monetization & Ad Configuration
 * Google Play Store compliant ad placement and monetization strategy
 */

/**
 * Ad Unit IDs - Replace with your actual Google AdMob IDs
 * Get these from Google AdMob Console: https://admob.google.com
 */
export const AD_UNIT_IDS = {
  // Banner ads - shown at bottom of home screen
  BANNER_HOME: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",

  // Interstitial ads - shown between puzzle completions
  INTERSTITIAL_COMPLETION: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",

  // Rewarded ads - shown when user requests hint
  REWARDED_HINT: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",

  // Rewarded ads - shown for bonus coins
  REWARDED_COINS: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
};

/**
 * Ad Placement Strategy
 * Ensures compliance with Google Play Store policies
 */
export const AD_PLACEMENT = {
  // NO ads during active puzzle solving (user experience priority)
  DURING_GAMEPLAY: false,

  // Banner ads on home screen (non-intrusive)
  HOME_SCREEN_BANNER: true,

  // Interstitial after puzzle completion (natural break point)
  AFTER_COMPLETION: true,

  // Rewarded ads for optional features (hints, bonus coins)
  OPTIONAL_REWARDS: true,

  // No ads on settings/achievements screens (respect user preferences)
  SETTINGS_SCREEN: false,
  ACHIEVEMENTS_SCREEN: false,
};

/**
 * Monetization Features
 */
export const MONETIZATION = {
  // Rewarded video for hints (3 free hints per puzzle, then watch ad)
  HINTS_REWARDED_VIDEO: true,

  // Rewarded video for bonus coins
  COINS_REWARDED_VIDEO: true,

  // Optional premium features (no ads, more hints)
  PREMIUM_SUBSCRIPTION: {
    ENABLED: true,
    MONTHLY_PRICE: 2.99,
    ANNUAL_PRICE: 19.99,
    FEATURES: [
      "No ads",
      "Unlimited hints",
      "Custom image uploads",
      "Offline sync",
    ],
  },

  // In-app currency system
  COINS: {
    ENABLED: true,
    INITIAL_COINS: 100,
    EARN_PER_COMPLETION: 10,
    EARN_PER_DAILY_CHALLENGE: 50,
    EARN_PER_ACHIEVEMENT: 25,
  },
};

/**
 * Ad Display Frequency Limits
 * Prevents ad fatigue and improves retention
 */
export const AD_FREQUENCY = {
  // Minimum time between interstitial ads (seconds)
  INTERSTITIAL_MIN_INTERVAL: 120,

  // Maximum interstitials per session
  MAX_INTERSTITIALS_PER_SESSION: 5,

  // Minimum puzzles between banner ad refreshes
  BANNER_REFRESH_INTERVAL: 3,
};

/**
 * User Consent & Privacy
 * GDPR and CCPA compliant
 */
export const PRIVACY = {
  // Show consent form on first launch
  SHOW_CONSENT_ON_FIRST_LAUNCH: true,

  // Privacy policy URL
  PRIVACY_POLICY_URL:
    "https://example.com/privacy-policy",

  // Terms of service URL
  TERMS_URL: "https://example.com/terms",

  // Collect personalized ads consent
  PERSONALIZED_ADS: true,
};

/**
 * Ad Configuration Helper
 */
export function isAdPlacementAllowed(placement: keyof typeof AD_PLACEMENT): boolean {
  return AD_PLACEMENT[placement];
}

/**
 * Check if user has premium subscription
 */
export function shouldShowAds(isPremium: boolean): boolean {
  return !isPremium;
}

/**
 * Get reward amount for completing action
 */
export function getRewardCoins(action: "completion" | "daily" | "achievement"): number {
  const rewards = MONETIZATION.COINS;
  switch (action) {
    case "completion":
      return rewards.EARN_PER_COMPLETION;
    case "daily":
      return rewards.EARN_PER_DAILY_CHALLENGE;
    case "achievement":
      return rewards.EARN_PER_ACHIEVEMENT;
    default:
      return 0;
  }
}
