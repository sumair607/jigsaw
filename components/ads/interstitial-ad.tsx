/**
 * Interstitial Ad Hook
 * Manages showing interstitial ads at appropriate times
 */

import { useEffect } from "react";
import { admobManager } from "@/lib/monetization/admob-manager";
import { getAdUnitId, shouldShowAd } from "@/lib/monetization/admob-config";

interface InterstitialAdHookProps {
  location: "completion" | "category";
  isPremium?: boolean;
  onAdShown?: () => void;
  onAdClosed?: () => void;
}

/**
 * Hook to show interstitial ads
 * Usage: useInterstitialAd({ location: "completion" })
 */
export function useInterstitialAd({
  location,
  isPremium = false,
  onAdShown,
  onAdClosed,
}: InterstitialAdHookProps) {
  useEffect(() => {
    const loadAndShowAd = async () => {
      // Check if ad should be shown
      if (!shouldShowAd("interstitial", location, isPremium)) {
        console.log(`⏭️ Skipping interstitial ad at ${location}`);
        return;
      }

      try {
        // Load ad
        const adUnitId = getAdUnitId("interstitial", location);
        await admobManager.loadInterstitialAd(adUnitId);

        // Small delay to ensure ad is loaded
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Show ad
        const shown = await admobManager.showInterstitialAd(location, isPremium);

        if (shown) {
          onAdShown?.();
          console.log(`✅ Interstitial ad shown at ${location}`);

          // Callback when ad closes
          onAdClosed?.();
        }
      } catch (error) {
        console.error("❌ Failed to show interstitial ad:", error);
      }
    };

    loadAndShowAd();
  }, [location, isPremium, onAdShown, onAdClosed]);
}

/**
 * Manual function to show interstitial ad
 */
export async function showInterstitialAd(
  location: "completion" | "category",
  isPremium: boolean = false
): Promise<boolean> {
  try {
    const adUnitId = getAdUnitId("interstitial", location);
    await admobManager.loadInterstitialAd(adUnitId);

    // Small delay to ensure ad is loaded
    await new Promise((resolve) => setTimeout(resolve, 500));

    return await admobManager.showInterstitialAd(location, isPremium);
  } catch (error) {
    console.error("❌ Failed to show interstitial ad:", error);
    return false;
  }
}

export default useInterstitialAd;
