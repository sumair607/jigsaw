#!/usr/bin/env python3
"""
Download royalty-free images from Pexels API
Organizes images by category for the Jigsaw Puzzle Pro game
"""

import os
import json
import requests
from pathlib import Path
from typing import List, Dict

# Pexels API - Free tier (no API key required for basic usage)
PEXELS_API = "https://api.pexels.com/v1"

# Image categories and search terms
CATEGORIES = {
    "nature": ["mountain landscape", "forest scenery", "waterfall", "sunset landscape", "ocean waves", "beach", "desert", "meadow", "river", "lake"],
    "cities": ["city skyline", "urban architecture", "street photography", "downtown", "modern buildings", "night city", "city lights", "skyscrapers", "urban landscape", "city park"],
    "animals": ["wildlife", "lion", "elephant", "giraffe", "zebra", "penguin", "eagle", "deer", "wolf", "bear"],
    "art": ["abstract art", "colorful patterns", "modern art", "geometric shapes", "artistic design", "creative patterns", "digital art", "painting", "illustration", "graffiti"],
    "kids": ["colorful toys", "children playing", "cartoon characters", "bright colors", "fun designs", "playful", "children art", "rainbow", "cute animals", "happy"],
    "abstract": ["abstract background", "geometric patterns", "texture", "gradient", "modern design", "minimalist", "artistic texture", "color splash", "digital pattern", "abstract shapes"]
}

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images" / "puzzles"

def ensure_directories():
    """Create necessary directories."""
    for category in CATEGORIES.keys():
        category_dir = OUTPUT_DIR / category
        category_dir.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {category_dir}")

def download_image(url: str, filepath: Path) -> bool:
    """Download image from URL."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✓ Downloaded: {filepath.name}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to download {url}: {e}")
        return False

def fetch_images_from_unsplash(category: str, search_terms: List[str], count: int = 8) -> List[Dict]:
    """Fetch images from Unsplash (free, no API key required)."""
    images = []
    
    for term in search_terms[:2]:  # Use first 2 search terms per category
        try:
            # Unsplash API endpoint (free tier)
            url = f"https://api.unsplash.com/search/photos"
            params = {
                "query": term,
                "per_page": 4,
                "orientation": "squarish"
            }
            
            # Note: For production, use your Unsplash API key
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for result in data.get("results", [])[:4]:
                    images.append({
                        "url": result["urls"]["regular"],
                        "photographer": result["user"]["name"],
                        "source": "unsplash"
                    })
                    
                    if len(images) >= count:
                        return images
        except Exception as e:
            print(f"  Warning: Could not fetch from Unsplash: {e}")
    
    return images

def create_sample_manifest():
    """Create a sample manifest with placeholder images."""
    manifest = {
        "version": "1.0.0",
        "categories": {}
    }
    
    for category, search_terms in CATEGORIES.items():
        manifest["categories"][category] = {
            "name": category.capitalize(),
            "emoji": get_category_emoji(category),
            "images": [
                {
                    "id": f"{category}-{i:02d}",
                    "filename": f"{category}-{i:02d}.jpg",
                    "title": f"{category.capitalize()} Image {i+1}",
                    "photographer": "Photographer Name",
                    "source": "pexels",
                    "difficulty_levels": ["2x2", "3x3", "4x4", "6x6", "8x8"]
                }
                for i in range(1, 9)  # 8 images per category
            ]
        }
    
    return manifest

def get_category_emoji(category: str) -> str:
    """Get emoji for category."""
    emojis = {
        "nature": "🌿",
        "cities": "🏙️",
        "animals": "🦁",
        "art": "🎨",
        "kids": "🎈",
        "abstract": "🌀"
    }
    return emojis.get(category, "📸")

def main():
    """Main function."""
    print("🧩 Jigsaw Puzzle Pro - Image Downloader")
    print("=" * 50)
    
    # Ensure directories exist
    ensure_directories()
    print()
    
    # Create manifest
    print("📋 Creating image manifest...")
    manifest = create_sample_manifest()
    
    manifest_path = OUTPUT_DIR.parent / "manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✓ Manifest created: {manifest_path}")
    print()
    
    # Note: For production deployment, you would download actual images here
    # using Pexels API or Unsplash API
    print("📸 Image Download Instructions:")
    print("-" * 50)
    print("To populate the game with real images:")
    print()
    print("1. Get a free API key from Pexels: https://www.pexels.com/api/")
    print("2. Or use Unsplash API: https://unsplash.com/developers")
    print()
    print("3. Update this script with your API key")
    print("4. Run: python3 scripts/download-images.py")
    print()
    print("For now, placeholder manifest has been created.")
    print("You can add images manually to:")
    for category in CATEGORIES.keys():
        print(f"  - assets/images/puzzles/{category}/")

if __name__ == "__main__":
    main()
