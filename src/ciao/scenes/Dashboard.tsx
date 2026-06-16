import React from "react";
import { Easing, interpolate } from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { BrowserFrame } from "../BrowserFrame";
import { Cursor } from "../Cursor";
import { COLORS, FONTS, SCORES, TOP_TRAITS } from "../theme";
import { useAuthorFrame } from "../timing";

export const DASHBOARD_DURATION = 180;

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
const BAR_CENTER_Y = 64; // label block (~36px) + half of the 56px bar
const C_FADE = [96, 108] as const; // pointer fades in
const C_GLIDE = [98, 122] as const; // pointer glides to the bar
const BAR_HOVER = [112, 124] as const; // bar lifts + glows under the pointer
const TIP_REVEAL = [122, 138] as const; // tooltip pops above the bar

// Screenshot 3: "Your scores" with 3 half-gauges (Openness/Conscientiousness/
// Extraversion), HIGHEST/LOWEST toggle and Top Traits bars (NEO tab).
export const Dashboard: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();

  return (
    <SceneWrapper durationInFrames={durationInFrames}>
      <BrowserFrame
        url="platform.ciaobang.com/surveys/personality/dashboard"
        width={1480}
        height={880}
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
                gap: 22,
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
  const size = 280;
  const stroke = 28;
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
          height: 56,
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
          <Cursor x={glideX} y={glideY} press={0} opacity={cursorOpacity} />
        </div>
      )}
    </div>
  );
};
