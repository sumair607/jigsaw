# Image Integration Guide - Jigsaw Puzzle Pro

## Overview

This guide explains how to integrate royalty-free images from Pexels and Unsplash into the Jigsaw Puzzle Pro game. The game is currently set up with **48 sample images** (8 per category) that are ready for testing.

## Current Setup

### Image Structure

```
assets/images/
├── puzzles/
│   ├── nature/          (8 images)
│   ├── cities/          (8 images)
│   ├── animals/         (8 images)
│   ├── art/             (8 images)
│   ├── kids/            (8 images)
│   └── abstract/        (8 images)
├── manifest.json        (Image metadata)
├── icon.png             (App icon)
├── splash-icon.png      (Splash screen)
└── favicon.png          (Web favicon)
```

### Manifest Structure

The `manifest.json` file contains metadata for all puzzle images:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-09",
  "categories": {
    "nature": {
      "name": "Nature",
      "emoji": "🌿",
      "imageCount": 8,
      "images": [
        {
          "id": "nature-00",
          "filename": "nature-00.jpg",
          "title": "Nature Puzzle 1",
          "photographer": "Photo by Jigsaw Puzzle Pro",
          "source": "sample",
          "difficulty_levels": ["2x2", "3x3", "4x4", "6x6", "8x8"],
          "tags": ["nature"]
        }
        // ... more images
      ]
    }
    // ... other categories
  }
}
```

## How to Add Real Images

### Option 1: Manual Download (Recommended for Small Scale)

1. **Visit Image Sources:**
   - Pexels: https://www.pexels.com/
   - Unsplash: https://unsplash.com/
   - Pixabay: https://pixabay.com/

2. **Download Images:**
   - Search for category keywords (e.g., "mountain landscape" for Nature)
   - Download high-quality images (1200x1200px or larger)
   - Save as JPG format (for optimization)

3. **Organize Files:**
   ```bash
   # Save images to category folders
   assets/images/puzzles/nature/nature-00.jpg
   assets/images/puzzles/cities/cities-00.jpg
   # etc.
   ```

4. **Update Manifest:**
   - Edit `assets/images/manifest.json`
   - Update photographer names and sources
   - Add image titles and descriptions

### Option 2: API Integration (Recommended for Scale)

#### Using Unsplash API

1. **Get API Key:**
   - Visit: https://unsplash.com/developers
   - Sign up for free account
   - Create application to get API key

2. **Update Script:**
   ```python
   # In scripts/fetch-pexels-images.py
   UNSPLASH_API_KEY = "your_api_key_here"
   ```

3. **Run Script:**
   ```bash
   python3 scripts/fetch-pexels-images.py
   ```

#### Using Pexels API

1. **Get API Key:**
   - Visit: https://www.pexels.com/api/
   - Sign up for free account
   - Get API key (higher rate limits than Unsplash)

2. **Update Script:**
   ```python
   # In scripts/fetch-pexels-images.py
   PEXELS_API_KEY = "your_api_key_here"
   ```

3. **Run Script:**
   ```bash
   python3 scripts/fetch-pexels-images.py
   ```

### Option 3: Bulk Download Tool

Use a tool like `yt-dlp` or `gallery-dl` to batch download images:

```bash
# Example: Download from Unsplash search
gallery-dl "https://unsplash.com/search/mountain" -d assets/images/puzzles/nature/
```

## Image Requirements

### Specifications

| Requirement | Value |
|---|---|
| **Format** | JPG (JPEG) |
| **Resolution** | 600×600px minimum (1200×1200px recommended) |
| **File Size** | 50-300 KB per image |
| **Color Space** | RGB |
| **Aspect Ratio** | Square (1:1) |

### Quality Guidelines

- **Clarity:** Images should be sharp and clear
- **Composition:** Good composition for puzzle enjoyment
- **Variety:** Mix of different subjects within each category
- **Brightness:** Avoid very dark or washed-out images
- **Content:** Appropriate for all ages (PEGI 3)

## Image Processing

### Automatic Processing

The game automatically handles:

1. **Image Resizing:** Scales to 600×600px for puzzle generation
2. **Compression:** Optimizes file size for mobile
3. **Caching:** Stores locally for offline play
4. **Slicing:** Converts to puzzle pieces on demand

### Manual Optimization

For best results, pre-process images:

```bash
# Using ImageMagick
convert input.jpg -resize 600x600 -quality 85 output.jpg

