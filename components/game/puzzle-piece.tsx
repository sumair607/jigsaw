/**
 * Puzzle Piece Component
 * Renders a single puzzle piece with drag/drop and rotation
 */

import React, { useCallback, useEffect, useMemo } from "react";
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { PuzzlePiece as PuzzlePieceType } from "@/lib/game-engine/types";

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  pieceSize: number;
  canvasSize: number;
  onPieceMove: (pieceId: string, x: number, y: number) => void;
  onPieceSnap: (pieceId: string) => void;
  onPieceLongPress?: (pieceId: string) => void;
  rotationEnabled: boolean;
  isSelected?: boolean;
  showHint?: boolean;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  piece,
  pieceSize,
  canvasSize,
  onPieceMove,
  onPieceSnap,
  onPieceLongPress,
  rotationEnabled,
  isSelected = false,
  showHint = false,
}) => {
  // Animated values for position
  const pan = React.useRef(
    new Animated.ValueXY({
      x: piece.currentPosition.x,
      y: piece.currentPosition.y,
    })
  ).current;

  const rotateValue = React.useRef(new Animated.Value(piece.rotation)).current;

  useEffect(() => {
    pan.setValue({
      x: piece.currentPosition.x,
      y: piece.currentPosition.y,
    });
  }, [pan, piece.currentPosition.x, piece.currentPosition.y]);

  useEffect(() => {
    rotateValue.setValue(piece.rotation);
  }, [piece.rotation, rotateValue]);

  // Pan responder for drag/drop
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !piece.isSnapped,
      onStartShouldSetPanResponderCapture: () => !piece.isSnapped,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        !piece.isSnapped &&
        (Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1),
      onMoveShouldSetPanResponderCapture: () => !piece.isSnapped,
      onPanResponderGrant: () => {
        onPieceLongPress?.(piece.id);
        pan.stopAnimation((value) => {
          pan.setOffset({ x: value.x, y: value.y });
          pan.setValue({ x: 0, y: 0 });
        });
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        pan.stopAnimation((value) => {
          // Clamp position to canvas bounds
          const clampedX = Math.max(0, Math.min(value.x, canvasSize - pieceSize));
          const clampedY = Math.max(0, Math.min(value.y, canvasSize - pieceSize));

          // Update piece position
          onPieceMove(piece.id, clampedX, clampedY);

          // Check for snapping
          onPieceSnap(piece.id);

          // Keep animated value aligned with latest clamped position
          pan.setValue({ x: clampedX, y: clampedY });
        });
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        pan.stopAnimation((value) => {
          pan.setValue({ x: value.x, y: value.y });
        });
      },
    })
  ).current;

  // Animated style
  const animatedStyle = useMemo(
    () => ({
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        {
          rotate: rotateValue.interpolate({
            inputRange: [0, 360],
            outputRange: ["0deg", "360deg"],
          }),
        },
      ],
    }),
    [pan, rotateValue]
  );

  // Handle rotation (two-finger gesture would be implemented here)
  const handleRotate = useCallback(() => {
    if (!rotationEnabled) return;

    const newRotation = (piece.rotation + 90) % 360;
    Animated.timing(rotateValue, {
      toValue: newRotation,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [piece.rotation, rotationEnabled, rotateValue]);

  // Generate a consistent color per piece based on its grid position
  const getHslColor = (gridX: number, gridY: number): string => {
    const hue = ((gridX * 7 + gridY * 13) % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };

  const fallbackColor = useMemo(() => getHslColor(piece.gridX, piece.gridY), [piece.gridX, piece.gridY]);

  return (
    <Animated.View
      pointerEvents={piece.isSnapped ? "none" : "auto"}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={[
        styles.container,
        {
          width: pieceSize,
          height: pieceSize,
          zIndex: piece.zIndex,
        },
        animatedStyle,
      ]}
      {...panResponder.panHandlers}
    >
      {/* Colored background with fallback color */}
      <View
        style={[
          styles.pieceImage,
          {
            width: pieceSize,
            height: pieceSize,
            backgroundColor: fallbackColor,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {/* Image background on top if available */}
        <ImageBackground
          source={{ uri: piece.imageUri }}
          style={[
            styles.pieceImage,
            {
              width: pieceSize,
              height: pieceSize,
            },
          ]}
          imageStyle={{
            left: -piece.sourceRect.x,
            top: -piece.sourceRect.y,
            width: canvasSize,
            height: canvasSize,
            opacity: 1,
          }}
          onError={() => console.warn("⚠️  [PIECE] Image failed to load for piece", piece.id)}
        >
          {/* Selected indicator */}
          {isSelected && (
            <View style={styles.selectedBorder} />
          )}

          {/* Hint indicator */}
          {showHint && (
            <View style={styles.hintGlow} />
          )}

          {/* Piece border */}
          <View
            style={[
              styles.pieceBorder,
              piece.isSnapped ? styles.pieceBorderSnapped : null,
            ]}
          />
        </ImageBackground>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  pieceImage: {
    overflow: "hidden",
    borderRadius: 2,
  },
  pieceBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
  },
  pieceBorderSnapped: {
    borderColor: "transparent",
  },
  selectedBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderRadius: 2,
  },
  hintGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 2,
  },
});
