import React from "react";
import { Img, interpolate, spring, staticFile, useVideoConfig } from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { DotGrid } from "../Background";
import { SurveyWindow, SURVEY_REST_OFFSET } from "../SurveyWindow";
import { ChatBubble } from "../ChatBubble";
import { COLORS, FONTS } from "../theme";
import { useAuthorFrame } from "../timing";

export const INTERLUDE_DURATION = 156;

// Once "Now meet your personality." has finished typing (~frame 85) we hold for
// roughly a second, then the two bubbles part — the left one exits left, the
// right one exits right — clearing the stage for the dashboard, which slides in
// from the right in the following scene.
const BUBBLES_EXIT = 122;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Bridge from the survey (3rd scene) to the dashboard (4th). It opens on the
// SAME settled survey window the survey scene ends on (96 / 53%, violin
// revealed) so the cut is seamless, then slides that whole window off to the
// left with a springy elasticity — echoing the zoom-in/out on the card click —
// to reveal a warm gradient. Two chat bubbles then pop in: the prompt
// "Survey done?" and the reply "Now meet your personality.", which leads into
// the personality dashboard.
export const Interlude: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();
  const { fps } = useVideoConfig();

  // The survey window slides left and off-frame. A spring gives it the same
  // elastic feel as the click zoom; an exit only shows the accelerating launch,
  // so the spring's settle happens safely off-screen.
  const slide = spring({
    frame: frame - 8,
    fps,
    config: { damping: 18, mass: 0.9 },
    durationInFrames: 28,
  });
  const windowX = interpolate(slide, [0, 1], [0, -1820]);

  // Warm gradient blooms in behind the window as it leaves.
  const gradientOpacity = interpolate(frame, [12, 32], [0, 1], clamp);

  // Each bubble pops with a slight overshoot once the window is clear.
  const b1 = spring({
    frame: frame - 34,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 20,
  });
  const b2 = spring({
    frame: frame - 56,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 20,
  });

  // The bubbles part and slide off opposite edges with the same springy
  // elasticity as the survey window's exit.
  const exit = spring({
    frame: frame - BUBBLES_EXIT,
    fps,
    config: { damping: 20, mass: 0.9 },
    durationInFrames: 26,
  });
  const leftExitX = interpolate(exit, [0, 1], [0, -1700]);
  const rightExitX = interpolate(exit, [0, 1], [0, 1700]);

  return (
    <SceneWrapper durationInFrames={durationInFrames} fadeIn={0}>
      {/* warm gradient backdrop (sits behind the sliding window) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: gradientOpacity,
          background:
            "radial-gradient(120% 150% at 50% 118%, rgba(255,170,90,0.35) 30%, rgba(255,140,80,0.12) 64%, transparent 100%), " +
            "linear-gradient(100deg, #ece4ef 0%, #f6a8c6 20%, #fb7d72 42%, #ff8038 60%, #ffc56f 81%, #dee2a2 100%)",
        }}
      />

      {/* connector blob, centred and filling the whole frame, blooming in with
          the gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: gradientOpacity,
        }}
      >
        <Img
          src={staticFile("connector-blob.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${interpolate(gradientOpacity, [0, 1], [0.92, 1])})`,
          }}
        />
      </div>

      {/* keep the dot texture present over the gradient/blob backdrop, which
          otherwise hides the shader's dots — fades in with the gradient */}
      <DotGrid opacity={gradientOpacity} />

      {/* the settled survey window, sliding off to the left */}
      <div
        style={{
          transform: `translateX(${windowX}px) translateY(${SURVEY_REST_OFFSET}px)`,
        }}
      >
        <SurveyWindow
          answered={96}
          pct={53}
          sidebarT={1}
          reflow={1}
          panelReveal={1}
          selectedActive
          pressPulse={1}
        />
      </div>

      {/* chat bubbles — the prompt drops in from the top edge, the reply rises
          from the bottom edge. Their text types in glyph-by-glyph, each
          character born in a bright warm accent (the caret colour) and fading
          to a deep warm resting tone — both pulled from the gradient/blob. */}
      <div style={{ position: "absolute", inset: 0, fontFamily: FONTS.sans }}>
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 64,
            transform: `translateX(${leftExitX}px)`,
          }}
        >
          <ChatBubble
            text="Survey done?"
            tail="top"
            tailX="34%"
            reveal={b1}
            frame={frame}
            typeStart={40}
            framesPerChar={1.1}
            primary={COLORS.ink}
            resting={COLORS.ink}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: 150,
            bottom: 64,
            transform: `translateX(${rightExitX}px)`,
          }}
        >
          <ChatBubble
            text="Now meet your personality."
            tail="bottom"
            tailX="64%"
            reveal={b2}
            frame={frame}
            typeStart={62}
            framesPerChar={1.1}
            primary={COLORS.ink}
            resting={COLORS.ink}
          />
        </div>
      </div>
    </SceneWrapper>
  );
};
