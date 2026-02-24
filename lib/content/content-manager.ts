/**
 * Content Manager
 * Handles loading, caching, and managing puzzle images and metadata
 */

import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PuzzleImage } from "@/lib/game-engine/types";
import {
  resolveCategoryImageSource,
  resolveCategoryImageUri,
} from "./image-resolver";

const CACHE_DIR = `${FileSystem.cacheDirectory}jigsaw-puzzles/`;
const MANIFEST_STORAGE_KEY = "jigsaw_puzzle_manifest";
const CACHE_INDEX_KEY = "jigsaw_cache_index";
const FREE_IMAGES_PER_CATEGORY = 10;
const FREE_DIFFICULTIES: Array<"2x2" | "3x3" | "4x4" | "5x5" | "6x6" | "8x8"> = [
  "2x2",
  "3x3",
  "4x4",
  "5x5",
  "6x6",
  "8x8",
];

interface CacheIndex {
  imageId: string;
  uri: string;
  cachedAt: number;
  size: number;
}

/**
 * Initialize cache directory
 */
export async function initializeCacheDirectory(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error("Failed to initialize cache directory:", error);
  }
}

/**
 * Load puzzle manifest from assets
 */
export async function loadManifest(): Promise<any> {
  try {
    // Load manifest from assets
    const manifest = require("@/assets/puzzles/manifest.json");
    return manifest;
  } catch (error) {
    console.error("Failed to load manifest:", error);
    // Return default manifest if file not found
    return {
      version: "1.0.0",
      categories: [
        { id: "nature", name: "Nature", icon: "🌿" },
        { id: "cities", name: "Cities", icon: "🏙️" },
        { id: "animals", name: "Animals", icon: "🦁" },
        { id: "art", name: "Art", icon: "🎨" },
        { id: "kids", name: "Kids", icon: "🎈" },
        { id: "abstract", name: "Abstract", icon: "🌈" },
      ],
      puzzles: [],
    };
  }
}

/**
 * Get all available puzzle images
 */
export async function getAllPuzzleImages(): Promise<PuzzleImage[]> {
  try {
    const manifest = await loadManifest();
    if (!manifest || !manifest.categories) return [];

    const categories: Array<{ id: string; name: string }> = manifest.categories;
    const generated: PuzzleImage[] = [];

    for (const category of categories) {
      for (let i = 0; i < FREE_IMAGES_PER_CATEGORY; i++) {
        const imageId = `${category.id}_demo_${String(i + 1).padStart(2, "0")}`;
        const imageUri = resolveCategoryImageUri(category.id, i);
        const imageSource = resolveCategoryImageSource(category.id, i);

        generated.push({
          id: imageId,
          name: `${category.name} Puzzle ${i + 1}`,
          category: category.id,
          imageUri,
          thumbnailUri: imageUri,
          imageSource,
          thumbnailSource: imageSource,
          source: "default",
          license: "free",
          uploadedAt: Date.now(),
          puzzles: FREE_DIFFICULTIES.map((difficulty) => ({
            difficulty,
            id: `${imageId}_${difficulty}`,
          })),
        });
      }
    }

    return generated;
  } catch (error) {
    console.error("Failed to get puzzle images:", error);
    return [];
  }
}

/**
 * Get puzzle images by category
 */
export async function getPuzzlesByCategory(category: string): Promise<PuzzleImage[]> {
  try {
    const allImages = await getAllPuzzleImages();
    return allImages.filter((img) => img.category === category);
  } catch (error) {
    console.error("Failed to get puzzles by category:", error);
    return [];
  }
}

/**
 * Cache image locally
 */
export async function cacheImage(
  imageUri: string,
  imageId: string
): Promise<string> {
  try {
    const cachedPath = `${CACHE_DIR}${imageId}.jpg`;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(cachedPath);
    if (fileInfo.exists) {
      return cachedPath;
    }

    // Download and cache image
    const downloadResult = await FileSystem.downloadAsync(
      imageUri,
      cachedPath
    );

    if (downloadResult.status === 200) {
      // Update cache index
      await updateCacheIndex(imageId, cachedPath);
      return cachedPath;
    }

    throw new Error("Failed to download image");
  } catch (error) {
    console.error("Failed to cache image:", error);
    // Return original URI if caching fails
    return imageUri;
  }
}

/**
 * Update cache index
 */
