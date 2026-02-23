# Jigsaw Puzzle Pro - Design Document

## Vision
A modern, viral-ready jigsaw puzzle game that combines beautiful UI/UX with engaging gameplay mechanics. Designed for Android (Google Play Store) with offline play, smart snapping, and viral retention features.

---

## Screen Architecture

### 1. **Home Screen** (Tab: Home)
**Purpose:** Main entry point, shows daily challenge and quick access to puzzle categories.

**Content & Functionality:**
- **Header:** App logo, settings icon (top-right)
- **Daily Challenge Card:** Large, prominent card showing today's puzzle with "Play Now" button
  - Shows puzzle preview thumbnail
  - Displays completion status (new/in-progress/completed)
  - Shows best time/moves if completed
- **Category Grid:** Horizontal scrollable list of puzzle categories (Nature, Cities, Animals, Art, Kids, Abstract)
  - Each category shows icon + name + puzzle count
  - Tap to navigate to category screen
- **Stats Bar:** Shows total puzzles completed, current streak, achievements unlocked
- **Bottom Tab Bar:** Home (active), Play, Achievements, Settings

### 2. **Category Screen**
**Purpose:** Show all puzzles in a selected category with filtering by difficulty.

**Content & Functionality:**
- **Header:** Category name, back button
- **Difficulty Filter Tabs:** 2×2, 3×3, 4×4, 6×6, 8×8 (horizontal scrollable)
- **Puzzle Grid:** 2-column grid of puzzle cards
  - Each card shows puzzle thumbnail, name, difficulty badge, best time (if completed)
  - Tap to play, long-press to show options (delete, replay, share)
- **Empty State:** If no puzzles in category, show "No puzzles yet" with add button

### 3. **Puzzle Play Screen** (Main Game)
**Purpose:** The core gameplay experience with puzzle solving mechanics.

**Content & Functionality:**
- **Top Bar:**
  - Timer (MM:SS format)
  - Moves counter
  - Hint button (shows remaining hints)
  - Menu button (pause/settings)
- **Canvas Area:** Puzzle grid with interlocking pieces
  - Pieces are draggable and snappable
  - Completed pieces show subtle glow effect
  - Grid background shows target positions
- **Controls Panel (Bottom):**
  - Rotation toggle (on/off)
  - Undo button
  - Hint button (rewarded ad option)
  - Pause button
- **Progress Bar:** Shows completion percentage

### 4. **Pause/Menu Modal**
**Purpose:** Pause gameplay and show options.

**Content & Functionality:**
- **Resume Button**
- **Restart Button** (with confirmation)
- **Settings Toggle** (rotation, sound, haptics)
- **Exit Button** (saves progress automatically)

### 5. **Completion Screen** (Modal/Full Screen)
**Purpose:** Celebrate completion with viral-ready share features.

**Content & Functionality:**
- **Celebration Animation:** Confetti effect, glow, celebratory sound
- **Stats Display:**
  - Time taken
  - Moves made
  - Difficulty rating
  - Star rating (1-3 stars based on performance)
- **Buttons:**
  - Share (generates image preview + score)
  - Next Puzzle (auto-selects next puzzle in category)
  - Home (return to home screen)
- **Achievement Notification:** If new achievement unlocked, show badge with animation

### 6. **Achievements Screen** (Tab: Achievements)
**Purpose:** Show badges, streaks, and progress toward milestones.

**Content & Functionality:**
- **Streak Counter:** Large display of current day streak
- **Achievement Badges Grid:** 2-column grid showing:
  - Locked/unlocked badges with name and description
  - Progress bars for in-progress achievements (e.g., "Complete 10 puzzles")
- **Statistics Section:**
  - Total puzzles completed
  - Total time spent
  - Average completion time
  - Highest difficulty completed

### 7. **Settings Screen** (Tab: Settings)
**Purpose:** App-wide preferences and account management.

**Content & Functionality:**
- **Display Settings:**
  - Dark Mode / Light Mode toggle
  - Font size selector
- **Gameplay Settings:**
  - Sound toggle
  - Haptics toggle
  - Rotation mode default (on/off)
  - Hint system toggle
- **Data Management:**
  - Clear cache button
  - Export progress (JSON)
  - Import progress
  - Delete all data (with confirmation)
