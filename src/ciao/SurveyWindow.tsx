import React from "react";
import { interpolate } from "remotion";
import { BrowserFrame } from "./BrowserFrame";
import { COLORS, FONTS, LIKERT, RESPONSE_PATTERN, SURVEY_LIST } from "./theme";

// The full "Measures of Your Personality" survey window — the live UI screenshot 2
// shows. It is the single source of truth for that layout: <SurveyQuestion/> drives
// it through its click timeline, and <Hero/> renders it at rest so its gentle zoom
// lands on a pixel-identical frame (same trick <HomeScreen/> uses for the
// IntroLaptop → Hero hand-off). Keep this presentational: all motion is passed in.

// Native window size, shared so the Hero zoom can frame it exactly as SurveyQuestion
// opens on it.
export const SURVEY_WIN = { width: 1480, height: 880 } as const;

// The question shown in the pane (row 105 in the progress list) and the option that
// gets "clicked".
export const ACTIVE_INDEX = 1; // index into SURVEY_LIST -> num 105
export const SELECTED = 5; // "Moderately accurate"
export const TOTAL = 181;
export const BEFORE_COUNT = 95;
export const AFTER_COUNT = 96;

export interface SurveyWindowProps {
  /** answered counter shown in the sidebar + progress bar */
  answered?: number;
  /** progress percentage pill */
  pct?: number;
  /** 0→1 the active sidebar row flips from "NOT ANSWERED" to its answer */
  sidebarT?: number;
  /** 0→1 the answer area reflows from the 2×3 grid to the compact row + violin */
  reflow?: number;
  /** 0→1 the response-pattern violin grows in */
  panelReveal?: number;
  /** whether the answer is committed (highlights option 5 in the grid) */
  selectedActive?: boolean;
  /** committed-answer "pop" applied to the selected card */
  pressPulse?: number;
  width?: number;
  height?: number;
}

// Defaults are the settled opening state (screenshot 2 before any click): 95 / 52%,
// the 2×3 grid resting, nothing selected. That is exactly what <SurveyQuestion/>
// opens on, so <Hero/> can render this at defaults and zoom straight into it.
export const SurveyWindow: React.FC<SurveyWindowProps> = ({
  answered = BEFORE_COUNT,
  pct = 52,
  sidebarT = 0,
  reflow = 0,
  panelReveal = 0,
  selectedActive = false,
  pressPulse = 1,
  width = SURVEY_WIN.width,
  height = SURVEY_WIN.height,
}) => {
  return (
    <BrowserFrame
      url="platform.ciaobang.com/surveys/measures-of-your-personality"
      width={width}
      height={height}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          fontFamily: FONTS.sans,
          color: COLORS.ink,
          padding: 24,
          gap: 18,
          background:
            "linear-gradient(135deg, #faf9f7 0%, #f4f6f6 60%, #eef3f4 100%)",
        }}
      >
        <TopBar answered={answered} />

        <div style={{ display: "flex", flex: 1, gap: 20, minHeight: 0 }}>
          <ProgressSidebar answered={answered} pct={pct} sidebarT={sidebarT} />

          {/* question pane */}
          <div
            style={{
              flex: 1,
              borderRadius: 20,
              border: `1px solid ${COLORS.line}`,
              padding: 28,
              background: COLORS.white,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <PaneHeader />

            <div
              style={{
                fontSize: 50,
                fontWeight: 800,
                marginTop: 16,
                letterSpacing: -1,
                lineHeight: 1.04,
              }}
            >
              {SURVEY_LIST[ACTIVE_INDEX].text}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                letterSpacing: 1.6,
                color: COLORS.muted,
                fontWeight: 600,
              }}
            >
              <span>INACCURATE</span>
              <span>ACCURATE</span>
            </div>

            {/* answer area — cross-fades from the 2×3 grid to the compact row +
                violin once the answer is committed */}
            <div
              style={{
                position: "relative",
                flex: 1,
                marginTop: 14,
                minHeight: 0,
              }}
            >
              {/* before: 2×3 grid */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 1 - reflow,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridTemplateRows: "1fr 1fr",
                  gap: 16,
                }}
              >
                {LIKERT.map((opt) => (
                  <LikertCard
                    key={opt.n}
                    n={opt.n}
                    label={opt.label}
                    variant="grid"
                    isSelected={selectedActive && opt.n === SELECTED}
                    pulse={opt.n === SELECTED ? pressPulse : 1}
                  />
                ))}
              </div>

              {/* after: compact row + response pattern violin */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: reflow,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transform: `translateY(${interpolate(
                    reflow,
                    [0, 1],
                    [16, 0],
                  )}px)`,
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  {LIKERT.map((opt) => (
                    <LikertCard
                      key={opt.n}
                      n={opt.n}
                      label={opt.label}
                      variant="row"
                      isSelected={opt.n === SELECTED}
                      pulse={1}
                    />
                  ))}
                </div>

                <ViolinPanel
                  pattern={RESPONSE_PATTERN}
                  selected={SELECTED}
                  reveal={panelReveal}
                  show={reflow}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
};

