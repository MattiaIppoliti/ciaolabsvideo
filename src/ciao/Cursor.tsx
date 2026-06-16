import React from "react";
import { Img, staticFile } from "remotion";

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
