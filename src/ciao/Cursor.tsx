import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";

// Cursors ported verbatim from myvideo (LAI) so the click interactions read the
// same across both videos.

// ---- macOS pointer ----
// A black arrow with a white outline; scales down on a click press.
export const Cursor: React.FC<{
  x: number;
  y: number;
  press: number;
  opacity?: number;
}> = ({ x, y, press, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${1 - press * 0.2})`,
      filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
      pointerEvents: "none",
      opacity,
    }}
  >
    <svg width="38" height="38" viewBox="0 0 24 24">
      <path
        d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.7 L12 14 L19 14 Z"
        fill="#000000"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ---- Branded "Cursor" pointer (the supplied cursor.svg) ----
// The artwork's pointing tip sits at (CURSOR_TIP_X, CURSOR_TIP_Y) within its
// 200×200 viewBox, so we offset the box to land that tip exactly on (x, y) and
// scale the click-press about the tip.
const CURSOR_VB = 200;
const CURSOR_DISPLAY = 104; // rendered size (content-space px)
const CURSOR_TIP_X = 78;
const CURSOR_TIP_Y = 67;

export const LogoCursor: React.FC<{
  x: number;
  y: number;
  press: number;
  opacity?: number;
}> = ({ x, y, press, opacity = 1 }) => {
  const k = CURSOR_DISPLAY / CURSOR_VB;
  const tipX = CURSOR_TIP_X * k;
  const tipY = CURSOR_TIP_Y * k;
  return (
    <div
      style={{
        position: "absolute",
        left: x - tipX,
        top: y - tipY,
        width: CURSOR_DISPLAY,
        height: CURSOR_DISPLAY,
        transformOrigin: `${tipX}px ${tipY}px`,
        transform: `scale(${1 - press * 0.16})`,
        pointerEvents: "none",
        opacity,
      }}
    >
      <Img
        src={staticFile("cursor.svg")}
        style={{
          width: CURSOR_DISPLAY,
          height: CURSOR_DISPLAY,
          display: "block",
        }}
      />
    </div>
  );
};

// ---- Animated pointing-hand → thumbs-up cursor ----
// Reproduces the supplied reference GIF: the pointing hand winds up with a
// little clockwise rotation, rolls through a half-closed pose, then lands as a
// thumbs-up that bounces to full size. The three artworks come from the same
// line-art set and are registered to a common on-screen anchor by their path
// bounding-box centres (in SVG user units) so the hand morphs *in place*
// instead of jumping between their differing viewBoxes. All three are drawn at
// the same unit scale (stroke-width 0.75), so a shared px-per-unit keeps the
// outline weight identical across the swap.
const HAND_K = 3.4; // px per SVG user-unit, shared by all three frames

type HandArt = { src: string; w: number; h: number; cx: number; cy: number };
const HAND_POINT: HandArt = {
  src: "pointinghand.svg",
  w: 16,
  h: 17,
  cx: 7.57,
  cy: 8.08,
};
const HAND_ROLL: HandArt = {
  src: "closedhand-3.svg",
  w: 21,
  h: 21,
  cx: 10.74,
  cy: 10.3,
};
const HAND_THUMB: HandArt = {
  src: "closedhand-2.svg",
  w: 13,
  h: 17,
  cx: 6.39,
  cy: 9.08,
};

const HandFrame: React.FC<{
  art: HandArt;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
}> = ({ art, x, y, rotate, scale, opacity }) => {
  if (opacity <= 0) return null;
  const ox = art.cx * HAND_K;
  const oy = art.cy * HAND_K;
  return (
    <div
      style={{
        position: "absolute",
        left: x - ox,
        top: y - oy,
        width: art.w * HAND_K,
        height: art.h * HAND_K,
        transformOrigin: `${ox}px ${oy}px`,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
        pointerEvents: "none",
        opacity,
      }}
    >
      <Img
        src={staticFile(art.src)}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};

const clampBoth = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// ---- Plain pointing-hand cursor (no morph) ----
// Just the pointing hand from the same line-art set, with the shared click dip.
// Used where a tap should read as a simple selection rather than the
// pointing-hand → thumbs-up celebration that <MorphCursor/> plays.
export const PointerHandCursor: React.FC<{
  x: number;
  y: number;
  press: number;
  opacity?: number;
}> = ({ x, y, press, opacity = 1 }) => (
  <HandFrame
    art={HAND_POINT}
    x={x}
    y={y}
    rotate={0}
    scale={1 - press * 0.16}
    opacity={opacity}
  />
);

export const MorphCursor: React.FC<{
  x: number;
  y: number;
  g: number; // author frames relative to the click (negative = before it)
  press: number;
  opacity?: number;
}> = ({ x, y, g, press, opacity = 1 }) => {
  // shared click dip
  const pressScale = 1 - press * 0.16;

  // pointing hand: tilts clockwise as it winds up into the press, then keeps
  // winding through the hand-off so it never sits still before it fades
  const pointRot = interpolate(g, [-7, 0, 5], [-16, 0, 24], clampBoth);
  const pointOp = 1 - interpolate(g, [3, 5], [0, 1], clampBoth);

  // brief half-closed "roll" frame as the hand rolls over
  const rollOp =
    interpolate(g, [3, 4.5], [0, 1], clampBoth) *
    (1 - interpolate(g, [6.5, 8.5], [0, 1], clampBoth));
  const rollRot = interpolate(g, [4, 8], [16, 0], clampBoth);

  // thumbs-up pops in small and bounces to full size, then settles upright.
  // The whole morph + bounce is stretched out (settling at g≈24 instead of 13)
  // so the gesture reads slowly and clearly rather than snapping into place.
  const thumbOp = interpolate(g, [6.5, 8.5], [0, 1], clampBoth);
  const thumbRot = interpolate(g, [7, 16], [10, 0], clampBoth);
  const thumbScale = interpolate(g, [6.5, 10, 16, 24], [0.55, 1.14, 0.94, 1], {
    ...clampBoth,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <>
      <HandFrame
        art={HAND_POINT}
        x={x}
        y={y}
        rotate={pointRot}
        scale={pressScale}
        opacity={opacity * pointOp}
      />
      <HandFrame
        art={HAND_ROLL}
        x={x}
        y={y}
        rotate={rollRot}
        scale={pressScale}
        opacity={opacity * rollOp}
      />
      <HandFrame
        art={HAND_THUMB}
        x={x}
        y={y}
        rotate={thumbRot}
        scale={pressScale * thumbScale}
        opacity={opacity * thumbOp}
      />
    </>
  );
};
