# Jigsaw Puzzle Pro - Architecture Overview

This document provides a detailed technical overview of the Jigsaw Puzzle Pro game architecture, design patterns, and system interactions.

## System Architecture

### High-Level Overview

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Layer (Screens)              │
│  (Home, Achievements, Settings, Game)   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Component Layer                    │
│  (PuzzleCanvas, PuzzlePiece, Cards)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Business Logic Layer               │
│  (Game Engine, Content Manager)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Data Layer                         │
│  (Storage Manager, Content Manager)     │
└─────────────────────────────────────────┘
```

## Core Systems

### 1. Game Engine (`lib/game-engine/`)

The game engine handles all puzzle logic and state management.

**Components:**
- **types.ts**: Core type definitions (Puzzle, Piece, GameState)
- **puzzle-logic.ts**: Game state reducer and logic
- **image-slicer.ts**: Image to puzzle piece conversion
- **collision-detection.ts**: Snapping and collision logic

**Key Concepts:**

**Puzzle State**
```typescript
interface PuzzleState {
  id: string;
  pieces: PuzzlePiece[];
  isComplete: boolean;
  moveCount: number;
  hintsUsed: number;
  startTime: number;
  endTime: number | null;
}
```

**Game Actions**
```typescript
type PuzzleAction =
  | { type: "UPDATE_PIECE_POSITION"; payload: { pieceId: string; x: number; y: number } }
  | { type: "SNAP_PIECE"; payload: { pieceId: string } }
  | { type: "USE_HINT"; payload?: undefined }
  | { type: "RESET_PUZZLE"; payload?: undefined }
  // ... more actions
```

**State Reducer Pattern**
```typescript
function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case "UPDATE_PIECE_POSITION":
      // Update piece position and move count
      return { ...state, pieces: updatedPieces, moveCount: state.moveCount + 1 };
    case "SNAP_PIECE":
      // Check snapping conditions and snap if valid
      return { ...state, pieces: snappedPieces, isComplete };
    // ... more cases
  }
}
```

### 2. Image Slicing System

Converts images into puzzle pieces with proper grid alignment.

**Process:**
1. Load image and get dimensions
2. Normalize image to square canvas (1024×1024px)
3. Calculate piece size based on grid (rows × cols)
4. Generate piece metadata with source rectangles
5. Shuffle pieces for random initial positions

**Piece Generation**
```typescript
for (let row = 0; row < gridSize.rows; row++) {
  for (let col = 0; col < gridSize.cols; col++) {
    const piece: PuzzlePiece = {
      id: `piece_${row}_${col}`,
      gridX: col,
      gridY: row,
      sourceRect: {
        x: col * pieceSize,
        y: row * pieceSize,
        width: pieceSize,
        height: pieceSize,
      },
      currentPosition: randomPosition(),
      targetPosition: { x: col * pieceSize, y: row * pieceSize },
      isSnapped: false,
    };
  }
}
```

### 3. Collision Detection & Snapping

Implements smart snapping with configurable radius based on difficulty.

**Snapping Algorithm**
```typescript
function checkSnapping(piece: PuzzlePiece, allPieces: PuzzlePiece[], radius: number) {
  const distToTarget = distance(piece.currentPosition, piece.targetPosition);
  
  if (distToTarget <= radius) {
    // Check if adjacent pieces are snapped
    const adjacentPieces = getAdjacentPieces(piece, allPieces);
    const allAdjacentSnapped = adjacentPieces.every(p => p.isSnapped);
    
    if (allAdjacentSnapped || isEdgePiece(piece)) {
      return { isSnapped: true, snapDistance: distToTarget };
    }
  }
  
  return { isSnapped: false, snapDistance: distToTarget };
}
```

**Snapping Radius by Difficulty**

| Difficulty | Radius | Rationale |
|-----------|--------|-----------|
| 2×2 | 40px | Easy, forgiving snapping |
| 3×3 | 35px | Slightly more challenging |
| 4×4 | 30px | Moderate difficulty |
| 6×6 | 25px | Expert level |
| 8×8 | 20px | Master level, precise |

### 4. Storage System (`lib/storage/`)

Manages all persistent data using AsyncStorage.

**Storage Keys**
```typescript
const STORAGE_KEYS = {
  GAME_SETTINGS: "jigsaw_game_settings",
  PUZZLE_PROGRESS: "jigsaw_puzzle_progress",
  USER_STATS: "jigsaw_user_stats",
  DAILY_CHALLENGE: "jigsaw_daily_challenge",
  ACHIEVEMENTS: "jigsaw_achievements",
};
```

**Data Persistence Flow**
```
User Action
    ↓
Update State
    ↓
Dispatch Action
    ↓
Reducer Updates State
    ↓
Save to AsyncStorage
    ↓
Persist to Device
```

### 5. Achievement System (`lib/achievements/`)

Tracks and unlocks achievement badges.

**Achievement Types**
- **One-Time**: Unlock once (e.g., "First Puzzle")
- **Progressive**: Track progress (e.g., "Complete 50 Puzzles")

**Achievement Unlock Logic**
```typescript
function checkAchievementUnlock(achievementId: string, stats: UserStats) {
  switch (achievementId) {
    case "first_puzzle":
      return stats.totalPuzzlesCompleted >= 1;
    case "speed_demon":
      return lastGameStats.timeSpent < 120; // 2 minutes
    case "perfectionist":
      return lastGameStats.hintsUsed === 0;
    // ... more achievements
  }
}
```

### 6. Content Management (`lib/content/`)

Handles puzzle images, caching, and metadata.

**Content Flow**
```
Load Manifest
    ↓
