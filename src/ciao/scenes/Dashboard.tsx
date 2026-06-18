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
import { BrowserFrame } from "../BrowserFrame";
import { Cursor } from "../Cursor";
import { COLORS, FONTS, SCORES, TOP_TRAITS } from "../theme";
import { useAuthorFrame } from "../timing";

// 172 (not 180): once the window has launched off to the left and the cream
// backdrop is fully up (~frame 168), the scene was holding on flat cream for
// ~12 dead frames before the cut. Ending at 172 hands straight to the chat
// bridge the moment the stage is clear, so the cream never lingers.
export const DASHBOARD_DURATION = 172;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Hover narrative for the top trait (Fantasy): the macOS pointer glides in,
// settles on the bar and a trait-detail card reveals above it.
const TRAIT_TIP = {
  tag: "NEO",
  description:
    "Tendency to have an active imagination and capacity for creativity.",
  percentile: 95,
} as const;
const HOVER_X_PCT = 56; // where along the bar the pointer settles
const BAR_CENTER_Y = 60; // label block (~36px) + half of the 48px bar
const CLICK = 122; // beat the pointer lands + clicks the Fantasy bar
const C_FADE = [96, 108] as const; // pointer fades in
const C_GLIDE = [98, 122] as const; // pointer glides to the bar
const BAR_HOVER = [112, 124] as const; // bar lifts + glows under the pointer
const TIP_REVEAL = [122, 138] as const; // tooltip pops above the bar

// Browser window size for this scene. Tall enough that all three top-trait bars
// (Fantasy / Empathy / Assertiveness) clear the frame instead of being clipped
// to just the first row.
const WIN_W = 1480;
const WIN_H = 1000;

