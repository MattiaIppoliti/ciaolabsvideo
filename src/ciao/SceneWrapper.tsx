import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useAuthorFrame } from "./timing";

export const SceneWrapper: React.FC<{
  durationInFrames: number;
  fade?: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ durationInFrames, fade = 14, fadeIn, fadeOut, children, style }) => {
  const frame = useAuthorFrame();
  const inFade = fadeIn ?? fade;
  const out = fadeOut ?? fade;
  const fadeInOpacity =
    inFade <= 0
      ? 1
      : interpolate(frame, [0, inFade], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const fadeOutOpacity =
    out <= 0
      ? 1
      : interpolate(
          frame,
          [durationInFrames - out, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);

  return (
    <AbsoluteFill
      style={{
        opacity,
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