- **About Section:**
  - App version
  - Privacy policy link
  - Terms of service link
  - Rate app button
  - Contact support button

### 8. **Image Upload/Management Screen** (Accessible from Settings)
**Purpose:** Allow users to add custom images as puzzle sources.

**Content & Functionality:**
- **Upload Button:** Tap to select image from gallery
- **Recent Uploads:** Grid showing recently uploaded images
- **Image Preview:** Shows uploaded image with auto-resize preview
- **Generate Puzzles:** After upload, user selects which difficulty levels to create (2×2 through 8×8)
- **Confirmation:** Shows generated puzzles before saving

---

## Primary User Flows

### Flow 1: Play Daily Challenge
1. User opens app → Home screen
2. Taps "Play Now" on Daily Challenge card
3. Puzzle Play screen loads with puzzle
4. User solves puzzle (drag pieces, snap to grid)
5. Completion screen shows with celebration animation
6. User taps Share or Next Puzzle

### Flow 2: Browse & Play Category
1. User opens app → Home screen
2. Taps category card (e.g., "Nature")
3. Category screen shows puzzles filtered by difficulty
4. User taps puzzle card
5. Puzzle Play screen loads
6. User solves puzzle
7. Completion screen with share option

### Flow 3: Use Hints
1. During puzzle play, user taps Hint button
2. If hints available, show next piece location (highlight or glow)
3. If no hints available, show rewarded ad option
4. After watching ad, grant 1 hint

### Flow 4: Upload Custom Image
1. User goes to Settings → Image Management
2. Taps Upload button
3. Selects image from gallery
4. Image is resized to square canvas
5. User selects difficulty levels to generate
6. Puzzles are created and added to "Custom" category

### Flow 5: Check Achievements
1. User taps Achievements tab
2. Views current streak and badges
3. Taps badge to see description and progress
4. Taps "Rate App" button to go to Play Store

---

## Color Palette

### Light Mode
- **Background:** `#FFFFFF` (white)
- **Surface:** `#F8F9FA` (light gray)
- **Primary:** `#6366F1` (indigo) - CTA buttons, active states
- **Secondary:** `#10B981` (emerald) - Success states, completion
- **Accent:** `#F59E0B` (amber) - Warnings, hints
- **Text Foreground:** `#1F2937` (dark gray)
- **Text Muted:** `#6B7280` (medium gray)
- **Border:** `#E5E7EB` (light border)
- **Success:** `#22C55E` (green) - Achievements
- **Error:** `#EF4444` (red) - Errors, delete actions

### Dark Mode
- **Background:** `#0F172A` (very dark blue)
- **Surface:** `#1E293B` (dark slate)
- **Primary:** `#818CF8` (light indigo)
- **Secondary:** `#34D399` (light emerald)
- **Accent:** `#FBBF24` (light amber)
- **Text Foreground:** `#F1F5F9` (light gray)
- **Text Muted:** `#94A3B8` (medium gray)
- **Border:** `#334155` (dark border)
- **Success:** `#4ADE80` (light green)
- **Error:** `#F87171` (light red)

---

## Key Design Principles

### 1. **Minimalist Modern Aesthetic**
- Soft gradients on backgrounds (not harsh colors)
- Rounded cards with subtle shadows (elevation: 2-4dp)
- Plenty of whitespace to avoid clutter
- Consistent 8px grid system for spacing

### 2. **One-Handed Usage**
- All interactive elements within thumb reach (bottom 60% of screen)
- Large touch targets (minimum 48×48dp)
- Bottom-aligned controls and action buttons
- Tab bar at bottom for easy navigation

### 3. **Smooth Animations & Micro-interactions**
- Button press feedback: scale 0.97 + haptic (Light)
- Card tap feedback: opacity 0.7
- Piece snap: smooth spring animation (100-150ms)
- Completion: confetti + glow effect (500ms)
- Screen transitions: fade in/out (200-300ms)

### 4. **Accessibility & Performance**
- High contrast text (WCAG AA minimum)
- Large readable fonts (body: 16px, headers: 20-32px)
- Haptics can be disabled in settings
- Animations respect `prefers-reduced-motion`
- Optimized for low-end Android devices (API 24+)

### 5. **Offline-First Architecture**
- All puzzles cached locally after first load
- Images stored in app cache directory
- Progress saved to AsyncStorage (no internet required)
- Sync to cloud only if user enables (future feature)