// ---------------------------------------------------------------------------
// Top application bar
// ---------------------------------------------------------------------------
const TopBar: React.FC<{ answered: number }> = ({ answered }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: COLORS.white,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 999,
        padding: "8px 16px",
        fontSize: 15,
      }}
    >
      <HomeIcon />
      <Crumb>›</Crumb>
      <span style={{ color: COLORS.inkSoft }}>Surveys</span>
      <Crumb>›</Crumb>
      <span style={{ fontWeight: 600 }}>Measures of Your Personality</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: COLORS.inkSoft,
          fontSize: 14,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: COLORS.matchaDeep,
          }}
        />
        Saved at 10:22 PM
      </span>
      <IconBtn>?</IconBtn>
      <IconBtn>⌨</IconBtn>
      <IconBtn>☾</IconBtn>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          background: COLORS.oatLight,
          border: `1px solid ${COLORS.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        MI
      </div>
      <div
        style={{
          background: answered >= TOTAL ? COLORS.ink : COLORS.oatLight,
          color: answered >= TOTAL ? COLORS.white : COLORS.muted,
          border: `1px solid ${COLORS.line}`,
          padding: "10px 18px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Submit survey →
      </div>
    </div>
  </div>
);

const Crumb: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: COLORS.muted, fontSize: 16 }}>{children}</span>
);

const HomeIcon: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9"
      stroke={COLORS.inkSoft}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBtn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: 38,
      height: 38,
      borderRadius: 999,
      background: COLORS.white,
      border: `1px solid ${COLORS.line}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      color: COLORS.inkSoft,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Progress sidebar
