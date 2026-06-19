import React from "react";
import { Easing, interpolate } from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { PointerHandCursor } from "../Cursor";
import {
  AFTER_COUNT,
  BEFORE_COUNT,
  SURVEY_REST_OFFSET,
  SURVEY_WIN,
  SurveyWindow,
  TOTAL,
} from "../SurveyWindow";
import { useAuthorFrame } from "../timing";

export const SURVEY_DURATION = 128;

// Beat the click lands on. Before it the screen shows the "95 / 52%" progress
// state (the layout <Hero/> hands off on); after it the card 5 press effect
// fires, the counter ticks, row 105 turns green and the violin "RESPONSE
// PATTERN" reveals. The 2×3 grid is already settled at frame 0 — it carries
// over from the Hero zoom rather than popping in, so there is no visible seam.
const CLICK = 36;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SurveyQuestion: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();

  // --- click-driven timeline -------------------------------------------------
  const selected = frame >= CLICK;
  // counter + sidebar flip the instant the answer registers
  const countT = interpolate(frame, [CLICK, CLICK + 6], [0, 1], clamp);
  const answered = Math.round(
    interpolate(countT, [0, 1], [BEFORE_COUNT, AFTER_COUNT]),
  );
  const pct = Math.round((answered / TOTAL) * 100);
  const sidebarT = interpolate(frame, [CLICK, CLICK + 12], [0, 1], clamp);
  // the press lingers in the familiar 2×3 grid while the thumbs-up celebration
  // plays out at full zoom, then — as the camera pulls back — the pane reflows
  // to the compact row + violin
  const reflow = interpolate(frame, [CLICK + 40, CLICK + 56], [0, 1], clamp);
  const panelReveal = interpolate(frame, [CLICK + 48, CLICK + 72], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // gentle "pop" when the answer is committed
  const pressPulse = interpolate(
    frame,
    [CLICK, CLICK + 7, CLICK + 16],
    [1, 1.05, 1],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );

  // --- click cursor + fly-over camera (same treatment as myvideo) -----------
  // Card 5's centre in browser-window coordinates (incl. the 56px chrome bar).
  const CARD5 = { x: 935, y: 700 };
  const WIN_CX = SURVEY_WIN.width / 2; // 740
  const WIN_CY = SURVEY_WIN.height / 2; // 440

  // branded pointer glides in from the lower-right and taps card 5
  const cx = interpolate(frame, [12, 32], [1230, CARD5.x], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const cy = interpolate(frame, [12, 32], [800, CARD5.y], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const press = interpolate(
    frame,
    [CLICK - 4, CLICK, CLICK + 4],
    [0, 1, 0],
    clamp,
  );
  // the pointing hand simply taps card 5 to register the answer (no thumbs-up
  // celebration here — that gesture now lives on the chat "send" tap). It lifts
  // away promptly once the press releases (CLICK+4) so it doesn't sit frozen on
  // the card while the camera holds on the selection.
  const cursorOpacity =
    interpolate(frame, [8, 16], [0, 1], clamp) *
    (1 - interpolate(frame, [CLICK + 6, CLICK + 14], [0, 1], clamp));

  // Virtual 3D camera over the window — same fly-over treatment as myvideo's
  // HowToAccess: holds on the full UI, swoops + zooms hard onto card 5 for the
  // click, holds there through the thumbs-up celebration, then pulls back out as
  // the pane reflows and the violin reveals.
  // Focus (FX, FY) is a window-space point; the translate puts it dead-centre
  // at zoom Z, while RX/RY bank the window in 3D under <perspective>. It opens
  // flat (Z=1, no rotation) so <Hero/>'s gentle zoom lands on this exact frame.
  const CAM_FRAMES = [0, 8, 30, 76, 104, durationInFrames];
  const CAM_FX = [WIN_CX, WIN_CX, CARD5.x, CARD5.x, WIN_CX, WIN_CX];
  const CAM_FY = [WIN_CY, WIN_CY, CARD5.y, CARD5.y, WIN_CY, WIN_CY];
  const CAM_Z = [1, 1.04, 1.68, 1.68, 1, 1];
  const CAM_RX = [0, 1, 4, 4, 0, 0];
  const CAM_RY = [0, 0, -5, -5, 0, 0];
  const camEase = { ...clamp, easing: Easing.inOut(Easing.cubic) } as const;
  const camFx = interpolate(frame, CAM_FRAMES, CAM_FX, camEase);
  const camFy = interpolate(frame, CAM_FRAMES, CAM_FY, camEase);
  const camZ = interpolate(frame, CAM_FRAMES, CAM_Z, camEase);
  const camRx = interpolate(frame, CAM_FRAMES, CAM_RX, camEase);
  const camRy = interpolate(frame, CAM_FRAMES, CAM_RY, camEase);
  // The leading translateY drops the whole window a touch below frame-centre
  // (matching <Hero/> and <Interlude/>); the 3D fly-over rides on top of it.
  const cameraTransform =
    `translateY(${SURVEY_REST_OFFSET}px) ` +
    `rotateX(${camRx}deg) rotateY(${camRy}deg) scale(${camZ}) ` +
    `translate(${-(camFx - WIN_CX)}px, ${-(camFy - WIN_CY)}px)`;

  return (
    <SceneWrapper
      durationInFrames={durationInFrames}
      fadeIn={0}
      fadeOut={0}
      style={{ perspective: 2000 }}
    >
      <div
        style={{
          position: "relative",
          width: SURVEY_WIN.width,
          height: SURVEY_WIN.height,
          transform: cameraTransform,
        }}
      >
        <SurveyWindow
          answered={answered}
          pct={pct}
          sidebarT={sidebarT}
          reflow={reflow}
          panelReveal={panelReveal}
          selectedActive={selected}
          pressPulse={pressPulse}
        />
        <PointerHandCursor
          x={cx}
          y={cy}
          press={press}
          opacity={cursorOpacity}
        />
      </div>
    </SceneWrapper>
  );
};