---

## Difficulty Modes & Mechanics

| Mode | Grid | Pieces | Est. Time | Snapping Radius |
|------|------|--------|-----------|-----------------|
| 2×2  | 2×2  | 4      | 1-2 min   | 40px            |
| 3×3  | 3×3  | 9      | 3-5 min   | 35px            |
| 4×4  | 4×4  | 16     | 8-12 min  | 30px            |
| 6×6  | 6×6  | 36     | 20-30 min | 25px            |
| 8×8  | 8×8  | 64     | 45-60 min | 20px            |

### Smart Snapping System
- When piece is within snapping radius of correct position, snap automatically
- Piece rotates to correct angle (if rotation enabled)
- Snapped pieces show subtle glow and lock in place
- Undo button allows unsnapping pieces

### Rotation Mechanics
- Toggle on/off in settings or during play
- If enabled, pieces can be rotated with two-finger gesture
- Rotation increments: 90° per rotation
- Piece shows rotation angle indicator

---

## Monetization Strategy

### Ad Placement (Google Play Compliant)
- **Banner Ads:** Bottom of home screen and category screens (not during gameplay)
- **Interstitial Ads:** After puzzle completion (optional, can skip after 3 seconds)
- **Rewarded Ads:** Optional hint system (watch 30s video to get 1 hint)

### No Ads During Active Play
- Pause screen: no ads
- Puzzle play screen: no ads
- Completion screen: optional interstitial (skippable)

### In-App Purchases (Future)
- Remove ads permanently
- Unlock premium categories
- Custom themes

---

## Viral & Retention Features

### 1. **Daily Puzzle Challenge**
- New puzzle every day (same for all users)
- Leaderboard-style comparison (local only for now)
- Streak counter (consecutive days played)
- Bonus rewards for 7-day, 30-day streaks

### 2. **Share & Social**
- Completion screen has "Share" button
- Generates image with:
  - Puzzle thumbnail
  - Time taken
  - Moves made
  - Star rating
  - "Beat my score!" text
- Share to WhatsApp, Instagram, Facebook, Twitter

### 3. **Achievement Badges**
- First Puzzle Completed
- Speed Demon (Complete puzzle in < 2 min)
- Perfectionist (Complete with 0 hints)
- Streak Master (7-day streak)
- Category Master (Complete all puzzles in category)
- Difficulty Climber (Complete 8×8 puzzle)
- Custom Creator (Upload 5 custom images)

### 4. **Streak System**
- Track consecutive days played
- Visual counter on home screen
- Notification reminder if user hasn't played (future)
- Bonus hints for maintaining streak

### 5. **Celebratory Effects**
- Confetti animation on completion
- Glow effect on completed pieces
- Success sound (can be disabled)
- Star rating animation (1-3 stars based on time/moves)

---

## Content Management System

### Category Structure
```
categories/
  ├── nature/
  │   ├── forest.jpg
  │   ├── ocean.jpg
  │   └── mountains.jpg
  ├── cities/
  │   ├── paris.jpg
  │   └── tokyo.jpg
  ├── animals/
  ├── art/
  ├── kids/
  ├── abstract/
  └── custom/
      └── user-uploaded images
```

### Image Metadata
```json
{
  "id": "unique-id",
  "category": "nature",
  "name": "Forest Sunset",
  "source": "shutterstock",
  "sourceUrl": "https://...",
  "license": "royalty-free",
  "uploadedAt": "2024-01-15",
  "puzzles": [
    {
      "difficulty": "2x2",
      "pieceCount": 4,
      "gridSize": 2
    },
    {
      "difficulty": "3x3",
      "pieceCount": 9,
      "gridSize": 3
    }
  ]
}
```

### Adding New Images
- No code changes required
- Images stored in `assets/images/puzzles/`
- Metadata in `assets/images/puzzles/manifest.json`
- App loads manifest on startup
- New puzzles appear in app automatically

---

## Technical Architecture

### State Management
- **Local State:** React hooks (useState, useReducer)
- **Persistent State:** AsyncStorage (progress, settings, achievements)
- **Game State:** Custom game engine (puzzle logic, piece positions, snapping)

