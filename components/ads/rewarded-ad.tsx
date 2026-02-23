/**
 * Rewarded Ad Hook
 * Manages showing rewarded ads for hints and bonus coins
 */

import { useCallback } from "react";
import { admobManager } from "@/lib/monetization/admob-manager";
import { getAdUnitId, shouldShowAd } from "@/lib/monetization/admob-config";

interface RewardedAdHookProps {
  isPremium?: boolean;
  onRewardEarned?: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
  onAdFailed?: (error: Error) => void;
}

/**
 * Hook to show rewarded ads
 * Usage: const { showRewardedAd } = useRewardedAd({ onRewardEarned })
 */
export function useRewardedAd({
  isPremium = false,
  onRewardEarned,
  onAdClosed,
  onAdFailed,
}: RewardedAdHookProps) {
  const showRewardedAd = useCallback(
    async (location: "hint" | "coins") => {
      // Check if ad should be shown
      if (!shouldShowAd("rewarded", location, isPremium)) {
        console.log(`⏭️ Skipping rewarded ad at ${location}`);
        return { success: false };
      }

      try {
        // Load ad
        const adUnitId = getAdUnitId("rewarded", location);
        await admobManager.loadRewardedAd(adUnitId);

        // Small delay to ensure ad is loaded
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Show ad
        const result = await admobManager.showRewardedAd(location, isPremium);

        if (result.success && result.reward) {
          onRewardEarned?.(result.reward);
          console.log(`✅ Rewarded ad shown at ${location}, reward earned:`, result.reward);
        }

        onAdClosed?.();
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("❌ Failed to show rewarded ad:", err);
        onAdFailed?.(err);
        return { success: false };
      }
    },
    [isPremium, onRewardEarned, onAdClosed, onAdFailed]
  );

  return { showRewardedAd };
}

/**
 * Manual function to show rewarded ad
 */
export async function showRewardedAd(
  location: "hint" | "coins",
  isPremium: boolean = false,
  onRewardEarned?: (reward: { type: string; amount: number }) => void
): Promise<{ success: boolean; reward?: { type: string; amount: number } }> {
  try {
    // Check if ad should be shown
    if (!shouldShowAd("rewarded", location, isPremium)) {
      console.log(`⏭️ Skipping rewarded ad at ${location}`);
      return { success: false };
    }

    // Load ad
    const adUnitId = getAdUnitId("rewarded", location);
    await admobManager.loadRewardedAd(adUnitId);

    // Small delay to ensure ad is loaded
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Show ad
    const result = await admobManager.showRewardedAd(location, isPremium);

    if (result.success && result.reward) {
      onRewardEarned?.(result.reward);
      console.log(`✅ Rewarded ad shown at ${location}, reward earned:`, result.reward);
    }

    return result;
  } catch (error) {
    console.error("❌ Failed to show rewarded ad:", error);
    return { success: false };
  }
}

export default useRewardedAd;
