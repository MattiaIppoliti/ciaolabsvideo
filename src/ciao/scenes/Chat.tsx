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
import { Typewriter } from "../Typewriter";
import { WavingIndicator } from "../WavingIndicator";
import { LogoCursor } from "../Cursor";
import { CiaoLogo as CiaoWordmark } from "../CiaoLogo";
import { COLORS, FONTS } from "../theme";
import { useAuthorFrame } from "../timing";

// +30 author frames (1s @ 30fps) of tail after the pill flips to the Ciao!
// lockup, so the waving sparkle completes its loop before the video ends.
// (Was 464 — trimmed 50 author frames of the static hold that used to sit
// before the outro, see OUTRO_START, so the closing window-drop begins as soon
// as the conversation has settled instead of lingering on a frozen frame.)
export const CHAT_DURATION = 414;

// Closing beat. Once the conversation has fully read out, the whole window
// glides from centre down off the bottom edge — handing the frame to the
// sign-off: the `surveys-sun-blue` orb blooms in behind, and a centred pill
// carrying the platform link rises from below to settle dead-centre over it.
// Begins ~40 author frames after the last reveal (the "Waving…" indicator at
// ~248) — just enough for the conversation to settle, without the extra ~50
// frames of dead hold that used to sit here (was 338).
const OUTRO_START = 288;