// Screenshot 3: "Your scores" with 3 half-gauges (Openness/Conscientiousness/
// Extraversion), HIGHEST/LOWEST toggle and Top Traits bars (NEO tab).
export const Dashboard: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();
  const { fps } = useVideoConfig();

  // --- camera fly-over onto the Fantasy bar (same treatment as the survey
  // click): hold on the full dashboard, push in onto the top trait as the
  // pointer clicks it, hold a beat while the detail card reveals, then ease back
  // out to rest. The push-in (22f) and pull-out (16f) are deliberately gentle so
  // neither move feels abrupt; the push-in still lands exactly on the click, and
  // the pull-out tails just past the window's launch so it settles as the window
  // is already accelerating off — an imperceptible overlap. Focus (FX, FY) is a
  // window-space point; the translate puts it dead-centre at zoom Z while RX/RY
  // bank the window under <perspective>.
  const WIN_CX = WIN_W / 2;
  const WIN_CY = WIN_H / 2;
  const FOCUS = { x: 800, y: 675 }; // Fantasy bar centre in window space
  const CAM_FRAMES = [0, 100, CLICK, CLICK + 16, CLICK + 32, durationInFrames];
  const CAM_FX = [WIN_CX, WIN_CX, FOCUS.x, FOCUS.x, WIN_CX, WIN_CX];
  const CAM_FY = [WIN_CY, WIN_CY, FOCUS.y, FOCUS.y, WIN_CY, WIN_CY];
  const CAM_Z = [1, 1, 1.45, 1.45, 1, 1];
  const CAM_RX = [0, 0, 3, 3, 0, 0];
  const CAM_RY = [0, 0, -4, -4, 0, 0];
  const camEase = { ...clamp, easing: Easing.inOut(Easing.cubic) } as const;
  const camFx = interpolate(frame, CAM_FRAMES, CAM_FX, camEase);
  const camFy = interpolate(frame, CAM_FRAMES, CAM_FY, camEase);
  const camZ = interpolate(frame, CAM_FRAMES, CAM_Z, camEase);
  const camRx = interpolate(frame, CAM_FRAMES, CAM_RX, camEase);
  const camRy = interpolate(frame, CAM_FRAMES, CAM_RY, camEase);
  const cameraTransform =
    `rotateX(${camRx}deg) rotateY(${camRy}deg) scale(${camZ}) ` +
    `translate(${-(camFx - WIN_CX)}px, ${-(camFy - WIN_CY)}px)`;

  // Entrance: the whole dashboard window slides in from the right toward centre,
  // picking up where the interlude's bubbles parted and left the stage clear.
  const entranceX = interpolate(frame, [0, 20], [1700, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Exit: once the camera has settled back to rest, the whole window launches
  // off to the left with the same springy elasticity as the survey window's
  // exit in the interlude — an exit only shows the accelerating launch, so the
  // spring's settle happens safely off-screen, handing over to the chat bridge.
  const exit = spring({
    frame: frame - (CLICK + 28),
    fps,
    config: { damping: 18, mass: 0.9 },
    durationInFrames: 28,
  });
  const exitX = interpolate(exit, [0, 1], [0, -1980]);

  // A cream backdrop fades in just before the window launches, so the window
  // slides off over cream rather than the cool cloud background.
  const creamReveal = interpolate(frame, [CLICK + 22, CLICK + 34], [0, 1], clamp);

  // ...but the cream is only a brief intermediate: the instant the window starts
  // leaving, the backdrop already begins warming into the chat bridge's
  // surveys-sun pink — fast but gradual — so the colour is sweeping into the
  // next sequence as the dashboard clears, instead of dwelling on flat cream.
  // The sun is pixel-matched to <ChatBridge/> (same image, fit and settled
  // scale) and finishes blooming exactly at the cut, so the handover is seamless.
  const warm = interpolate(frame, [CLICK + 28, durationInFrames], [0, 1], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const sunScale = interpolate(warm, [0, 1], [0.94, 1]);

  return (
    <SceneWrapper
      durationInFrames={durationInFrames}
      fadeIn={0}
      fadeOut={0}
      style={{ perspective: 2000 }}
    >
      {/* cream backdrop revealed as the window launches off to the left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLORS.cream,
          opacity: creamReveal,
          pointerEvents: "none",
        }}
      />
      {/* the warm surveys-sun backdrop sweeps in over the cream as the window
          leaves, so the colour is already changing into the next sequence —
          pixel-matched to <ChatBridge/> for a seamless cut */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: warm,
          pointerEvents: "none",
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
            transform: `scale(${sunScale})`,
          }}
        />
      </div>
      {/* keep the dot texture present over the warming backdrop, matching the
          bridge that picks up from here */}
      <DotGrid opacity={warm} />
      <div style={{ transform: `translateX(${entranceX + exitX}px)` }}>
        <div style={{ width: WIN_W, height: WIN_H, transform: cameraTransform }}>
        <BrowserFrame
          url="platform.ciaobang.com/surveys/personality/dashboard"
          width={WIN_W}
          height={WIN_H}
        >
        <div
          style={{
            padding: 28,
            background: COLORS.cream,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            fontFamily: FONTS.sans,
            color: COLORS.ink,
          }}
        >
          {/* scores card */}
          <div
            style={{
              borderRadius: 20,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.white,
              padding: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: 1.6,
                    color: COLORS.muted,
                    fontWeight: 600,
                  }}
                >
                  PERSONALITY DASHBOARD
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    letterSpacing: -0.6,
                    marginTop: 6,
                  }}
                >
                  Your scores
                </div>
              </div>
              <Tabs items={["HIGHEST", "LOWEST"]} active={0} />
            </div>

            <div
              style={{
                marginTop: 26,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
              }}
            >
              {SCORES.map((s, i) => (
                <Gauge
                  key={s.trait}
                  value={s.value}
                  band={s.band}
                  trait={s.trait}
                  color={s.color}
                  enterAt={10 + i * 12}
                  frame={frame}
                />
              ))}
            </div>
          </div>

          {/* top traits */}
          <div
            style={{
              flex: 1,
              borderRadius: 20,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.white,
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: 1.6,
                  color: COLORS.muted,
                  fontWeight: 600,
                }}
              >
                TOP TRAITS
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <Tabs items={["NEO", "HEXACO", "MPQ"]} active={0} />
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: 1.6,
                    color: COLORS.muted,
                    fontWeight: 600,
                  }}
                >
                  SCORE
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {TOP_TRAITS.map((t, i) => (
                <TraitBar
                  key={t.trait}
                  trait={t.trait}
                  value={t.value}
                  color={t.color}
                  enterAt={60 + i * 14}
                  frame={frame}
                  tip={i === 0 ? TRAIT_TIP : undefined}
                />
              ))}
            </div>
          </div>
        </div>
        </BrowserFrame>
        </div>
      </div>
    </SceneWrapper>
  );
};

const Tabs: React.FC<{ items: readonly string[]; active: number }> = ({
  items,
  active,
}) => (
  <div
    style={{
      display: "flex",
      background: COLORS.oatLight,
      borderRadius: 999,
      padding: 4,
    }}
  >
    {items.map((label, i) => (
      <span
        key={label}
        style={{
          background: i === active ? COLORS.ink : "transparent",
          color: i === active ? COLORS.white : COLORS.inkSoft,
          borderRadius: 999,
          padding: "8px 18px",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1.2,
        }}
      >
        {label}
      </span>
    ))}
  </div>
);

