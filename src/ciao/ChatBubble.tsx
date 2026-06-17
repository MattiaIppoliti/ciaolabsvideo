import React from "react";
import { interpolate } from "remotion";
import { COLORS } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Glyphs are born in `primary` (also the caret colour) and ease to `resting`
// as they age. Shared by the survey→dashboard and dashboard→chat bridges.
const TYPE_FADE_FRAMES = 4;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const ChatBubble: React.FC<{
  text: string;
  tail: "top" | "bottom";
  tailX: string;
  reveal: number;
  frame: number;
  typeStart: number;
  framesPerChar: number;
  primary: string;
  resting: string;
}> = ({
  text,
  tail,
  tailX,
  reveal,
  frame,
  typeStart,
  framesPerChar,
  primary,
  resting,
}) => {
  const tri = 26; // half-base of the tail triangle
  const depth = 28; // how far the tail pokes out
  // enter from the nearest edge: the top bubble drops down, the bottom rises up
  const slideY = interpolate(reveal, [0, 1], [tail === "top" ? -240 : 240, 0]);

  // how many glyphs have been born so far
  const visibleCount = Math.max(
    0,
    Math.min(text.length, Math.floor((frame - typeStart) / framesPerChar) + 1),
  );
  const typingEnd = typeStart + text.length * framesPerChar;
  // caret rides the trailing edge while typing, then blinks at ~2Hz once idle
  const caretIdle = frame >= typingEnd;
  const caretOpacity =
    frame < typeStart
      ? 0
      : caretIdle
        ? Math.floor((frame / 30) * 2 * 2) % 2 === 0
          ? 1
          : 0
        : 1;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        background: COLORS.white,
        borderRadius: 999,
        padding: "34px 62px",
        fontSize: 62,
        fontWeight: 600,
        color: COLORS.ink,
        whiteSpace: "nowrap",
        boxShadow: "0 30px 70px rgba(40,35,28,0.24)",
        opacity: interpolate(reveal, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${slideY}px) scale(${interpolate(
          reveal,
          [0, 1],
          [0.9, 1],
        )})`,
        transformOrigin: `${tailX} ${tail === "top" ? "top" : "bottom"}`,
      }}
    >
      {/* relative box: a hidden sizer reserves the full pill width so the pill
          never grows mid-type; the typed glyphs + caret overlay it exactly. */}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span aria-hidden style={{ visibility: "hidden", whiteSpace: "nowrap" }}>
          {text}
        </span>
        <span
          style={{
            position: "absolute",
            inset: 0,
            whiteSpace: "nowrap",
          }}
        >
          {text
            .slice(0, visibleCount)
            .split("")
            .map((ch, i) => {
              const age = frame - (typeStart + i * framesPerChar);
              const t = Math.min(1, Math.max(0, age / TYPE_FADE_FRAMES));
              return (
                <span key={i} style={{ color: mixHex(primary, resting, easeOutCubic(t)), whiteSpace: "pre" }}>
                  {ch}
                </span>
              );
            })}
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: "0.78em",
              marginLeft: 6,
              borderRadius: 3,
              background: primary,
              verticalAlign: "-0.08em",
              opacity: caretOpacity,
            }}
          />
        </span>
      </span>
      <div
        style={{
          position: "absolute",
          left: tailX,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: `${tri}px solid transparent`,
          borderRight: `${tri}px solid transparent`,
          ...(tail === "top"
            ? { top: -depth + 2, borderBottom: `${depth}px solid ${COLORS.white}` }
            : {
                bottom: -depth + 2,
                borderTop: `${depth}px solid ${COLORS.white}`,
              }),
        }}
      />
    </div>
  );
};

// ---- colour helpers (per-glyph birth→rest mix) ---------------------------
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const k = clamp01(t);
  const toHex = (n: number) =>
    Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(ar + (br - ar) * k)}${toHex(ag + (bg - ag) * k)}${toHex(ab + (bb - ab) * k)}`;
}