Get Puzzles by Category
    ↓
Check Cache
    ↓
Download if Not Cached
    ↓
Store in Cache Directory
    ↓
Return Image URI
```

**Cache Management**
- Maximum 20 cached images
- LRU (Least Recently Used) eviction
- 7-day expiration for old images
- Automatic cleanup on app startup

## Component Architecture

### Screen Components

**Home Screen**
- Displays daily challenge
- Shows puzzle categories
- Displays user statistics
- Navigation entry point

**Achievements Screen**
- Shows unlocked badges
- Displays progress for in-progress achievements
- Shows statistics (streaks, total completed)
- Achievement filtering by category

**Settings Screen**
- Game preferences (sound, haptics, rotation)
- Data management (cache, export, delete)
- About and support links

**Puzzle Play Screen**
- Main game canvas
- Piece rendering and interaction
- Timer and move counter
- Pause menu and controls

### Game Components

**PuzzleCanvas**
- Renders all puzzle pieces
- Manages game state
- Handles piece interactions
- Displays UI overlays

**PuzzlePiece**
- Individual piece component
- Drag and drop handling
- Rotation support
- Visual feedback (snapped, selected, hint)

## Data Flow

### Game Initialization

```
1. User selects puzzle
   ↓
2. Load puzzle metadata
   ↓
3. Get or download image
   ↓
4. Slice image into pieces
   ↓
5. Initialize game state
   ↓
6. Render puzzle canvas
   ↓
7. Start timer
```

### Piece Interaction

```
1. User drags piece
   ↓
2. Update piece position
   ↓
3. Check for collisions
   ↓
4. Render updated piece
   ↓
5. On release:
   - Check snapping conditions
   - Snap if valid
   - Check completion
   - Auto-save progress
```

### Completion Flow

```
1. All pieces snapped
   ↓
2. Calculate statistics (time, moves, rating)
   ↓
3. Update user stats
   ↓
4. Check achievement unlocks
   ↓
5. Update streak
   ↓
6. Show completion screen
   ↓
7. Save progress
```

## State Management

### Global State Hierarchy

```
App Root
├── ThemeProvider (dark/light mode)
├── Game State (current puzzle)
│   ├── Pieces
│   ├── Timer
│   ├── Move Count
│   └── Hints Used
├── User Stats
│   ├── Total Completed
│   ├── Current Streak
│   └── Achievements
└── Settings
    ├── Sound Enabled
    ├── Haptics Enabled
    └── Rotation Enabled
```

### State Update Pattern

```typescript
// 1. Define action
const action = {
  type: "UPDATE_PIECE_POSITION",
  payload: { pieceId: "piece_0_0", x: 100, y: 150 }
};

// 2. Dispatch action
dispatch(action);

// 3. Reducer processes action
const newState = puzzleReducer(currentState, action);

// 4. Component re-renders with new state
// 5. Side effects triggered (save, haptics, etc.)
```

## Performance Considerations

### Rendering Optimization

**FlatList for Pieces**
```typescript
<FlatList
  data={pieces}
  renderItem={({ item }) => <PuzzlePiece piece={item} />}
  keyExtractor={(item) => item.id}
  scrollEnabled={false}
  removeClippedSubviews={true}
/>
```

**Component Memoization**
```typescript
export const PuzzlePiece = React.memo(({ piece, ...props }) => {
  // Component only re-renders if piece prop changes
  return <Animated.View>{/* ... */}</Animated.View>;
});
```

### Memory Management

- Unload puzzle data when leaving game screen
- Clear image cache periodically
- Use weak references for large objects
- Implement garbage collection

### Animation Performance

- Use `react-native-reanimated` for 60fps animations
- Batch state updates during dragging
- Reduce animation complexity on low-end devices
- Use `withTiming` instead of `withSpring` for better performance

## Error Handling

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    // Log error
    // Show fallback UI
    // Report to analytics
  }
}
```

### Async Error Handling

```typescript
try {
  const puzzle = await initializePuzzle(payload);
  dispatch({ type: "INIT_PUZZLE", payload: puzzle });
} catch (error) {
  console.error("Failed to initialize puzzle:", error);
  // Show error message to user
  // Fall back to previous state
}
```

## Testing Strategy

### Unit Tests
- Game logic (snapping, collision detection)
- State reducer
- Achievement unlock conditions
- Storage operations

### Integration Tests
- Puzzle initialization
- Piece interactions
- State persistence
- Achievement tracking

### E2E Tests
- Complete game flow
- User interactions
- Navigation
- Data persistence

## Security Considerations

### Data Privacy
- All data stored locally
- No personal information collected
- No user tracking
- Transparent privacy policy

### Code Security
- No hardcoded secrets
- Secure storage for sensitive data
- Input validation
- Error message sanitization

## Deployment

### Build Process
```bash
# Development
pnpm dev

# Production build
pnpm build

# Release to Play Store
eas build --platform android --profile production
```

### Version Management
- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog for each release
- Beta testing before production

## Monitoring & Analytics

### Key Metrics
- Crash rate
- ANR (Application Not Responding) rate
- Session length
- Puzzle completion rate
- User retention

### Error Tracking
- Sentry integration (optional)
- Play Store console monitoring
- Custom analytics

## Future Enhancements

### Scalability
- Implement backend for cloud sync
- Add user authentication
- Implement leaderboards
- Add multiplayer features

### Feature Expansion
- Custom puzzle editor
- Advanced hint system
- Themed puzzle packs
- Limited-time events

---

**Last Updated**: February 2026
**Architecture Version**: 1.0
