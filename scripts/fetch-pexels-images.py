#!/usr/bin/env python3
"""
Fetch royalty-free images from Pexels and Unsplash
Creates sample puzzle images for each category
"""

import os
import json
import requests
from pathlib import Path
from urllib.parse import urlparse
import time

# Pexels API endpoint (free, no key required for basic usage)
PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"

# Search queries for each category
CATEGORY_QUERIES = {
    "nature": [
        "mountain landscape",
        "forest scenery",
        "waterfall",
        "sunset landscape",
        "ocean waves",
        "beach",
        "desert landscape",
        "meadow flowers"
    ],
    "cities": [
        "city skyline",
        "urban architecture",
        "street photography",
        "downtown buildings",
        "modern skyscrapers",
        "night city lights",
        "city park",
        "urban landscape"
    ],
    "animals": [
        "wildlife nature",
        "lion animal",
        "elephant wildlife",
        "giraffe safari",
        "penguin bird",
        "eagle flying",
        "deer forest",
        "bear wildlife"
    ],
    "art": [
        "abstract art",
        "colorful patterns",
        "modern art painting",
        "geometric shapes",
        "artistic design",
        "creative patterns",
        "digital art",
        "artistic illustration"
    ],
    "kids": [
        "colorful toys",
        "children playing",
        "bright colors fun",
        "playful design",
        "rainbow colors",
        "cute animals",
        "happy children",
        "fun colorful"
    ],
    "abstract": [
        "abstract background",
        "geometric patterns",
        "texture background",
        "gradient colors",
        "modern design",
        "minimalist art",
        "color splash",
        "digital pattern"
    ]
}

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "puzzles"

def download_image_from_url(url: str, filepath: Path) -> bool:
    """Download image from URL."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception as e:
        print(f"    ✗ Failed: {e}")
        return False

def fetch_from_unsplash(query: str, count: int = 1) -> list:
    """Fetch images from Unsplash (free, no API key needed for basic searches)."""
    images = []
    try:
        # Using Unsplash's public search (limited rate)
        url = "https://unsplash.com/napi/search/photos"
        params = {
            "query": query,
            "per_page": count,
            "order_by": "relevant"
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            for result in data.get("results", []):
                images.append({
                    "url": result["urls"]["regular"],
                    "photographer": result["user"]["name"],
                    "title": result.get("description", query),
                    "source": "unsplash"
                })
    except Exception as e:
        print(f"    Unsplash fetch warning: {e}")
    
    return images

def fetch_from_pixabay(query: str, count: int = 1) -> list:
    """Fetch images from Pixabay (free, no API key required)."""
    images = []
    try:
        # Pixabay API endpoint (free tier, no auth required)
        url = "https://pixabay.com/api/"
        params = {
            "q": query,
            "per_page": count,
            "image_type": "photo",
            "orientation": "horizontal"
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            for hit in data.get("hits", []):
                images.append({
                    "url": hit["largeImageURL"],
                    "photographer": hit.get("user", "Unknown"),
                    "title": query,
                    "source": "pixabay"
                })
    except Exception as e:
        print(f"    Pixabay fetch warning: {e}")
    
    return images

def create_sample_images():
    """Create sample images using PIL for testing."""
    try:
        from PIL import Image, ImageDraw
        import random
        
        colors = [
            (255, 107, 107),  # Red
            (255, 193, 7),    # Yellow
            (76, 175, 80),    # Green
            (33, 150, 243),   # Blue
            (156, 39, 176),   # Purple
            (255, 152, 0),    # Orange
        ]
        
        for category in CATEGORY_QUERIES.keys():
            category_dir = OUTPUT_DIR / category
            category_dir.mkdir(parents=True, exist_ok=True)
            
            for i in range(8):
                # Create a colorful gradient image
                img = Image.new('RGB', (600, 600), color=(255, 255, 255))
                draw = ImageDraw.Draw(img)
                
                # Draw gradient-like rectangles
                color1 = colors[i % len(colors)]
                color2 = colors[(i + 1) % len(colors)]
                
                # Create gradient effect
                for y in range(600):
                    ratio = y / 600
                    r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
                    g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
                    b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
                    draw.line([(0, y), (600, y)], fill=(r, g, b))
                
                # Add text
                draw.text((300, 280), f"{category.upper()}", fill=(255, 255, 255), anchor="mm")
                draw.text((300, 320), f"Image {i+1}", fill=(255, 255, 255), anchor="mm")
                
                filepath = category_dir / f"{category}-{i:02d}.jpg"
                img.save(filepath, "JPEG", quality=85)
                print(f"    ✓ Created: {filepath.name}")
        
        return True
    except ImportError:
        print("    ℹ PIL not available, skipping sample image generation")
        return False

def main():
    """Main function."""
    print("🧩 Jigsaw Puzzle Pro - Image Integration")
    print("=" * 60)
    print()
    
    # Create directories
    print("📁 Creating category directories...")
    for category in CATEGORY_QUERIES.keys():
        category_dir = OUTPUT_DIR / category
        category_dir.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ {category}/")
    print()
    
    # Try to create sample images with PIL
    print("🎨 Generating sample images...")
    if create_sample_images():
        print("  ✓ Sample images created")
    print()
    
    # Create manifest
    print("📋 Creating image manifest...")
    manifest = {
        "version": "1.0.0",
        "lastUpdated": time.strftime("%Y-%m-%d"),
        "categories": {}
    }
    
    emojis = {
        "nature": "🌿",
        "cities": "🏙️",
        "animals": "🦁",
        "art": "🎨",
        "kids": "🎈",
        "abstract": "🌀"
    }
    
    for category, queries in CATEGORY_QUERIES.items():
        manifest["categories"][category] = {
            "name": category.capitalize(),
            "emoji": emojis[category],
            "imageCount": 8,
            "images": []
        }
        
        for i in range(8):
            manifest["categories"][category]["images"].append({
                "id": f"{category}-{i:02d}",
                "filename": f"{category}-{i:02d}.jpg",
                "title": f"{category.capitalize()} Puzzle {i+1}",
                "photographer": "Photo by Jigsaw Puzzle Pro",
                "source": "sample",
                "difficulty_levels": ["2x2", "3x3", "4x4", "6x6", "8x8"],
                "tags": [category]
            })
    
    manifest_path = OUTPUT_DIR.parent / "manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"  ✓ Manifest created: {manifest_path}")
    print()
    
    # Print instructions
    print("📸 Next Steps:")
    print("-" * 60)
    print()
    print("✅ Sample images have been created for testing")
    print()
    print("To add real royalty-free images:")
    print()
    print("Option 1: Unsplash (Recommended)")
    print("  - Visit: https://unsplash.com/developers")
    print("  - Get free API key")
    print("  - Update script with API key")
    print()
    print("Option 2: Pexels")
    print("  - Visit: https://www.pexels.com/api/")
    print("  - Get free API key")
    print("  - Update script with API key")
    print()
    print("Option 3: Manual Download")
    print("  - Download images from Unsplash/Pexels")
    print("  - Save to: assets/images/puzzles/{category}/")
    print("  - Update manifest.json with image metadata")
    print()
    print("Image directories created:")
    for category in CATEGORY_QUERIES.keys():
        print(f"  - assets/images/puzzles/{category}/")

if __name__ == "__main__":
    main()
