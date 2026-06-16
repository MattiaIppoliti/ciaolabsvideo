import React from "react";
import { interpolate } from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { BrowserFrame } from "../BrowserFrame";
import { Typewriter } from "../Typewriter";
import { WavingIndicator } from "../WavingIndicator";
import { COLORS, FONTS } from "../theme";
import { useAuthorFrame } from "../timing";

export const CHAT_DURATION = 300;

const THREADS = [
  {
    title: "Reflecting on my results",
    when: "TODAY",
    preview: "Looking across your three frameworks…",
    active: true,
  },
  {
    title: "Communication style",
    when: "APR 22",
    preview: "Warmth + low Assertiveness suggests…",
  },
  {
    title: "Stress patterns",
    when: "APR 14",
    preview: "Your low Anxiety doesn't mean…",
  },
  {
    title: "Comparing NEO vs…",
    when: "APR 02",
    preview: "These overlap on Honesty…",
  },
];

const ASSISTANT_REPLY =
  "Looking across your three frameworks, a few patterns stand out clearly:";

const BULLETS = [
  "High Openness paired with low Anxiety — you explore ideas without feeling overwhelmed.",
  "Honesty-Humility (HEXACO) sits in the 90th percentile, reinforcing the same picture from your NEO Empathy score.",
  "Social-facing traits diverge: Warmth is high, Assertiveness is low — you connect easily but rarely lead.",
];

export const Chat: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();

  return (
    <SceneWrapper durationInFrames={durationInFrames} fadeOut={0}>
      <BrowserFrame
        url="platform.ciaobang.com/app"
        width={1480}
        height={880}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            background: COLORS.cream,
            padding: 24,
            gap: 22,
            fontFamily: FONTS.sans,
            color: COLORS.ink,
          }}
        >
          {/* sidebar */}
          <div
            style={{
              width: 320,
              background: COLORS.white,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 20,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>📓 Ask Ciao!</span>
              <span style={{ color: COLORS.muted }}>🔍 ＋</span>
            </div>
            <div
              style={{
                background: COLORS.ink,
                color: COLORS.white,
                borderRadius: 999,
                padding: "14px 18px",
                fontWeight: 700,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              ＋ New chat
            </div>
            <div
              style={{
                background: COLORS.oatLight,
                borderRadius: 12,
                padding: "10px 14px",
                color: COLORS.inkSoft,
                fontSize: 14,
              }}
            >
              🔍  Search your threads…
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 4,
              }}
            >
              {THREADS.map((t, i) => (
                <ThreadRow key={i} {...t} />
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: COLORS.white,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 14,
                padding: "10px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: COLORS.oatLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  M
                </span>
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 700 }}>Marco Rossi</div>
                  <div style={{ color: COLORS.muted, fontSize: 12 }}>
                    Free plan
                  </div>
                </div>
              </div>
              <span style={{ color: COLORS.muted }}>↕</span>
            </div>
          </div>

          {/* conversation */}
          <div
            style={{
              flex: 1,
              background: COLORS.white,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 20,
              padding: 28,
              display: "flex",
              flexDirection: "column",
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
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 14,
                  letterSpacing: 1.6,
                  color: COLORS.muted,
                  fontWeight: 600,
                }}
              >
                CONVERSATION
                <span
                  style={{
                    border: `1.5px solid ${COLORS.ink}`,
                    color: COLORS.ink,
                    borderRadius: 999,
                    padding: "5px 14px",
                    fontSize: 12,
                    letterSpacing: 1.4,
                  }}
                >
                  PERSONALITY + VALUES
                </span>
              </div>
              <Tabs items={["PATTERNS", "VALUES", "STRENGTHS"]} active={0} />
            </div>

            {/* user message */}
            <div
              style={{
                marginTop: 36,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <UserBubble enterAt={6} frame={frame}>
                What patterns stand out in my personality results?
              </UserBubble>
            </div>

            {/* assistant */}
            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.inkSoft,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: interpolate(frame, [30, 44], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                📓 Ask Ciao!
              </div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>
                <Typewriter text={ASSISTANT_REPLY} start={40} cps={42} />
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 6,
                }}
              >
                {BULLETS.map((b, i) => {
                  const start = 110 + i * 24;
                  const op = interpolate(frame, [start, start + 14], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  const ty = interpolate(frame, [start, start + 14], [10, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  const dot = [COLORS.matcha, COLORS.lemon, COLORS.pomegranate][
                    i
                  ];
                  return (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                        opacity: op,
                        transform: `translateY(${ty}px)`,
                        fontSize: 20,
                        color: COLORS.ink,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: dot,
                          marginTop: 12,
                          flexShrink: 0,
                        }}
                      />
                      <span>{b}</span>
                    </li>
                  );
                })}
              </ul>

              {/* reading callout */}
              <div
                style={{
                  marginTop: 12,
                  border: `1.5px dashed ${COLORS.lineStrong}`,
                  borderRadius: 14,
                  padding: "14px 18px",
                  fontSize: 18,
                  color: COLORS.inkSoft,
                  opacity: interpolate(frame, [190, 210], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 1.6,
                    color: COLORS.muted,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  READING
                </div>
                You tend toward thoughtful, principled curiosity. Comfortable in
                depth, less drawn to the spotlight.
              </div>

              {/* Ciao! waving while it composes the next reply */}
              <div
                style={{
                  marginTop: 4,
                  opacity: interpolate(frame, [216, 230], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <WavingIndicator size={40} />
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* composer */}
            <div
              style={{
                marginTop: 18,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 16,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ color: COLORS.muted, fontSize: 18 }}>
                Ask a follow-up about your results…
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 14,
                  color: COLORS.inkSoft,
                }}
              >
                <div style={{ display: "flex", gap: 18 }}>
                  <span>Personality + Values</span>
                  <span>|</span>
                  <span>Claude Sonnet 4.6 ↕</span>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: COLORS.ink,
                    color: COLORS.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  ↑
                </div>
              </div>
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

const ThreadRow: React.FC<{
  title: string;
  when: string;
  preview: string;
  active?: boolean;
}> = ({ title, when, preview, active }) => (
  <div
    style={{
      padding: "10px 12px",
      borderRadius: 12,
      background: active ? "rgba(59,211,253,0.12)" : "transparent",
      border: active ? `1.5px solid ${COLORS.slushie}` : "1.5px solid transparent",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      <span>{title}</span>
      <span style={{ color: COLORS.muted, fontWeight: 600, fontSize: 12 }}>
        {when}
      </span>
    </div>
    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
      {preview}
    </div>
  </div>
);

const UserBubble: React.FC<{
  enterAt: number;
  frame: number;
  children: React.ReactNode;
}> = ({ enterAt, frame, children }) => {
  const op = interpolate(frame, [enterAt, enterAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [enterAt, enterAt + 12], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        background: COLORS.ink,
        color: COLORS.white,
        borderRadius: 18,
        padding: "16px 22px",
        fontSize: 22,
        fontWeight: 600,
        maxWidth: 640,
        opacity: op,
        transform: `translateY(${ty}px)`,
      }}
    >
      {children}
    </div>
  );
};
