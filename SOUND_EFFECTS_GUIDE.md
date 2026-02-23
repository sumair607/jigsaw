# Sound Effects Integration Guide - Jigsaw Puzzle Pro

## Overview

This guide explains how to integrate sound effects into the Jigsaw Puzzle Pro game. The app is currently configured with **placeholder sound files** for development. To add real sound effects, you'll need to download royalty-free audio files and replace the placeholders.

## Current Setup

The app has placeholder sound files in `assets/sounds/`:

| Sound File | Purpose | Usage |
|---|---|---|
| `snap.mp3` | Piece snapping into place | When puzzle piece locks into correct position |
| `completion.mp3` | Puzzle completed | When all pieces are placed |
| `achievement.mp3` | Achievement unlocked | When user earns a badge |
| `click.mp3` | Button click | When user taps buttons |
| `error.mp3` | Error/invalid action | When invalid puzzle move attempted |
| `hint.mp3` | Hint revealed | When user uses a hint |

## Audio Manager

The app includes a complete audio management system in `lib/audio/audio-manager.ts`:

### Features

- **Singleton Pattern** - Single audio manager instance across the app
- **Volume Control** - Adjustable volume (0-1 range)
- **Enable/Disable** - Toggle sound effects on/off
- **Sound Preloading** - Loads sounds before playing
- **Error Handling** - Graceful fallback if sounds fail to load
- **Platform Support** - Works on Android, iOS, and web

### Usage

```typescript
import { useAudioManager } from "@/lib/audio/audio-manager";

export function MyComponent() {
  const { playSound } = useAudioManager();

  const handlePieceSnap = () => {
    playSound("snap");
  };

  return <Button onPress={handlePieceSnap} title="Snap" />;
}
```

## Step 1: Find Royalty-Free Sound Effects

### Recommended Sources

| Source | License | Quality | Cost |
|---|---|---|---|
| **Pixabay** | CC0 (Public Domain) | High | Free |
| **Freesound** | CC (Various) | Medium-High | Free/Premium |
| **Zapsplat** | CC0 | High | Free |
| **Epidemic Sound** | Subscription | Premium | Paid |
| **Pond5** | Royalty-Free | Premium | Paid |

### Search Keywords

- **Snap:** "click sound", "snap sound", "lock sound"
- **Completion:** "victory sound", "success chime", "level complete"
- **Achievement:** "achievement unlock", "badge sound", "notification"
- **Click:** "button click", "ui click", "interface sound"
- **Error:** "error sound", "wrong answer", "negative beep"
- **Hint:** "hint sound", "reveal sound", "ding sound"

## Step 2: Download Sound Files

### From Pixabay (Recommended)

1. Visit https://pixabay.com/sound-effects/
2. Search for each sound type
3. Download as MP3 format
4. Check file size (keep under 200KB per file)

### From Freesound

1. Visit https://freesound.org/
2. Search for sound effects
3. Download as MP3
4. Check license (must be CC or commercial-friendly)

## Step 3: Optimize Audio Files

### File Requirements

| Requirement | Value |
|---|---|
| **Format** | MP3 |
| **Bitrate** | 128 kbps (mono) |
| **Sample Rate** | 44100 Hz |
| **Duration** | 0.5-3 seconds |
| **File Size** | 50-200 KB |

### Optimize Using FFmpeg

```bash
# Convert to MP3 with optimal settings
ffmpeg -i input.wav -codec:a libmp3lame -q:a 5 -ac 1 -ar 44100 output.mp3

# Check file info
ffprobe output.mp3
```

### Optimize Using Online Tools

- https://www.freeconvert.com/mp3-compressor
- https://www.onlineconverter.com/mp3

## Step 4: Add Sound Files to Project

### File Structure

```
assets/sounds/
├── snap.mp3              (Piece snap sound)
├── completion.mp3        (Puzzle complete sound)
├── achievement.mp3       (Achievement unlock sound)
├── click.mp3             (Button click sound)
├── error.mp3             (Error sound)
└── hint.mp3              (Hint revealed sound)
```

### Replace Placeholder Files

1. Download optimized MP3 files
2. Replace files in `assets/sounds/` directory:
   ```bash
   cp ~/Downloads/snap-sound.mp3 assets/sounds/snap.mp3
   cp ~/Downloads/victory-sound.mp3 assets/sounds/completion.mp3
   # etc.
   ```

3. Verify files exist:
   ```bash
   ls -lh assets/sounds/
   ```

## Step 5: Test Sound Effects

