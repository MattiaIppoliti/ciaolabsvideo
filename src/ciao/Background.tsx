import React from "react";
import { AbsoluteFill } from "remotion";
import { SeaShader } from "./SeaShader";

// A crisp, evenly-spaced dotted grid laid lightly over the shader. The shader
// already carries a soft baked-in dot pattern, but it drifts and fades with the
// clouds; this overlay adds a steady, subtle grid across the whole frame at low
// opacity so the texture reads consistently behind every scene.
const DOT_SIZE = 26; // px between dots in the 1920x1080 frame
const DOT_BASE_OPACITY = 0.55;
const DOT_OVERLAY: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(0,0,0,0.22) 1.6px, transparent 2.2px)",
  backgroundSize: `${DOT_SIZE}px ${DOT_SIZE}px`,
  opacity: DOT_BASE_OPACITY,
};

// The same dotted grid as a standalone, full-frame layer. Scenes that paint
// their own opaque backdrop over the shader (the interlude gradient/blob, the
// chat sign-off orb) drop this on top so the dot texture stays present in every
// frame — even where the serendipity shader is hidden. `opacity` scales the
// whole grid so it can fade in alongside the backdrop it sits over.
export const DotGrid: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill
    aria-hidden="true"
    style={{ ...DOT_OVERLAY, opacity: DOT_BASE_OPACITY * opacity }}
  />
);

// OUTER shell level: the platform.ciaobang.com ambient backdrop — the live
// `serendipity-ogl` WebGL shader (the slow-moving "sea" of soft clouds + dotted
// grid). This layer lives behind EVERY scene for the whole video (it sits
// outside the <Series>, so it never unmounts): the laptop in <IntroLaptop/> and
// the homepage in <Hero/> composite <HomeScreen/> on top of this same sea, and
// the survey/dashboard/chat cards sit centred over it.
export const Background: React.FC = () => {
  return (
    <AbsoluteFill>
      <SeaShader />
      <AbsoluteFill aria-hidden="true" style={DOT_OVERLAY} />
    </AbsoluteFill>
  );
};
