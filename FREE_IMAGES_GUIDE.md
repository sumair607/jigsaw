# Free Images Guide (No Paid Sources)

This project now supports bundled local puzzle images, which is best for reliability and offline play.

## Best Free Sources

- `Pexels` (free commercial use)
- `Unsplash` (free commercial use)
- `Pixabay` (free commercial use)
- `Openverse` (filter by license before download)

Always check each image license page before using it.

## Recommended Workflow

1. Download free images manually from the sources above.
2. Resize/crop to square (prefer `1200x1200`, minimum `800x800`).
3. Compress to JPG (`quality 80-85`) to keep app size smaller.
4. Put files in:
   - `assets/images/puzzles/nature/`
   - `assets/images/puzzles/cities/`
   - `assets/images/puzzles/animals/`
   - `assets/images/puzzles/art/`
   - `assets/images/puzzles/kids/`
   - `assets/images/puzzles/abstract/`
5. Keep filename format: `category-00.jpg`, `category-01.jpg`, etc.
6. Store attribution details in your manifest or credits screen.

## License Safety (Free-Only)

- Prefer images marked for commercial use.
- Avoid logos, trademarks, and recognizable private property when unsure.
- Avoid photos of identifiable people unless model release terms are clear.
- Keep a simple `credits` record:
  - image filename
  - photographer
  - source URL
  - license note/date

## Why Local Is Better For This Game

- Works offline
- Faster loading
- No broken hotlinks
- Stable puzzle experience on poor networks

If you still want online packs later, use local-first + cache + fallback.