### Test in Development

1. Run the app:
   ```bash
   npm run dev
   ```

2. Test each sound:
   - **Snap:** Play a puzzle and place a piece
   - **Completion:** Complete a puzzle
   - **Achievement:** Earn an achievement
   - **Click:** Tap buttons in settings
   - **Error:** Try invalid moves
   - **Hint:** Use a hint

### Test on Device

1. Build and run on Android:
   ```bash
   npm run android
   ```

2. Test audio playback
3. Check volume levels
4. Verify no audio glitches

## Sound Settings Integration

The app includes sound settings in the Settings screen:

### Settings Options

```typescript
// In settings screen
- Sound Effects: Toggle on/off
- Volume Slider: 0-100%
- Haptic Feedback: Toggle on/off
- Audio Mode: Normal / Silent / Vibrate
```

### Accessing Settings

```typescript
import { useAudioManager } from "@/lib/audio/audio-manager";

export function SettingsScreen() {
  const { getConfig, setSoundEffectsEnabled, setVolume } = useAudioManager();
  const config = getConfig();

  return (
    <View>
      <Switch
        value={config.soundEffects}
        onValueChange={setSoundEffectsEnabled}
      />
      <Slider
        value={config.volume}
        onValueChange={setVolume}
      />
    </View>
  );
}
```

## Sound Effect Timing

### Recommended Timing

| Sound | Trigger | Timing |
|---|---|---|
| **Snap** | Piece locks | Immediate |
| **Completion** | All pieces placed | Immediate |
| **Achievement** | Badge earned | Immediate |
| **Click** | Button pressed | Immediate |
| **Error** | Invalid action | Immediate |
| **Hint** | Hint revealed | 200ms delay |

### Implementation

```typescript
// Play sound with delay
setTimeout(() => {
  playSound("hint");
}, 200);
```

## Audio Attribution

### Required Credits

If using sounds with CC licenses, provide attribution:

```
Sound Effects:
- Snap: [Sound name] by [Artist] (CC0)
- Completion: [Sound name] by [Artist] (CC0)
- etc.

Download from: [Source URL]
```

### In-App Credits

Add to Settings > About:

```
Sound Effects
All sound effects are royalty-free and licensed under Creative Commons.
Visit [source] for more information.
```

## Troubleshooting

### Sounds Not Playing

1. **Check file path:**
   ```bash
   ls -la assets/sounds/
   ```

2. **Verify file format:**
   ```bash
   file assets/sounds/*.mp3
   ```

3. **Check audio manager initialization:**
   - Look for "✅ Audio system initialized" in console

4. **Check sound effects enabled:**
   - Verify in Settings that sound effects are enabled

### Audio Glitches

1. **Optimize file size:**
   - Reduce bitrate to 128 kbps
   - Use mono instead of stereo

2. **Check device volume:**
   - Ensure device volume is not muted
   - Check volume slider in Settings

3. **Test on different device:**
   - Try on different Android version
   - Check for device-specific issues

### Performance Issues

1. **Reduce number of sounds:**
   - Limit concurrent sound playback
   - Add delays between sounds

2. **Optimize audio files:**
   - Reduce file size
   - Use lower sample rate (22050 Hz)

## Advanced Configuration

### Custom Audio Settings

Edit `lib/audio/audio-manager.ts`:

```typescript
// Default configuration
private config: AudioConfig = {
  enabled: true,
  volume: 0.7,           // Default volume
  soundEffects: true,
  haptics: true,
};
```

### Disable Sounds for Specific Events

```typescript
// Don't play sound during gameplay
if (isGameActive) {
  return; // Skip sound
}
playSound("click");
```

## Resources

- **Pixabay Sound Effects:** https://pixabay.com/sound-effects/
- **Freesound:** https://freesound.org/
- **Zapsplat:** https://www.zapsplat.com/
- **FFmpeg Documentation:** https://ffmpeg.org/
- **Expo Audio Documentation:** https://docs.expo.dev/versions/latest/sdk/audio/

## Checklist for Launch

- [ ] Downloaded royalty-free sound files
- [ ] Optimized audio files (MP3, 128 kbps, mono)
- [ ] Replaced placeholder files in `assets/sounds/`
- [ ] Tested all sounds in development
- [ ] Tested sounds on physical device
- [ ] Verified volume levels
- [ ] Added audio credits
- [ ] Tested sound settings toggle
- [ ] Verified no audio glitches
- [ ] Ready for Play Store submission

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0
