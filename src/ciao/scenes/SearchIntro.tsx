import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { FONTS } from "../theme";
import { useAuthorFrame } from "../timing";

// Natural dimensions of public/searchCiao.svg (its viewBox is 0 0 854 195).
const SVG_W = 854;
const SVG_H = 195;

// Typed URL, using the SAME typing effect as the "Survey done?" bubble
// (<ChatBubble/>): glyphs are revealed one-per-`FRAMES_PER_CHAR`, with a thin
// caret riding the trailing edge while typing, then blinking at ~2Hz once idle.
const URL = "platform.ciaobang.com";
const TYPE_START = 10; // author frame the typing begins
const FRAMES_PER_CHAR = 1.4;

// The search/prompt box opens the film: it sits centred and large, the URL
// types itself into the input line, then — handed off to <IntroLaptop/>, which
// rises from the bottom and opens — it shrinks and slides up out of frame.
export const SEARCH_INTRO_DURATION = 105; // author frames (30fps)

// Author frame the hand-off begins: the box starts shrinking + sliding up while
// the laptop scene rises from the bottom. Kept in sync with LAPTOP_START in
// CiaoVideo, where the laptop <Series> is offset to start at this same frame.
export const SEARCH_EXIT_START = 70;

// Centred + large opening pose; it eases down to a smaller scale as it exits up.
const BIG_SCALE = 1.72;
const SMALL_SCALE = 0.86;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SearchIntro: React.FC<{
  durationInFrames: number;
}> = ({ durationInFrames }) => {
  const frame = useAuthorFrame();

  // Exit: shrink, ride up off the top edge, and dissolve as it goes — "man mano
  // scompare verso l'alto". Begins as the laptop rises in from the bottom.
  const exit = interpolate(
    frame,
    [SEARCH_EXIT_START, SEARCH_EXIT_START + 30],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );
  const scale = interpolate(exit, [0, 1], [BIG_SCALE, SMALL_SCALE]);
  const liftY = interpolate(exit, [0, 1], [0, -980]);
  const exitOpacity = interpolate(exit, [0.35, 1], [1, 0], clamp);

  // glyph-by-glyph reveal + caret, mirroring <ChatBubble/>'s logic.
  const visibleCount = Math.max(
    0,
    Math.min(URL.length, Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR) + 1),
  );
  const typingEnd = TYPE_START + URL.length * FRAMES_PER_CHAR;
  // caret is solid while typing; blinks at ~2Hz before it starts and once idle
  const typing = frame >= TYPE_START && frame < typingEnd;
  const blink = Math.floor((frame / 30) * 2 * 2) % 2 === 0 ? 1 : 0;
  const caretOpacity = typing ? 1 : blink;

  return (
    <SceneWrapper durationInFrames={durationInFrames} fadeIn={0} fadeOut={0}>
      <div
        style={{
          transform: `translateY(${liftY}px) scale(${scale})`,
          opacity: exitOpacity,
          willChange: "transform, opacity",
        }}
      >
        {/* The search unit at its native 854×195, so the typed text can be
            pinned to the SVG's input line in viewBox pixels and scale with it. */}
        <div style={{ position: "relative", width: SVG_W, height: SVG_H }}>
          <Img
            src={staticFile("searchCiao.svg")}
            style={{ display: "block", width: SVG_W, height: SVG_H }}
          />

          {/* Typed URL over the input line. The SVG's baked placeholder text and
              static caret were zeroed out, so this owns the field: a blinking
              caret from the first frame, then "platform.ciaobang.com" types in. */}
          <div
            style={{
              position: "absolute",
              left: 56,
              top: 44,
              height: 21,
              display: "flex",
              alignItems: "center",
              fontFamily: FONTS.sans,
              fontSize: 17,
              lineHeight: 1,
              color: "#F2F2F2",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ whiteSpace: "pre" }}>{URL.slice(0, visibleCount)}</span>
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "0.78em",
                marginLeft: 2,
                borderRadius: 1,
                background: "#F2F2F2",
                verticalAlign: "-0.08em",
                opacity: caretOpacity,
              }}
            />
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
};