### File Structure
```
app/
  ├── (tabs)/
  │   ├── _layout.tsx
  │   ├── index.tsx (home)
  │   ├── play.tsx (category/puzzle selection)
  │   ├── achievements.tsx
  │   └── settings.tsx
  ├── puzzle/
  │   └── [id].tsx (puzzle play screen)
  └── _layout.tsx

components/
  ├── game/
  │   ├── puzzle-canvas.tsx
  │   ├── puzzle-piece.tsx
  │   ├── snapping-system.tsx
  │   └── image-slicer.tsx
  ├── ui/
  │   ├── category-card.tsx
  │   ├── puzzle-card.tsx
  │   ├── achievement-badge.tsx
  │   └── completion-modal.tsx
  └── ...

lib/
  ├── game-engine/
  │   ├── puzzle-logic.ts
  │   ├── piece-snapping.ts
  │   ├── image-processing.ts
  │   └── collision-detection.ts
  ├── storage/
  │   ├── progress-manager.ts
  │   ├── settings-manager.ts
  │   └── achievements-manager.ts
  └── ...

assets/
  ├── images/
  │   ├── icon.png
  │   ├── splash-icon.png
  │   └── puzzles/
  │       ├── manifest.json
  │       ├── nature/
  │       ├── cities/
  │       └── ...
  └── sounds/
      ├── snap.mp3
      ├── completion.mp3
      └── ...
```

---

## Performance Optimization

### Image Optimization
- Resize all images to fixed canvas (e.g., 1024×1024px) before slicing
- Use WebP format for smaller file sizes
- Cache images locally after first download
- Lazy-load puzzle thumbnails

### Puzzle Piece Rendering
- Use `FlatList` for piece rendering (not ScrollView)
- Memoize piece components to prevent unnecessary re-renders
- Use `react-native-reanimated` for smooth animations
- Batch state updates during piece dragging

### Memory Management
- Unload puzzle data when leaving play screen
- Clear image cache periodically (keep last 20 images)
- Use weak references for large image objects

### Low-End Device Support
- Target API 24+ (Android 7.0+)
- Test on devices with 2GB RAM
- Reduce animation frame rate on low-end devices
- Compress images aggressively

---

## Google Play Store Compliance

### Privacy & Data
- No user tracking (unless explicitly enabled)
- No personal data collection
- Clear privacy policy in settings
- Data stored locally (no cloud by default)

### Content Rating
- Target: PEGI 3 / ESRB E (Everyone)
- No violence, no adult content
- Family-friendly images only
- Clear content guidelines for user uploads

### Ads & Monetization
- Compliant with Google Ad policies
- No misleading ads
- Clear ad disclosure
- No ads during active gameplay
- Rewarded ads clearly labeled

### Permissions
- Only request necessary permissions
- Camera (for custom image upload)
- Storage (for image caching)
- Internet (for ads, optional)

### Technical Requirements
- Minimum API: 24 (Android 7.0)
- Target API: 34+ (Android 14+)
- 64-bit support
- Adaptive icon support
- Edge-to-edge display support

---

## Success Metrics

### User Engagement
- Daily active users (DAU)
- Session length (target: 10-15 min)
- Retention rate (Day 1, Day 7, Day 30)
- Puzzle completion rate

### Viral Growth
- Share rate (% of users who share)
- Organic installs from shares
- Streak continuation rate
- Achievement unlock rate

### Performance
- App startup time (target: < 2s)
- Puzzle load time (target: < 1s)
- Frame rate during gameplay (target: 60fps)
- Crash rate (target: < 0.1%)

### Monetization
- Ad impression rate
- Ad click-through rate (CTR)
- Rewarded ad completion rate
- Future: In-app purchase conversion rate

---

## Future Enhancements

1. **Multiplayer Mode:** Real-time puzzle racing
2. **Cloud Sync:** Cross-device progress sync
3. **User Accounts:** Leaderboards and profiles
4. **Custom Themes:** Dark mode variants, custom colors
5. **Advanced Hints:** Show piece outline, highlight similar pieces
6. **Puzzle Editor:** Create puzzles from scratch
7. **Accessibility:** Text-to-speech, high contrast mode
8. **Push Notifications:** Daily challenge reminders, achievement alerts
9. **Backend Integration:** Server-side leaderboards, analytics
10. **Premium Features:** Ad-free, exclusive categories, early access to daily puzzles

