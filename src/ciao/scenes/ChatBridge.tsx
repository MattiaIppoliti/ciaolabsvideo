import React from "react";
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useVideoConfig,
} from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { DotGrid } from "../Background";
import { ChatBubble } from "../ChatBubble";
import { COLORS, FONTS } from "../theme";
import { useAuthorFrame } from "../timing";

export const CHAT_BRIDGE_DURATION = 156;

// Once "Ask Ciao! about them." has finished typing we hold for roughly a second,
// then the two bubbles part — the left one exits left, the right one exits right
// — clearing the stage for the chat scene.
const BUBBLES_EXIT = 122;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Bridge from the dashboard (5th scene) to the chat (6th). Same bubble
// choreography as the survey→dashboard <Interlude/>, but over the warm
// surveys-sun backdrop, with the prompt "Got your scores?" and the reply
// "Ask Ciao! about them." leading into the Ask Ciao! chat.
export const ChatBridge: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();
  const { fps } = useVideoConfig();

  // The sun backdrop is opaque from the first frame (so the cool cloud
  // background never shows through), and blooms in with a gentle scale. A cream
  // wash on top — matching the dashboard we cut from — fades away over the first
  // ~1.2s so the colour eases from cream into the warm pink rather than cutting.
  const bgScale = interpolate(frame, [0, 46], [0.92, 1], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const creamWash = interpolate(frame, [0, 38], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Each bubble pops with a slight overshoot.
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

  // The bubbles part and slide off opposite edges with a springy elasticity.
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
      {/* sun backdrop filling the whole frame, biased downward so the blob sits
          lower in the frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile("surveys-sun.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 0%",
            transform: `scale(${bgScale})`,
          }}
        />
      </div>

      {/* cream wash easing the colour in from the cream dashboard */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLORS.cream,
          opacity: creamWash,
          pointerEvents: "none",
        }}
      />

      {/* keep the dot texture present over the opaque sun backdrop, which
          otherwise hides the shader's dots for the whole scene */}
      <DotGrid />

      {/* chat bubbles — the prompt drops in from the top edge, the reply rises
          from the bottom edge, both typing in glyph-by-glyph, then parting. */}
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
            text="Got your scores?"
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
            text="Ask Ciao! about them."
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
