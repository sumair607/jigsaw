# Google AdMob Integration Guide - Jigsaw Puzzle Pro

## Overview

This guide explains how to integrate Google AdMob with the Jigsaw Puzzle Pro game. The app is configured with **test ad unit IDs** for development and testing. To monetize your app, you'll need to replace these with **real ad unit IDs** from your AdMob account.

## Current Setup

The app is configured with **Google Mobile Ads SDK** for React Native with support for:

- **Banner Ads** - Displayed at bottom of home and category screens
- **Interstitial Ads** - Full-screen ads shown after puzzle completion
- **Rewarded Ads** - Videos users watch to earn hints or bonus coins

## Step 1: Create Google AdMob Account

1. **Visit Google AdMob:**
   - Go to https://admob.google.com/
   - Sign in with your Google account (or create one)

2. **Create New App:**
   - Click "Apps" in the left menu
   - Click "Add app"
   - Select "Android"
   - Enter your app name: "Jigsaw Puzzle Pro"
   - Accept the terms and click "Create"

3. **Get Your App ID:**
   - After creating the app, you'll see your **App ID**
   - Format: `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`
   - Save this for later

## Step 2: Create Ad Units

For each ad type, you need to create an ad unit in AdMob:

### Banner Ad Unit

1. In your app, click "Ad units" → "Create new ad unit"
2. Select "Banner"
3. Name: "Jigsaw Puzzle Pro - Home Banner"
4. Click "Create ad unit"
5. Copy the **Ad unit ID** (format: `ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy`)

### Interstitial Ad Unit

1. Click "Ad units" → "Create new ad unit"
2. Select "Interstitial"
3. Name: "Jigsaw Puzzle Pro - Completion Interstitial"
4. Click "Create ad unit"
5. Copy the **Ad unit ID**

### Rewarded Ad Unit

1. Click "Ad units" → "Create new ad unit"
2. Select "Rewarded"
3. Name: "Jigsaw Puzzle Pro - Hint Rewarded"
4. Click "Create ad unit"
5. Copy the **Ad unit ID**

## Step 3: Update Configuration

### Update AdMob Config File

Edit `lib/monetization/admob-config.ts`:

```typescript
export const ADMOB_APP_IDS = {
  // Android App ID from AdMob
  android: "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
  // iOS App ID from AdMob (if building for iOS)
  ios: "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
};

export const AD_UNIT_IDS = {
  // Replace with your real ad unit IDs
  BANNER_HOME: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
  BANNER_CATEGORY: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
  INTERSTITIAL_COMPLETION: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
  REWARDED_HINT: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
  REWARDED_COINS: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
};
```

### Update app.config.ts

Update the Android package name in `app.config.ts`:

```typescript
const env = {
  appName: "Jigsaw Puzzle Pro",
  appSlug: "jigsaw-puzzle-pro",
  iosBundleId: "space.manus.jigsaw.puzzle.pro",
  androidPackage: "space.manus.jigsaw.puzzle.pro", // Must match AdMob app
};
```

## Step 4: Testing with Test Ad Unit IDs

### Current Test Setup

The app is pre-configured with **Google's test ad unit IDs**:

- **Banner:** `ca-app-pub-3940256099942544/6300978111`
- **Interstitial:** `ca-app-pub-3940256099942544/1033173712`
- **Rewarded:** `ca-app-pub-3940256099942544/5224354917`

These test IDs are safe to use during development and won't affect your AdMob account.

### Test on Device

1. **Run the app:**
   ```bash
   npm run dev
   ```

2. **Test Banner Ads:**
   - Navigate to Home screen
   - Banner ad should appear at bottom

3. **Test Interstitial Ads:**
   - Complete a puzzle
   - Interstitial ad should show

4. **Test Rewarded Ads:**
   - Click "Use Hint" button
   - Rewarded video should play

## Step 5: Deploy with Real Ad Unit IDs

### Before Publishing to Play Store

1. **Replace Test IDs with Real IDs:**
   - Update `lib/monetization/admob-config.ts`
   - Replace all test ad unit IDs with your real IDs

2. **Verify Configuration:**
   ```bash
   npm run check
   ```

3. **Test on Device:**
   - Ensure ads load correctly
   - Check that rewards work properly

4. **Monitor AdMob Dashboard:**
   - Go to https://admob.google.com/
   - Check "Ad units" for impressions
   - Monitor estimated earnings

## Ad Placement Strategy

### Banner Ads

| Location | Placement | Frequency |
|---|---|---|
| Home Screen | Bottom of screen | Always visible |
| Category Screen | Bottom of screen | Always visible |
| Puzzle Play | Hidden | No ads during gameplay |
| Settings | Hidden | No ads on settings |