async function updateCacheIndex(imageId: string, uri: string): Promise<void> {
  try {
    const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    const index: CacheIndex[] = indexStr ? JSON.parse(indexStr) : [];

    // Remove old entry if exists
    const filtered = index.filter((item) => item.imageId !== imageId);

    // Add new entry
    const fileInfo = await FileSystem.getInfoAsync(uri);
    filtered.push({
      imageId,
      uri,
      cachedAt: Date.now(),
      size: (fileInfo as any).size || 0,
    });

    // Keep only last 20 cached images
    if (filtered.length > 20) {
      const toDelete = filtered.slice(0, filtered.length - 20);
      for (const item of toDelete) {
        await FileSystem.deleteAsync(item.uri, { idempotent: true });
      }
      filtered.splice(0, filtered.length - 20);
    }

    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to update cache index:", error);
  }
}

/**
 * Get cached image URI
 */
export async function getCachedImageUri(imageId: string): Promise<string | null> {
  try {
    const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!indexStr) return null;

    const index: CacheIndex[] = JSON.parse(indexStr);
    const item = index.find((i) => i.imageId === imageId);

    if (item) {
      const fileInfo = await FileSystem.getInfoAsync(item.uri);
      if (fileInfo.exists) {
        return item.uri;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to get cached image URI:", error);
    return null;
  }
}

/**
 * Clear old cache entries
 */
export async function clearOldCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!indexStr) return;

    const index: CacheIndex[] = JSON.parse(indexStr);
    const now = Date.now();
    const toDelete: CacheIndex[] = [];
    const toKeep: CacheIndex[] = [];

    for (const item of index) {
      if (now - item.cachedAt > maxAgeMs) {
        toDelete.push(item);
      } else {
        toKeep.push(item);
      }
    }

    // Delete old files
    for (const item of toDelete) {
      await FileSystem.deleteAsync(item.uri, { idempotent: true });
    }

    // Update index
    if (toDelete.length > 0) {
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(toKeep));
    }
  } catch (error) {
    console.error("Failed to clear old cache:", error);
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  try {
    const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (!indexStr) return 0;

    const index: CacheIndex[] = JSON.parse(indexStr);
    return index.reduce((total, item) => total + item.size, 0);
  } catch (error) {
    console.error("Failed to get cache size:", error);
    return 0;
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    await AsyncStorage.removeItem(CACHE_INDEX_KEY);
    await initializeCacheDirectory();
  } catch (error) {
    console.error("Failed to clear all cache:", error);
  }
}

/**
 * Get puzzle by ID
 */
export async function getPuzzleById(puzzleId: string): Promise<any> {
  try {
    const allImages = await getAllPuzzleImages();
    return allImages.find((p) => p.id === puzzleId) || null;
  } catch (error) {
    console.error("Failed to get puzzle by ID:", error);
    return null;
  }
}

/**
 * Get daily challenge puzzle
 */
export async function getDailyChallengePuzzle(): Promise<any> {
  try {
    const allImages = await getAllPuzzleImages();
    if (allImages.length === 0) return null;

    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000
    );
    return allImages[dayOfYear % allImages.length];
  } catch (error) {
    console.error("Failed to get daily challenge puzzle:", error);
    return null;
  }
}

/**
 * Search puzzles by name
 */
export async function searchPuzzles(query: string): Promise<PuzzleImage[]> {
  try {
    const allImages = await getAllPuzzleImages();
    const lowerQuery = query.toLowerCase();

    return allImages.filter(
      (img) =>
        img.name.toLowerCase().includes(lowerQuery) ||
        img.category.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error("Failed to search puzzles:", error);
    return [];
  }
}

/**
 * Get puzzle statistics
 */
export async function getPuzzleStats(): Promise<{
  totalPuzzles: number;
  totalCategories: number;
  cachedImages: number;
  cacheSize: number;
}> {
  try {
    const allImages = await getAllPuzzleImages();
    const categories = new Set(allImages.map((img) => img.category));
    const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    const index: CacheIndex[] = indexStr ? JSON.parse(indexStr) : [];
    const cacheSize = await getCacheSize();

    return {
      totalPuzzles: allImages.length,
      totalCategories: categories.size,
      cachedImages: index.length,
      cacheSize,
    };
  } catch (error) {
    console.error("Failed to get puzzle stats:", error);
    return {
      totalPuzzles: 0,
      totalCategories: 0,
      cachedImages: 0,
      cacheSize: 0,
    };
  }
}