// ---------------------------------------------------------------------------
const ProgressSidebar: React.FC<{
  answered: number;
  pct: number;
  sidebarT: number;
}> = ({ answered, pct, sidebarT }) => (
  <div
    style={{
      width: 360,
      borderRadius: 20,
      border: `1px solid ${COLORS.line}`,
      padding: 24,
      background: COLORS.white,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: 1.6,
          color: COLORS.muted,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        SURVEY
        <br />
        PROGRESS
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: COLORS.white,
          border: `1px solid ${COLORS.lineStrong}`,
          borderRadius: 14,
          padding: "8px 14px",
          width: 132,
        }}
      >
        <span style={{ fontSize: 16, color: COLORS.inkSoft }}>↑</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.inkSoft,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Find first
          <br />
          unanswered
        </span>
      </div>
    </div>

    <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, marginTop: 12 }}>
      {answered}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
      }}
    >
      <span style={{ fontSize: 15, color: COLORS.inkSoft }}>
        of {TOTAL} prompts answered
      </span>
      <span
        style={{
          background: COLORS.ink,
          color: COLORS.white,
          borderRadius: 999,
          padding: "5px 13px",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {pct}%
      </span>
    </div>
    <div
      style={{
        marginTop: 14,
        height: 6,
        borderRadius: 999,
        background: COLORS.oatLight,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${(answered / TOTAL) * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${COLORS.matcha}, ${COLORS.matchaDeep})`,
        }}
      />
    </div>

    {/* item scroller */}
    <div
      style={{
        position: "relative",
        flex: 1,
        marginTop: 22,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {SURVEY_LIST.map((q, i) => (
          <ItemRow
            key={q.num}
            num={q.num}
            text={q.text}
            active={i === ACTIVE_INDEX}
            answerProgress={i === ACTIVE_INDEX ? sidebarT : 0}
            answerLabel={LIKERT[SELECTED - 1].label}
          />
        ))}
      </div>
      {/* bottom fade so the last row reads as "more below" */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 56,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 92%)",
          pointerEvents: "none",
        }}
      />
    </div>
  </div>
);

const ItemRow: React.FC<{
  num: number;
  text: string;
  active: boolean;
  answerProgress: number;
  answerLabel: string;
}> = ({ num, text, active, answerProgress, answerLabel }) => (
  <div
    style={{
      border: `1.5px solid ${active ? COLORS.slushie : COLORS.line}`,
      background: active ? "rgba(59,211,253,0.08)" : COLORS.white,
      borderRadius: 16,
      padding: "12px 14px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 1.4,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: COLORS.inkSoft,
        }}
      >
        <span
          style={{
            position: "relative",
            width: 9,
            height: 9,
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: COLORS.oat,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: COLORS.matchaDeep,
              opacity: answerProgress,
            }}
          />
        </span>
        {String(num).padStart(3, "0")}
      </span>
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: 200,
          height: 14,
        }}
      >
        <span
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            whiteSpace: "nowrap",
            color: COLORS.muted,
            opacity: 1 - answerProgress,
          }}
        >
          NOT ANSWERED
        </span>
        <span
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            whiteSpace: "nowrap",
            color: COLORS.matchaDeep,
            opacity: answerProgress,
          }}
        >
          {answerLabel.toUpperCase()}
        </span>
      </span>
    </div>
    <div style={{ fontSize: 15, marginTop: 8, color: COLORS.ink }}>{text}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Question pane header (KEYS / PREVIOUS / NEXT)
// ---------------------------------------------------------------------------
const PaneHeader: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <div
      style={{
        fontSize: 14,
        letterSpacing: 1.4,
        color: COLORS.muted,
        fontWeight: 600,
      }}
    >
      QUESTION {SURVEY_LIST[ACTIVE_INDEX].num} OF {TOTAL}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 13,
        letterSpacing: 1.3,
        color: COLORS.muted,
        fontWeight: 600,
      }}
    >
      <span>KEYS</span>
      <span
        style={{
          border: `1.5px solid ${COLORS.lineStrong}`,
          borderRadius: 999,
          padding: "3px 12px",
          color: COLORS.ink,
        }}
      >
        1 – 6
      </span>
      <span>ANSWER</span>
      <NavBtn dir="‹" label="PREVIOUS" />
      <NavBtn dir="›" label="NEXT" />
    </div>
  </div>
);

const NavBtn: React.FC<{ dir: string; label: string }> = ({ dir, label }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        border: `1px solid ${COLORS.lineStrong}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        color: COLORS.inkSoft,
      }}
    >
      {dir}
    </span>
    {label}
  </span>
);

// ---------------------------------------------------------------------------
// Likert card (grid + compact row variants)
// ---------------------------------------------------------------------------
const LikertCard: React.FC<{
  n: number;
  label: string;
  variant: "grid" | "row";
  isSelected: boolean;
  pulse: number;
}> = ({ n, label, variant, isSelected, pulse }) => {
  const row = variant === "row";
  const numSize = row ? 34 : 60;
  const numFont = row ? 17 : 28;
  const labelFont = row ? 13 : 22;

  return (
    <div
      style={{
        flex: row ? 1 : undefined,
        border: `2px solid ${isSelected ? COLORS.slushieDeep : COLORS.line}`,
        borderRadius: 18,
        background: isSelected ? COLORS.slushie : COLORS.white,
        color: isSelected ? COLORS.slushieDeep : COLORS.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: row ? 10 : 14,
        padding: row ? "16px 8px" : 0,
        boxShadow: isSelected
          ? row
            ? "0 10px 24px rgba(0,137,173,0.28)"
            : COLORS.hardShadow
          : "none",
        transform: row
          ? "scale(1)"
          : `scale(${pulse})${
              isSelected ? " translateY(-4px) rotate(-2deg)" : ""
            }`,
      }}
    >
      <div
        style={{
          width: numSize,
          height: numSize,
          borderRadius: row ? 10 : 999,
          background: isSelected ? COLORS.white : COLORS.oatLight,
          color: isSelected ? COLORS.slushieDeep : COLORS.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: numFont,
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontSize: labelFont,
          fontWeight: 600,
          textAlign: "center",
          padding: row ? 0 : "0 12px",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Response-pattern violin
// ---------------------------------------------------------------------------
const PAD_F = 0.06; // horizontal inset as a fraction of the plot width
const xPct = (pos: number) =>
  PAD_F * 100 + ((pos - 1) / 5) * (1 - 2 * PAD_F) * 100;

const buildViolin = (pattern: readonly number[], grow: number): string => {
  const VB = 1000;
  const centerY = 520;
  const maxHalf = 360;
  const bw = 0.64;
  const xOf = (s: number) => VB * PAD_F + ((s - 1) / 5) * VB * (1 - 2 * PAD_F);
  const dens = (s: number) =>
    pattern.reduce(
      (a, p, i) => a + p * Math.exp(-0.5 * ((s - (i + 1)) / bw) ** 2),
      0,
    );

  const N = 96;
  const ss: number[] = [];
  for (let i = 0; i <= N; i++) ss.push(0.7 + ((6.3 - 0.7) * i) / N);
  const ds = ss.map(dens);
  const maxD = Math.max(...ds);
  const half = ds.map((d) => (d / maxD) * maxHalf * grow);

  let d = `M ${xOf(ss[0]).toFixed(1)} ${(centerY - half[0]).toFixed(1)}`;
  for (let i = 1; i <= N; i++)
    d += ` L ${xOf(ss[i]).toFixed(1)} ${(centerY - half[i]).toFixed(1)}`;
  for (let i = N; i >= 0; i--)
    d += ` L ${xOf(ss[i]).toFixed(1)} ${(centerY + half[i]).toFixed(1)}`;
  return d + " Z";
};

const ViolinPanel: React.FC<{
  pattern: readonly number[];
  selected: number;
  reveal: number;
  show: number;
}> = ({ pattern, selected, reveal, show }) => {
  const total = pattern.reduce((a, p) => a + p, 0);
  const othersPos = pattern.reduce((a, p, i) => a + p * (i + 1), 0) / total;
  const path = buildViolin(pattern, reveal);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        borderRadius: 18,
        border: `1px solid ${COLORS.line}`,
        background: COLORS.white,
        padding: "16px 22px 14px",
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
        <span
          style={{
            fontSize: 13,
            letterSpacing: 1.6,
            color: COLORS.muted,
            fontWeight: 600,
          }}
        >
          RESPONSE PATTERN
        </span>
        <span
          style={{
            background: COLORS.slushie,
            color: COLORS.white,
            borderRadius: 999,
            padding: "5px 13px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.2,
            opacity: show,
          }}
        >
          SELECTED: {selected}
        </span>
      </div>

      {/* plot */}
      <div style={{ position: "relative", flex: 1, marginTop: 10 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0 }}
        >
          <path d={path} fill="rgba(85,83,78,0.16)" />
        </svg>

        {/* centre axis */}
        <div
          style={{
            position: "absolute",
            left: "3%",
            right: "3%",
            top: "52%",
            height: 1.5,
            background: "rgba(85,83,78,0.35)",
          }}
        />

        {/* top percentage labels */}
        {pattern.map((p, i) => (
          <span
            key={`p${i}`}
            style={{
              position: "absolute",
              left: `${xPct(i + 1)}%`,
              top: "2%",
              transform: "translateX(-50%)",
              fontSize: 15,
              color: COLORS.muted,
              fontWeight: 600,
              opacity: reveal,
            }}
          >
            {p}%
          </span>
        ))}

        {/* bottom axis labels */}
        {pattern.map((_, i) => (
          <span
            key={`x${i}`}
            style={{
              position: "absolute",
              left: `${xPct(i + 1)}%`,
              top: "90%",
              transform: "translateX(-50%)",
              fontSize: 15,
              color: COLORS.muted,
              fontWeight: 600,
            }}
          >
            {i + 1}
          </span>
        ))}

        {/* "Others" mean marker */}
        <Marker
          left={xPct(othersPos)}
          label="Others"
          color={COLORS.muted}
          opacity={reveal}
          dy={0}
        />

        {/* "My score" marker — already sitting on the axis (like "Others"),
            fading in with the panel rather than dropping onto its option. */}
        <Marker
          left={xPct(selected)}
          label="My score"
          color={COLORS.lemon}
          opacity={reveal}
          dy={0}
        />
      </div>
    </div>
  );
};

const Marker: React.FC<{
  left: number;
  label: string;
  color: string;
  opacity: number;
  dy: number;
}> = ({ left, label, color, opacity, dy }) => (
  // The 16×16 box is centred exactly on the axis (translate -50%,-50%), so the
  // dot sits on the horizontal line; the label floats above it.
  <div
    style={{
      position: "absolute",
      left: `${left}%`,
      top: "52%",
      width: 16,
      height: 16,
      transform: `translate(-50%, -50%) translateY(${dy}px)`,
      opacity,
    }}
  >
    <span
      style={{
        position: "absolute",
        left: "50%",
        bottom: "calc(100% + 7px)",
        transform: "translateX(-50%)",
        fontSize: 13,
        color: COLORS.inkSoft,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
    <span
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 999,
        background: color,
        border: "2px solid #ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }}
    />
  </div>
);