### Interstitial Ads

| Trigger | Frequency | Delay |
|---|---|---|
| Puzzle Completion | Every 3 puzzles | 2 minutes minimum |
| Category Selection | Optional | User-initiated |

### Rewarded Ads

| Trigger | Reward | Limit |
|---|---|---|
| Watch for Hint | +1 hint | 3 free hints, then ads |
| Watch for Coins | +10 coins | 10 videos per day |

## Ad Policy Compliance

### Google Play Store Requirements

✅ **Compliant:**
- No ads during active gameplay
- Clear ad disclosure
- Rewarded ads for optional features
- User can close ads
- No misleading ads

❌ **Non-Compliant (Avoid):**
- Ads that look like game UI
- Forced ads without user consent
- Ads that block essential features
- Deceptive reward mechanics

### Best Practices

1. **User Experience:**
   - Never show ads during puzzle solving
   - Give users time between ads
   - Respect frequency limits

2. **Transparency:**
   - Clearly label ads
   - Explain rewards
   - Show ad attribution

3. **Performance:**
   - Pre-load ads before showing
   - Handle ad failures gracefully
   - Monitor ad performance

## Troubleshooting

### Ads Not Showing

1. **Check Configuration:**
   ```bash
   npm run check
   ```

2. **Verify Ad Unit IDs:**
   - Ensure IDs are correct in `admob-config.ts`
   - Check AdMob dashboard for active ad units

3. **Check Device:**
   - Ensure device has internet connection
   - Clear app cache and reinstall

4. **Check Logs:**
   - Look for error messages in console
   - Check AdMob dashboard for issues

### Low Ad Revenue

1. **Optimize Ad Placement:**
   - Ensure ads are visible
   - Test different placements
   - Monitor user engagement

2. **Increase Ad Impressions:**
   - More users = more impressions
   - Promote app through marketing
   - Improve retention

3. **Improve Ad Quality:**
   - Ensure high-quality content
   - Avoid policy violations
   - Maintain good user ratings

## Monitoring & Analytics

### AdMob Dashboard

1. **View Performance:**
   - Go to https://admob.google.com/
   - Check "Overview" for earnings
   - Monitor impressions and CTR

2. **Ad Unit Performance:**
   - Click "Ad units"
   - View performance by ad type
   - Identify top-performing units

3. **Earnings:**
   - Check "Earnings" section
   - View daily/monthly revenue
   - Track payment schedule

### In-App Analytics

The app logs all ad events to console:

```
✅ Banner ad loaded for home
📺 Showing interstitial ad at completion
🎬 Showing rewarded ad at hint
🎁 User earned reward: 1 hints
```

## Revenue Optimization

### Tips for Better Revenue

1. **User Retention:**
   - Improve game quality
   - Add daily challenges
   - Implement achievement system

2. **Ad Frequency:**
   - Balance ads with user experience
   - Use frequency limits
   - Monitor user feedback

3. **Premium Features:**
   - Offer ad-free experience
   - Premium subscription
   - In-app purchases

### Expected Revenue

Typical RPM (Revenue Per 1000 Impressions):
- **Banner Ads:** $0.50 - $2.00
- **Interstitial Ads:** $2.00 - $5.00
- **Rewarded Ads:** $5.00 - $15.00

*Note: Revenue varies by region, user demographics, and content quality*

## Account Management

### Payment Setup

1. **Add Payment Method:**
   - Go to AdMob Settings
   - Click "Payments"
   - Add bank account or payment method

2. **Threshold:**
   - Payments start at $100 earned
   - Paid monthly (around 21st-26th)

### Policies & Compliance

1. **Review Policies:**
   - https://support.google.com/admob/answer/6128543
   - Ensure app complies with all policies

2. **Prohibited Content:**
   - No adult content
   - No gambling
   - No misleading ads
   - No policy violations

## Support & Resources

- **AdMob Help Center:** https://support.google.com/admob/
- **Google Mobile Ads SDK:** https://developers.google.com/admob/android/quick-start
- **React Native Google Mobile Ads:** https://react-native-google-mobile-ads.com/
- **AdMob Community:** https://groups.google.com/g/google-admob

## Checklist for Launch

- [ ] Created AdMob account
- [ ] Created app in AdMob
- [ ] Created ad units (banner, interstitial, rewarded)
- [ ] Updated `admob-config.ts` with real IDs
- [ ] Updated `app.config.ts` with correct package name
- [ ] Tested ads on device
- [ ] Verified ads load correctly
- [ ] Checked AdMob dashboard for impressions
- [ ] Set up payment method
- [ ] Reviewed AdMob policies
- [ ] Ready for Play Store submission

---

**Last Updated:** February 9, 2026  
**Version:** 1.0.0
