# Quick Test Guide

## ✅ What Was Fixed

1. **No image files** → Now using placeholder images from picsum.photos
2. **Empty image URIs** → Content manager now resolves proper URIs
3. **No image path resolution** → Created image-resolver.ts
4. **Missing navigation** → Created puzzle-selection and puzzle-game screens

## 🧪 How to Test

### Step 1: Start the app
```bash
pnpm dev
```

### Step 2: Test Category Selection
1. Open the app (home screen)
2. Click any category card (Nature, Cities, Animals, etc.)
3. **Expected**: You should see a list of puzzles with thumbnail images

### Step 3: Test Puzzle Loading
1. In the puzzle list, click any difficulty button (2x2, 3x3, 4x4)
2. **Expected**: Game screen loads with puzzle pieces
3. **Expected**: Each piece shows a portion of the image with a colored background

### Step 4: Test Puzzle Gameplay
1. Drag puzzle pieces around
2. Try to snap pieces to their correct positions
3. **Expected**: Pieces snap when near correct position
4. **Expected**: Completion modal shows when puzzle is complete

## 🐛 Troubleshooting

### If images don't load:
- Check internet connection (using online placeholder images)
- Check console for error messages
- Verify manifest.json exists in assets/puzzles/

### If navigation doesn't work:
- Clear Metro bundler cache: `pnpm dev --clear`
- Restart the app

### If pieces don't show images:
- Check browser/app console for image loading errors
- Verify imageUri is not empty in puzzle-canvas logs

## 📊 Expected Console Output

When loading a puzzle, you should see:
```
🎮 [INIT] Starting puzzle initialization
🔀 [SLICE] Slicing image into X pieces
🔀 [SLICE] Image URI: https://picsum.photos/seed/...
✅ [INIT] SUCCESS! Puzzle created with X pieces
```

## 🎯 Success Criteria

- ✅ Categories navigate to puzzle selection
- ✅ Puzzle thumbnails display
- ✅ Game loads without errors
- ✅ Puzzle pieces show image portions
- ✅ Pieces can be dragged and snapped
- ✅ No "empty imageUri" errors in console
