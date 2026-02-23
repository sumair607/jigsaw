/**
 * Banner Ad Component (Web-Safe)
 */

import React from "react";
import { Platform, View } from "react-native";

let BannerAd: any;
let BannerAdSize: any;

if (Platform.OS !== "web") {
  try {
    const ads = require("react-native-google-mobile-ads");
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch (e) {
    console.log("AdMob not available");
  }
}

export function AppBannerAd({ unitId }: { unitId: string }) {
  if (Platform.OS === "web" || !BannerAd) {
    return null;
  }

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
}
