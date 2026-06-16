import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { HERO_SUN_LIGHT } from "./heroSunAssets";

// INNER level, ported from platform.ciaobang.com's `.app-shell` + `.hero-sun`:
// a rounded, inset, bordered card holding the warm hero-sun aura. It sits on
// top of the outer shader <Background/> (which shows through in the margin) and
// below the scene content, so the moving "sea" and the warm aura are distinct
// layers rather than superimposed.
const MARGIN = 40;
// The card's top inset is taller than the side/bottom margin so the dotted
// shader from <Background/> shows through as a full-width band at the very top.
// That band is where the nav bar lives — on the live site the nav floats on the
// dotted background, above the app-shell card, not on the opaque card itself.
const TOP_BAND = 120;

// The warm hero-sun aura only belongs on the hero (home) scene. The intro
// laptop scene and the survey/dashboard/chat scenes sit on the bare moving-
// cloud <Background/>. When mounted inside a bounded <Sequence>, pass its
// length as `durationInFrames` plus `fadeIn`/`fadeOut` windows so the aura
// eases in as the home page arrives and dissolves back into the cloud backdrop
// at the hand-off, instead of popping on or cutting hard.
export const ShellCard: React.FC<{
  durationInFrames?: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ durationInFrames, fadeIn = 0, fadeOut = 0 }) => {
  const frame = useCurrentFrame();
  const fadeInOpacity =
    fadeIn > 0
      ? interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const fadeOutOpacity =
    durationInFrames && fadeOut > 0
      ? interpolate(
          frame,
          [durationInFrames - fadeOut, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
  return (
    <AbsoluteFill
      style={{
        opacity,
        paddingTop: TOP_BAND,
        paddingLeft: MARGIN,
        paddingRight: MARGIN,
        paddingBottom: MARGIN,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 32,
          overflow: "hidden",
          background: "#fbfcfa",
          border: "1px solid rgba(218,212,200,0.9)",
          boxShadow:
            "0 30px 90px rgba(40,35,28,0.16), 0 4px 12px rgba(40,35,28,0.06)",
        }}
      >
        {/* hero-sun-light.jpg: warm rim + white centre, top-anchored, faded out
            at the bottom — exactly like .hero-sun::before on the site */}
        <Img
          src={HERO_SUN_LIGHT}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "auto",
            maskImage:
              "linear-gradient(to bottom, black 72%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 72%, transparent 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