# Using PIL (Python)
from PIL import Image
img = Image.open('input.jpg')
img.thumbnail((600, 600))
img.save('output.jpg', quality=85)
```

## Attribution & Licensing

### Important: Always Provide Attribution

When using images from Pexels/Unsplash, you must:

1. **Credit the Photographer:**
   ```
   Photo by [Photographer Name] on [Source]
   ```

2. **Update Manifest:**
   ```json
   {
     "photographer": "Jane Doe",
     "source": "unsplash",
     "sourceUrl": "https://unsplash.com/photos/..."
   }
   ```

3. **In-App Display:**
   - Show photographer credit in image details
   - Link to original source when possible

### License Compliance

- **Pexels:** Free for commercial use (no attribution required, but appreciated)
- **Unsplash:** Free for commercial use (attribution appreciated)
- **Pixabay:** Free for commercial use (no attribution required)

**All images must be royalty-free and safe for commercial use in Google Play Store.**

## Testing Images

### Verify Images Work

1. **Check File Integrity:**
   ```bash
   file assets/images/puzzles/nature/*.jpg
   ```

2. **Test in App:**
   - Run: `npm run dev`
   - Navigate to category screen
   - Tap on puzzle to verify image loads
   - Test puzzle slicing (2×2, 4×4, 8×8)

3. **Check Performance:**
   - Monitor memory usage
   - Test on low-end device
   - Verify offline functionality

## Troubleshooting

### Images Not Loading

1. **Check File Path:**
   - Ensure images are in correct directory
   - Verify filename matches manifest

2. **Check Manifest:**
   - Validate JSON syntax
   - Verify image IDs and filenames match

3. **Check Permissions:**
   ```bash
   chmod 644 assets/images/puzzles/*/*.jpg
   ```

### Poor Image Quality

1. **Increase Resolution:**
   - Use 1200×1200px or larger source images
   - Reduce compression quality in script

2. **Check Aspect Ratio:**
   - Ensure images are square (1:1)
   - Crop if necessary

### Memory Issues

1. **Reduce Image Count:**
   - Start with 4-5 images per category
   - Gradually add more

2. **Optimize Images:**
   - Reduce file size to 100-150 KB
   - Use JPEG quality 80-85

## Scripts Reference

### fetch-pexels-images.py

Generates sample images and creates manifest:

```bash
python3 scripts/fetch-pexels-images.py
```

**Features:**
- Creates 48 sample images (8 per category)
- Generates manifest.json
- Provides instructions for API integration

### download-images.py

Legacy script for downloading from Pexels API:

```bash
python3 scripts/download-images.py
```

## Next Steps

1. **For Testing:** Use current sample images (already in place)
2. **For Production:** Replace with real royalty-free images
3. **For Scale:** Integrate Unsplash or Pexels API
4. **For Optimization:** Pre-process images before adding

## Resources

- **Pexels API:** https://www.pexels.com/api/
- **Unsplash API:** https://unsplash.com/developers
- **Pixabay API:** https://pixabay.com/api/
- **Image Optimization:** https://tinypng.com/
- **Batch Processing:** https://www.imagemagick.org/

## Support

For issues with image integration:

1. Check manifest.json syntax
2. Verify image file paths
3. Test image loading in browser console
4. Check file permissions
5. Review error logs in app

---

**Last Updated:** February 9, 2026  
**Version:** 1.0.0
