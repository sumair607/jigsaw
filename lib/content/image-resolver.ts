/**
 * Image Resolver
 * Maps puzzle image IDs to bundled local assets.
 */

import { Asset } from "expo-asset";
import type { ImageSourcePropType } from "react-native";

const LOCAL_IMAGE_MODULES: Record<string, number> = {
  img_001: require("@/assets/images/puzzles/nature/nature-00.jpg"),
  img_002: require("@/assets/images/puzzles/nature/nature-01.jpg"),
  img_003: require("@/assets/images/puzzles/nature/nature-02.jpg"),
  img_004: require("@/assets/images/puzzles/cities/cities-00.jpeg"),
  img_005: require("@/assets/images/puzzles/cities/cities-01.jpg"),
  img_006: require("@/assets/images/puzzles/animals/animals-00.jpg"),
  img_007: require("@/assets/images/puzzles/animals/animals-01.jpg"),
  img_008: require("@/assets/images/puzzles/art/art-00.jpg"),
  img_009: require("@/assets/images/puzzles/kids/kids-00.jpg"),
  img_010: require("@/assets/images/puzzles/abstract/abstract-00.jpg"),
  img_011: require("@/assets/images/puzzles/nature/nature-03.jpg"),
  img_012: require("@/assets/images/puzzles/cities/cities-02.jpg"),
  img_013: require("@/assets/images/puzzles/animals/animals-02.jpg"),
  img_014: require("@/assets/images/puzzles/art/art-01.jpg"),
  img_015: require("@/assets/images/puzzles/kids/kids-01.jpg"),
  img_016: require("@/assets/images/puzzles/abstract/abstract-01.jpg"),
  img_017: require("@/assets/images/puzzles/nature/nature-04.jpg"),
  img_018: require("@/assets/images/puzzles/cities/cities-03.jpg"),
  img_019: require("@/assets/images/puzzles/animals/animals-03.jpg"),
  img_020: require("@/assets/images/puzzles/art/art-02.jpg"),
};
const FALLBACK_IMAGE_MODULE = require("@/assets/images/puzzles/nature/nature-00.jpg");

const LOCAL_CATEGORY_POOLS: Record<string, number[]> = {
  nature: [
    require("@/assets/images/puzzles/nature/nature-00.jpg"),
    require("@/assets/images/puzzles/nature/nature-01.jpg"),
    require("@/assets/images/puzzles/nature/nature-02.jpg"),
    require("@/assets/images/puzzles/nature/nature-03.jpg"),
    require("@/assets/images/puzzles/nature/nature-04.jpg"),
    require("@/assets/images/puzzles/nature/nature-05.jpg"),
    require("@/assets/images/puzzles/nature/nature-06.jpg"),
    require("@/assets/images/puzzles/nature/nature-07.jpg"),
    require("@/assets/images/puzzles/nature/nature-08.jpg"),
    require("@/assets/images/puzzles/nature/nature-09.jpg"),
  ],
  cities: [
    require("@/assets/images/puzzles/cities/cities-00.jpeg"),
    require("@/assets/images/puzzles/cities/cities-01.jpg"),
    require("@/assets/images/puzzles/cities/cities-02.jpg"),
    require("@/assets/images/puzzles/cities/cities-03.jpg"),
    require("@/assets/images/puzzles/cities/cities-04.jpg"),
    require("@/assets/images/puzzles/cities/cities-05.jpg"),
    require("@/assets/images/puzzles/cities/cities-06.jpg"),
    require("@/assets/images/puzzles/cities/cities-07.jpg"),
    require("@/assets/images/puzzles/cities/cities-08.jpg"),
    require("@/assets/images/puzzles/cities/cities-09.jpg"),
  ],
  animals: [
    require("@/assets/images/puzzles/animals/animals-00.jpg"),
    require("@/assets/images/puzzles/animals/animals-01.jpg"),
    require("@/assets/images/puzzles/animals/animals-02.jpg"),
    require("@/assets/images/puzzles/animals/animals-03.jpg"),
    require("@/assets/images/puzzles/animals/animals-04.jpg"),
    require("@/assets/images/puzzles/animals/animals-05.jpg"),
    require("@/assets/images/puzzles/animals/animals-06.jpg"),
    require("@/assets/images/puzzles/animals/animals-07.jpg"),
    require("@/assets/images/puzzles/animals/animals-08.jpg"),
    require("@/assets/images/puzzles/animals/animals-09.jpg"),
  ],
  art: [
    require("@/assets/images/puzzles/art/art-00.jpg"),
    require("@/assets/images/puzzles/art/art-01.jpg"),
    require("@/assets/images/puzzles/art/art-02.jpg"),
    require("@/assets/images/puzzles/art/art-03.jpg"),
    require("@/assets/images/puzzles/art/art-04.jpg"),
    require("@/assets/images/puzzles/art/art-05.jpg"),
    require("@/assets/images/puzzles/art/art-06.jpg"),
    require("@/assets/images/puzzles/art/art-07.jpg"),
    require("@/assets/images/puzzles/art/art-08.jpg"),
    require("@/assets/images/puzzles/art/art-09.jpg"),
  ],
  kids: [
    require("@/assets/images/puzzles/kids/kids-00.jpg"),
    require("@/assets/images/puzzles/kids/kids-01.jpg"),
    require("@/assets/images/puzzles/kids/kids-02.jpg"),
    require("@/assets/images/puzzles/kids/kids-03.jpg"),
    require("@/assets/images/puzzles/kids/kids-04.jpg"),
    require("@/assets/images/puzzles/kids/kids-05.jpg"),
    require("@/assets/images/puzzles/kids/kids-06.jpg"),
    require("@/assets/images/puzzles/kids/kids-07.jpg"),
    require("@/assets/images/puzzles/kids/kids-08.jpg"),
    require("@/assets/images/puzzles/kids/kids-09.jpg"),
  ],
  abstract: [
    require("@/assets/images/puzzles/abstract/abstract-00.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-01.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-02.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-03.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-04.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-05.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-06.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-07.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-08.jpg"),
    require("@/assets/images/puzzles/abstract/abstract-09.jpg"),
  ],
};

function moduleToUri(moduleId: number): string {
  return Asset.fromModule(moduleId).uri;
}

export function resolveImageSource(imageId: string): ImageSourcePropType {
  return LOCAL_IMAGE_MODULES[imageId] ?? FALLBACK_IMAGE_MODULE;
}

export function resolveCategoryImageSource(
  category: string,
  index: number
): ImageSourcePropType {
  const pool = LOCAL_CATEGORY_POOLS[category] ?? LOCAL_CATEGORY_POOLS.nature;
  const normalizedIndex = ((index % pool.length) + pool.length) % pool.length;
  return pool[normalizedIndex] ?? FALLBACK_IMAGE_MODULE;
}

export function resolveCategoryImageUri(category: string, index: number): string {
  const moduleId = resolveCategoryImageSource(category, index) as number;
  return moduleToUri(moduleId);
}

/**
 * Resolve image ID to URI.
 * Returns a local bundled URI when available.
 */
export function resolveImageUri(imageId: string): string {
  const moduleId = LOCAL_IMAGE_MODULES[imageId] ?? FALLBACK_IMAGE_MODULE;
  return moduleToUri(moduleId);
}

/**
 * Resolve thumbnail URI.
 * For local bundled images, thumbnail uses the same file URI.
 */
export function resolveThumbnailUri(imageId: string): string {
  return resolveImageUri(imageId);
}