// The scene opens by simulating the question being typed into the composer:
// the camera flies down onto the input bar (same 3D treatment as the survey),
// the branded cursor glides in, the question types out with a caret, then the
// cursor taps "send". SEND is the beat the message commits — the conversation
// (user bubble + Ciao!'s reply) reveals relative to it as the camera pulls back.
const SEND = 80;
const TYPE_START = 30;
const QUESTION = "What patterns stand out in my personality results?";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

  const sent = frame >= SEND;

  // --- branded cursor: glides in over the input, then taps "send" -----------
  const cx = interpolate(frame, [20, 46, 62, SEND], [1340, 880, 880, 1388], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const cy = interpolate(frame, [20, 46, 62, SEND], [860, 752, 752, 788], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const press = interpolate(frame, [SEND - 4, SEND, SEND + 6], [0, 1, 0], clamp);
  const cursorOpacity =
    interpolate(frame, [18, 28], [0, 1], clamp) *
    (1 - interpolate(frame, [SEND + 6, SEND + 16], [0, 1], clamp));
  // little press-pop on the send button when the click lands
  const sendPulse = interpolate(
    frame,
    [SEND - 3, SEND + 2, SEND + 12],
    [1, 0.9, 1],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );

  // --- fly-over camera over the window (same treatment as the survey) --------
  // Focus point is the composer at the bottom of the conversation panel. The
  // camera holds on the full UI, swoops + zooms onto the input bar for the
  // typing beat, then pulls back out as the conversation reveals.
  const WIN_CX = 740;
  const WIN_CY = 440;
  const FOCUS = { x: 911, y: 770 };
  const CAM_FRAMES = [0, 14, 36, SEND, SEND + 8, SEND + 32, durationInFrames];
  const CAM_FX = [WIN_CX, WIN_CX, FOCUS.x, FOCUS.x, FOCUS.x, WIN_CX, WIN_CX];
  const CAM_FY = [WIN_CY, WIN_CY, FOCUS.y, FOCUS.y, FOCUS.y, WIN_CY, WIN_CY];
  const CAM_Z = [1, 1.02, 1.5, 1.5, 1.48, 1, 1];
  const CAM_RX = [0, 0, 3, 3, 3, 0, 0];
  const CAM_RY = [0, 0, -4, -4, -4, 0, 0];
  const camEase = { ...clamp, easing: Easing.inOut(Easing.cubic) } as const;
  const camFx = interpolate(frame, CAM_FRAMES, CAM_FX, camEase);
  const camFy = interpolate(frame, CAM_FRAMES, CAM_FY, camEase);
  const camZ = interpolate(frame, CAM_FRAMES, CAM_Z, camEase);
  const camRx = interpolate(frame, CAM_FRAMES, CAM_RX, camEase);
  const camRy = interpolate(frame, CAM_FRAMES, CAM_RY, camEase);
  const cameraTransform =
    `rotateX(${camRx}deg) rotateY(${camRy}deg) scale(${camZ}) ` +
    `translate(${-(camFx - WIN_CX)}px, ${-(camFy - WIN_CY)}px)`;

  const { fps } = useVideoConfig();

  // --- outro: window drops away, orb backdrop + link pill take over ----------
  // The window launches downward with the same springy elasticity as the survey
  // window's exit in the interlude — an exit only shows the accelerating launch,
  // so the spring's settle lands safely off-screen.
  const winExit = spring({
    frame: frame - OUTRO_START,
    fps,
    config: { damping: 20, mass: 0.9 },
    durationInFrames: 26,
  });
  const winY = interpolate(winExit, [0, 1], [0, 1500]);
  const winOpacity = interpolate(
    frame,
    [OUTRO_START + 8, OUTRO_START + 30],
    [1, 0],
    clamp,
  );

  // The orb blooms in behind the leaving window.
  const orbOpacity = interpolate(
    frame,
    [OUTRO_START + 6, OUTRO_START + 30],
    [0, 1],
    clamp,
  );

  // The link pill rises from below the frame to settle dead-centre, with a
  // slight overshoot.
  const pillRise = spring({
    frame: frame - (OUTRO_START + 16),
    fps,
    config: { damping: 13, mass: 0.85 },
    durationInFrames: 24,
  });
  const pillY = interpolate(pillRise, [0, 1], [560, 0]);
  const pillScale = interpolate(pillRise, [0, 1], [0.86, 1]);
  const pillOpacity = interpolate(
    frame,
    [OUTRO_START + 16, OUTRO_START + 30],
    [0, 1],
    clamp,
  );

  // --- sign-off interaction: branded cursor taps the link pill ---------------
  // Once the pill has settled, the cursor glides onto it and clicks; on the tap
  // the pill flips from the white "platform.ciaobang.com" link to a black chip
  // carrying the waving "Ciao!" lockup (the same wave as the homepage nav).
  const SIGN_CLICK = OUTRO_START + 60;
  const signEase = { ...clamp, easing: Easing.out(Easing.cubic) } as const;
  const signCx = interpolate(
    frame,
    [OUTRO_START + 34, SIGN_CLICK],
    [1240, 1004],
    signEase,
  );
  const signCy = interpolate(
    frame,
    [OUTRO_START + 34, SIGN_CLICK],
    [792, 556],
    signEase,
  );
  const signPress = interpolate(
    frame,
    [SIGN_CLICK - 4, SIGN_CLICK, SIGN_CLICK + 6],
    [0, 1, 0],
    clamp,
  );
  const signCursorOpacity =
    interpolate(frame, [OUTRO_START + 30, OUTRO_START + 40], [0, 1], clamp) *
    (1 - interpolate(frame, [SIGN_CLICK + 8, SIGN_CLICK + 20], [0, 1], clamp));
  // the pill flips white→black + link→lockup on the tap, with a press-pop
  const pillMorph = interpolate(
    frame,
    [SIGN_CLICK, SIGN_CLICK + 12],
    [0, 1],
    clamp,
  );
  const pillPress = interpolate(
    frame,
    [SIGN_CLICK - 3, SIGN_CLICK + 2, SIGN_CLICK + 12],
    [1, 0.95, 1],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );

  return (
    <SceneWrapper
      durationInFrames={durationInFrames}
      fadeOut={0}
      style={{ perspective: 2000 }}
    >
      {/* orb backdrop for the sign-off — revealed beneath the window as it
          drops away, then sits behind the link pill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: orbOpacity,
        }}
      >
        <Img
          src={staticFile("surveys-sun-blue.webp")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            // Feather the top edge so the orb rises out of the moving-cloud
            // <Background/> instead of meeting it on a hard horizontal seam —
            // softens the hand-off from the previous sequence.
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 0%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 0%)",
          }}
        />
      </div>

      {/* keep the dot texture present over the orb backdrop, which otherwise
          hides the shader's dots — fades in with the orb */}
      <DotGrid opacity={orbOpacity} />

      <div style={{ transform: `translateY(${winY}px)`, opacity: winOpacity }}>
        <div
          style={{
            position: "relative",
            width: 1480,
            height: 880,
            transform: cameraTransform,
          }}
        >
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
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CiaoLogo size={20} />
                Ask Ciao!
              </span>
              <span
                style={{
                  color: COLORS.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <SearchIcon size={16} />
                ＋
              </span>
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
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <SearchIcon size={16} />
              Search your threads…
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
              <UserBubble enterAt={SEND + 2} frame={frame}>
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
                  opacity: interpolate(frame, [SEND + 24, SEND + 38], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <CiaoLogo size={18} />
                Ask Ciao!
              </div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>
                <Typewriter text={ASSISTANT_REPLY} start={SEND + 34} cps={42} />
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
                  const start = SEND + 92 + i * 10;
                  const op = interpolate(frame, [start, start + 8], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  const ty = interpolate(frame, [start, start + 8], [10, 0], {
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
                  opacity: interpolate(frame, [SEND + 130, SEND + 140], [0, 1], {
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
                  opacity: interpolate(frame, [SEND + 158, SEND + 168], [0, 1], {
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
              {frame >= TYPE_START && !sent ? (
                <div style={{ color: COLORS.ink, fontSize: 18 }}>
                  <Typewriter
                    text={QUESTION}
                    start={TYPE_START}
                    cps={42}
                    caretColor={COLORS.ink}
                  />
                </div>
              ) : (
                <div style={{ color: COLORS.muted, fontSize: 18 }}>
                  Ask a follow-up about your results…
                </div>
              )}
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
                    transform: `scale(${sendPulse})`,
                  }}
                >
                  ↑
                </div>
              </div>
            </div>
          </div>
        </div>
          </BrowserFrame>
          <LogoCursor x={cx} y={cy} press={press} opacity={cursorOpacity} />
        </div>
      </div>

      {/* sign-off: the platform link pill, centred over the orb. The cursor
          taps it and it flips to a black chip carrying the waving "Ciao!"
          lockup. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            opacity: pillOpacity,
            transform: `translateY(${pillY}px) scale(${pillScale * pillPress})`,
          }}
        >
          {/* link state — the underlined platform URL */}
          <div
            style={{
              background: COLORS.white,
              borderRadius: 999,
              padding: "34px 70px",
              fontFamily: FONTS.sans,
              fontSize: 62,
              fontWeight: 700,
              color: COLORS.ink,
              whiteSpace: "nowrap",
              boxShadow: "0 30px 70px rgba(40,35,28,0.24)",
              textDecoration: "underline",
              textDecorationThickness: 4,
              textUnderlineOffset: 10,
              opacity: 1 - pillMorph,
            }}
          >
            platform.ciaobang.com
          </div>
          {/* clicked state — glossy metallic chip with the waving Ciao! lockup */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // smoked-glass metal: a translucent warm-charcoal gradient (top
              // sheen → dark belly → faint foot reflection) that lets the orb
              // glow through, kept metallic by the rim + specular highlights.
              background:
                "linear-gradient(180deg, rgba(66,61,63,0.80) 0%, rgba(36,32,34,0.78) 16%, rgba(16,14,15,0.82) 50%, rgba(7,6,7,0.88) 78%, rgba(28,25,26,0.82) 100%)",
              backdropFilter: "blur(26px) saturate(1.5)",
              WebkitBackdropFilter: "blur(26px) saturate(1.5)",
              border: "1.5px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              // outer drop + ambient, plus a gentler inset bevel: softer
              // specular cap on top, dark seat on the bottom.
              boxShadow: [
                "0 30px 70px rgba(20,18,14,0.45)",
                "0 2px 6px rgba(0,0,0,0.35)",
                "inset 0 2px 1px rgba(255,255,255,0.28)",
                "inset 0 8px 18px rgba(255,255,255,0.06)",
                "inset 0 -3px 6px rgba(0,0,0,0.50)",
              ].join(", "),
              opacity: pillMorph,
              overflow: "hidden",
            }}
          >
            {/* glossy specular highlight sweeping the top half */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 36%, rgba(255,255,255,0) 52%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <CiaoWordmark dark size={84} />
            </div>
          </div>
        </div>
      </div>

      {/* sign-off cursor: glides onto the pill and taps it */}
      <LogoCursor
        x={signCx}
        y={signCy}
        press={signPress}
        opacity={signCursorOpacity}
      />
    </SceneWrapper>
  );
};

const CiaoLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={(size * 63) / 58}
    height={size}
    viewBox="0 0 63 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M43.8868 36.4415C39.2366 36.1663 34.5935 35.623 29.9504 35.6089C25.1026 35.5947 19.6974 34.4022 16.649 40.0191C16.5926 40.125 16.4374 40.1814 16.388 40.2873C15.8023 41.5786 14.9767 42.8276 14.7226 44.1824C14.4404 45.6784 16.1198 47.1108 18.3708 47.6824C23.4444 48.9808 28.6167 49.3195 33.8314 49.1431C35.525 49.1431 37.2255 49.1783 38.9191 49.1219C39.4624 49.1078 40.1822 49.0443 40.4997 48.7056C42.8283 46.2358 45.3404 43.879 46.4765 40.5342C47.2598 38.2197 46.1872 36.5685 43.8939 36.4345L43.8868 36.4415ZM28.2568 44.9233L27.4171 46.0876C24.2841 45.7066 21.645 45.4526 19.0482 45.0009C18.8365 44.9657 18.639 44.7822 18.4625 44.5493C18.0251 43.9848 18.1521 43.1663 18.7448 42.7923C18.9706 42.6512 19.1894 42.5524 19.4081 42.5594C21.9766 42.6582 24.5522 42.884 27.1067 43.1874C27.4242 43.2227 27.7206 43.3991 28.024 43.5967C28.4544 43.8931 28.5673 44.4929 28.2568 44.9233ZM29.7316 40.7883C29.5976 40.9153 29.4706 40.9929 29.3365 40.9929C28.0946 41.007 26.8597 40.7459 25.145 40.5342C24.5734 40.506 22.7035 40.379 21.6662 40.2096C21.645 40.2096 21.6238 40.2026 21.6027 40.1955C20.89 40.0262 21.1934 38.2974 21.8355 37.8316C21.9837 37.7258 22.1319 37.6552 22.273 37.6623C24.5734 37.7117 27.6641 38.1068 29.9574 38.3891C30.0068 38.3891 30.0562 38.4103 30.1056 38.4385C30.6843 38.756 30.2609 40.3014 29.7387 40.7883H29.7316ZM31.3828 45.9536C31.6298 44.133 32.4766 43.3074 34.5935 43.6249C36.6258 43.9284 38.7356 43.7943 40.9584 43.8649C40.528 47.2378 32.9494 46.7015 31.3828 45.9536ZM32.7588 40.5554C33.3798 39.0453 39.8153 38.6431 43.1671 39.9838C41.8687 42.1149 37.2044 42.3124 32.7588 40.5554Z"
      fill="currentColor"
    />
    <path
      d="M62.2406 6.93164C62.0148 4.99819 62.0289 2.41554 59.4181 1.90042C55.3254 1.08893 51.1832 0.545589 47.0341 0.0445839C45.6863 -0.117714 44.2821 0.206882 42.899 0.319784C35.9343 0.856072 28.9626 1.30063 22.0191 2.01332C20.8618 2.13328 19.38 3.16352 18.8155 4.19376C16.7691 7.91249 16.4445 12.1252 16.4445 16.2602C16.4445 20.3459 17.0302 24.4315 17.2137 28.5243C17.2489 29.2864 16.7903 30.2743 16.2399 30.8317C13.9536 33.118 11.6038 35.3549 9.15524 37.4647C5.9234 40.252 2.95265 43.1804 1.65427 47.4143C1.44258 48.1129 1.16032 48.8256 0.736935 49.4042C-0.483824 51.0836 -0.222737 52.3256 1.78128 53.0312C3.24902 53.5534 4.80143 53.885 6.33973 54.1602C13.008 55.3457 19.6834 56.4818 25.766 57.5332C31.2983 57.0322 36.1178 56.5171 40.9514 56.1854C42.7579 56.0584 44.0633 55.3104 45.1147 53.9626C46.9635 51.5846 48.7347 49.1431 50.6187 46.7933C54.2316 42.2913 57.2094 37.4295 59.0159 31.9255C59.4745 30.5283 59.2417 28.8489 59.8979 27.5928C61.7043 24.0928 62.5793 20.4164 62.6076 16.5354C62.6287 13.3318 62.6287 10.1 62.2547 6.93164H62.2406ZM50.1601 42.2772C48.4101 44.3377 46.9988 46.6945 45.5028 48.9667C43.6117 51.8316 41.0361 53.1441 37.5644 53.4828C31.6017 54.0614 25.6602 54.4354 19.7257 53.4969C14.7792 52.7137 9.87499 51.6623 4.94961 50.7449C3.58773 50.4909 3.36898 49.7429 3.89115 48.5786C5.79638 44.3165 8.43548 40.7107 12.3659 38.001C14.5746 36.4839 16.3739 34.3811 18.4626 32.6664C19.0977 32.1442 20.0927 31.742 20.883 31.7914C31.8063 32.5535 42.7297 32.9275 53.653 31.7914C54.1187 31.742 54.6056 31.869 55.3042 31.9396C54.1116 35.8982 52.6721 39.3135 50.1601 42.2702V42.2772ZM58.7618 22.9779C58.3455 24.742 57.2165 26.3791 56.1862 27.9174C55.8193 28.4678 54.782 28.7995 54.034 28.8206C47.2458 29.0323 40.4504 29.2017 33.6622 29.3005C31.3194 29.3358 28.9838 29.3005 26.641 29.2299C20.9394 29.0676 20.3326 29.5333 19.8034 25.8852C19.5564 24.1916 19.4435 22.4769 19.3235 20.7622C19.2247 19.365 19.2318 17.9679 19.3376 16.5778L20.0645 7.24213C20.1774 6.48003 21.5392 5.53447 22.4707 5.32984C25.3497 4.68065 28.2852 4.24315 31.2206 3.91856C35.264 3.474 39.3285 2.88832 43.3788 2.94477C47.4998 2.99417 51.6348 3.61513 55.7205 4.22198C58.7195 4.67359 59.03 5.32984 59.4675 8.32176C60.1872 13.2612 59.905 18.1655 58.7618 22.9709V22.9779Z"
      fill="currentColor"
    />
    <path
      d="M52.2445 25.5676C53.0317 24.392 53.8945 23.141 54.2126 21.7929V21.7875C55.0862 18.1154 55.3019 14.3677 54.7519 10.5931C54.4176 8.30679 54.1803 7.80531 51.8886 7.4602L51.7784 7.44384C48.6921 6.98536 45.5695 6.5215 42.4574 6.48419C39.3622 6.44106 36.2563 6.88862 33.1665 7.22833C30.9233 7.47638 28.6801 7.8107 26.48 8.30679C25.7682 8.46317 24.7275 9.18574 24.6413 9.76811L24.0858 16.9021C24.005 17.9644 23.9996 19.0321 24.0751 20.0998C24.1667 21.4101 24.253 22.7204 24.4417 24.0146C24.8462 26.8024 25.3099 26.4465 29.6669 26.5705C31.4571 26.6244 33.242 26.6514 35.0322 26.6244C40.2196 26.549 45.4124 26.4195 50.5998 26.2578C51.1714 26.2416 51.9641 25.9882 52.2445 25.5676Z"
      fill="currentColor"
    />
  </svg>
);

const SearchIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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
