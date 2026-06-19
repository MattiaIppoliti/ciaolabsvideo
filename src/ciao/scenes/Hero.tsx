import React from "react";
import {
  AbsoluteFill,
  Easing,
  getRemotionEnvironment,
  interpolate,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { HomeScreen, SURVEY_PREVIEW_TOP } from "../HomeScreen";
import { ShellCard } from "../ShellCard";
import { SurveyWindow, SURVEY_REST_OFFSET } from "../SurveyWindow";
import { tl, useAuthorFrame } from "../timing";
import { INTRO_DURATION, SEA_TRIM } from "./IntroLaptop";

export const HERO_DURATION = 150;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The homepage scene. It shows the same live screen the laptop displays in
// <IntroLaptop/> — the moving-sea shader (background-30s, from the 4s mark)
// playing behind the platform.ciaobang.com page — so the dive out of the laptop
// screen lands here seamlessly.
//
// The PAGE itself never scrolls. Instead, once it has landed, the hero copy
// recedes and ONLY the survey preview — the fake Mac browser card — slides up
// into focus (via HomeScreen's `previewY`). Then, rather than cutting, the scene
// gently zooms in and resolves the homepage into the FULL live survey window
// (the same <SurveyWindow/> that <SurveyQuestion/> opens on). Because Hero ends
// on that window centred at its native size — identical to SurveyQuestion's
// first frame — the boundary cross-fade is invisible: one continuous push from
// the homepage teaser into the live survey, with no stacco between the scenes.
export const Hero: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();

  // Catch the momentum of IntroLaptop's dive: the laptop screen has just grown
  // to roughly fill the frame, so the homepage arrives at ~1:1 and decelerates
  // the last touch to rest. Keeping the start near 1 makes the hand-off read as
  // one continuous push rather than a scale pop.
  const settle = interpolate(frame, [0, 24], [1.06, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // The hero copy lifts + fades so the rising survey card has room to take the
  // stage (the nav stays — it's a landing page). 0 at frame 0 so the open
  // matches the laptop screen at the cut, with no jump.
  const copyT = interpolate(frame, [14, 56], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const copyOpacity = 1 - copyT;
  const headlineY = interpolate(copyT, [0, 1], [0, -120]);

  // The survey preview card (the live <SurveyWindow/>) scrolls up from
  // peeking-at-the-bottom all the way to frame-centre, where it sits at its
  // native 1480×880 — exactly where SurveyQuestion opens it. The page itself
  // does not scroll; only this window rises.
  const previewY = interpolate(
    frame,
    [14, 100],
    [0, -SURVEY_PREVIEW_TOP + 100 + SURVEY_REST_OFFSET],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );

  // Gentle "zoom in leggero": a slight push toward the survey that eases back to
  // rest at scale 1 by the end. It is applied IDENTICALLY to the homepage layer
  // and the standalone survey window so they stay locked together — the window
  // lands at scale 1, dead-centre, on the cloud <Background/>, exactly how
  // SurveyQuestion opens, so the two scenes meet on the same frame with no cut.
  const zoom = interpolate(frame, [40, 112, durationInFrames], [1, 1.05, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  // The homepage chrome (sea + nav + headline + the preview window) fades out as
  // the standalone survey window takes over, so the final frame is the survey on
  // the cloud background rather than on the sea.
  const heroOpacity = 1 - interpolate(frame, [100, 134], [0, 1], clamp);
  const winReveal = interpolate(frame, [104, 134], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Continue the sea exactly where IntroLaptop left it: the intro played
  // SEA_TRIM .. SEA_TRIM + (intro length), so Hero starts one intro further in.
  const seaTrim = SEA_TRIM + tl(INTRO_DURATION);

  return (
    <SceneWrapper durationInFrames={durationInFrames} fadeIn={10} fadeOut={0}>
      {/* homepage + sea layer — rides the gentle push, then fades out to reveal
          the standalone survey window settling in its place */}
      <AbsoluteFill style={{ opacity: heroOpacity }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: "50% 50%",
          }}
        >
          {/* settle — catches IntroLaptop's dive momentum (origin high on the page) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scale(${settle})`,
              transformOrigin: "50% 26%",
            }}
          >
            <OffthreadVideo
              src={staticFile("background-30s.mp4")}
              muted
              trimBefore={seaTrim}
              // A transient seek error while scrubbing the preview must not throw a
              // MediaPlaybackError and crash the player — swallow it (the frame
              // recovers on the next render). Never suppress during an actual render,
              // where a missing frame would silently corrupt the output.
              onError={(e) => {
                if (getRemotionEnvironment().isRendering) {
                  throw e;
                }
                console.warn("Hero backdrop video failed in preview.", e);
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Warm hero-sun card over the sea — the SAME layer the laptop
                screen shows (sea → ShellCard@0.6 → page). Diving out of the
                laptop therefore lands on a pixel-identical stack and the framed
                sun stays put instead of vanishing. It lives inside the
                settle/zoom transforms so it stays locked to the page, and fades
                out with the rest of the homepage chrome via the parent
                `heroOpacity`. (Previously this came from a global <ShellCard/>
                in <CiaoVideo/>, but that sat BEHIND this scene's opaque sea
                video and was never visible.) */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
              <ShellCard />
            </div>
            <HomeScreen
              headlineY={headlineY}
              headlineOpacity={copyOpacity}
              subOpacity={copyOpacity}
              ctaOpacity={copyOpacity}
              previewY={previewY}
            />
          </div>
        </div>
      </AbsoluteFill>

      {/* live survey window — same component, locked to the same gentle push, so
          it sits exactly where the homepage preview was and settles onto
          SurveyQuestion's opening frame. The boundary then cross-fades between
          identical frames (no visible cut). */}
      <div
        style={{
          opacity: winReveal,
          transform: `translateY(${SURVEY_REST_OFFSET}px) scale(${zoom})`,
        }}
      >
        <SurveyWindow />
      </div>
    </SceneWrapper>
  );
};