const Gauge: React.FC<{
  value: number;
  band: string;
  trait: string;
  color: string;
  enterAt: number;
  frame: number;
}> = ({ value, band, trait, color, enterAt, frame }) => {
  const progress = interpolate(frame, [enterAt, enterAt + 28], [0, value / 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const size = 240;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = Math.PI * r;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <svg
        width={size}
        height={size * 0.62}
        viewBox={`0 0 ${size} ${size * 0.62}`}
      >
        {/* track */}
        <path
          d={arcPath(size / 2, size / 2, r, Math.PI, 2 * Math.PI)}
          fill="none"
          stroke={COLORS.oatLight}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* progress */}
        <path
          d={arcPath(size / 2, size / 2, r, Math.PI, 2 * Math.PI)}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
        {/* ticks */}
        {[0, 10, 20, 30, 40, 50].map((n) => {
          const ang = Math.PI + (n / 50) * Math.PI;
          const x = size / 2 + Math.cos(ang) * (r + 24);
          const y = size / 2 + Math.sin(ang) * (r + 24);
          return (
            <text
              key={n}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={14}
              fill={COLORS.muted}
              fontFamily="UncutSans"
            >
              {n}
            </text>
          );
        })}
        {/* needle dot */}
        <circle
          cx={
            size / 2 + Math.cos(Math.PI + (value / 50) * Math.PI) * r
          }
          cy={
            size / 2 + Math.sin(Math.PI + (value / 50) * Math.PI) * r
          }
          r={9}
          fill={COLORS.muted}
        />
      </svg>
      <div
        style={{
          marginTop: -10,
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        {Math.round(progress * 50)}
      </div>
      <div style={{ fontSize: 16, color: COLORS.inkSoft, marginTop: 2 }}>
        {band}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        {trait}
      </div>
      <div
        style={{
          fontSize: 13,
          color: COLORS.muted,
          marginTop: 2,
        }}
      >
        Majority of people (IQR)
      </div>
    </div>
  );
};

// Build an SVG arc path between angles (radians) from cx/cy with radius r.
const arcPath = (
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
) => {
  const x0 = cx + Math.cos(a0) * r;
  const y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a1) * r;
  const y1 = cy + Math.sin(a1) * r;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

const TraitBar: React.FC<{
  trait: string;
  value: number;
  color: string;
  enterAt: number;
  frame: number;
  tip?: { tag: string; description: string; percentile: number };
}> = ({ trait, value, color, enterAt, frame, tip }) => {
  const fill = interpolate(frame, [enterAt, enterAt + 26], [0, value / 50], clamp);

  // --- hover interaction (only the bar that carries a detail card) ----------
  const hover = tip ? interpolate(frame, BAR_HOVER, [0, 1], clamp) : 0;
  const cursorOpacity = interpolate(frame, C_FADE, [0, 1], clamp);
  const glide = interpolate(frame, C_GLIDE, [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  // the macOS pointer drifts in from the lower-right and settles on the bar
  const glideX = interpolate(glide, [0, 1], [150, 0]);
  const glideY = interpolate(glide, [0, 1], [120, 0]);
  const cardReveal = interpolate(frame, TIP_REVEAL, [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  // quick press dip as the pointer taps the bar (drives the camera's push-in)
  const press = tip
    ? interpolate(frame, [CLICK - 4, CLICK, CLICK + 6], [0, 1, 0], clamp)
    : 0;

  return (
    <div
      style={{
        position: "relative",
        // lift the hovered bar (and its overflowing pointer/card) above the
        // sibling rows so nothing clips it
        zIndex: tip ? 5 : undefined,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>
        {trait}
      </div>
      <div
        style={{
          height: 48,
          borderRadius: 14,
          background: COLORS.oatLight,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          position: "relative",
          transform: `translateY(${-3 * hover}px)`,
          boxShadow: hover > 0 ? `0 14px 30px ${color}59` : "none",
        }}
      >
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            // round the leading edge so the bar reads as a soft pill instead of
            // a hard vertical cut
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            filter: hover > 0 ? `brightness(${1 + 0.07 * hover})` : "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: -42,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {Math.round(fill * 50)}
        </span>
      </div>

      {tip && (
        <div
          style={{
            position: "absolute",
            left: `${HOVER_X_PCT}%`,
            top: BAR_CENTER_Y,
            width: 0,
            height: 0,
          }}
        >
          {/* trait-detail card floating above the bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 26,
              width: 360,
              textAlign: "left",
              transformOrigin: "bottom center",
              transform: `translate(-50%, ${(1 - cardReveal) * 14}px) scale(${
                0.92 + cardReveal * 0.08
              })`,
              opacity: cardReveal,
              background: COLORS.white,
              borderRadius: 22,
              border: `1px solid ${COLORS.line}`,
              boxShadow: "0 30px 70px rgba(0,0,0,0.22)",
              padding: "26px 28px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: 1.6,
                color: COLORS.muted,
                fontWeight: 700,
              }}
            >
              {tip.tag}
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: -0.6,
                marginTop: 6,
              }}
            >
              {trait}
            </div>
            <div
              style={{
                fontSize: 18,
                color: COLORS.inkSoft,
                marginTop: 10,
                lineHeight: 1.35,
              }}
            >
              {tip.description}
            </div>
            <div style={{ fontSize: 16, color: COLORS.muted, marginTop: 18 }}>
              Your score:{" "}
              <span style={{ color: COLORS.ink, fontWeight: 700 }}>
                {value}/50
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>
              Higher than {tip.percentile}% of people
            </div>
          </div>

          {/* macOS pointer hovering on the bar (tip lands on the anchor) */}
          <Cursor x={glideX} y={glideY} press={press} opacity={cursorOpacity} />
        </div>
      )}
    </div>
  );
};
