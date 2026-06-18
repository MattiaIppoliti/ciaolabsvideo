import React from "react";
import {
  Easing,
  getRemotionEnvironment,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { SceneWrapper } from "../SceneWrapper";
import { HomeScreen } from "../HomeScreen";
import { ShellCard } from "../ShellCard";
import { FONTS } from "../theme";
import { useAuthorFrame } from "../timing";

export const INTRO_DURATION = 135;

// background-30s.webm opens on ~4s of the live homepage, then settles into its
// pure moving-sea shader. We cut those first 4s away (trimBefore = SEA_TRIM) and
// play the MOVING sea as the live backdrop behind the (scrolling) homepage, so
// the laptop screen is alive instead of a frozen still. <Hero/> keeps playing the
// same sea from where the intro left it and scrolls the same page, so the
// camera's dive out of the laptop screen stays seamless.
export const SEA_TRIM = 240; // 4s · 60fps — first frame of the moving sea

// Geometry of the laptop rig (rig-local px; the hinge line sits at y = 0).
// Proportions + materials follow Mac.svg: a space-gray clamshell whose base
// footprint matches the lid, a lighter metal front lip with a finger groove,
// and a 16:10 display on the lid. No Apple logo.
const LID_W = 1180;
// 16:9 display so the homepage fits the panel exactly (no crop / no letterbox)
// and lands pixel-aligned with <Hero/> when the camera dives in: inner panel =
// (1180-24) × (LID_H-24) = 1156 × 650 = 16:9.
const LID_H = 674;
const BEZEL = 12;
const DECK_W = 1180;
const DECK_DEPTH = 720; // base footprint depth (~matches the lid when closed)
const DECK_TILT = 62; // degrees the base reclines onto the table
const RIG_SCALE = 0.74;
const RIG_DROP = 118; // push the whole machine down so the open lid fits

// Space-gray material cues lifted from Mac.svg.
const ALU_LIGHT = "#cdd0d6";
const ALU_MID = "#a7abb3";
const ALU_DARK = "#8c9099";
const LID_BACK_TOP = "#3a3d44";
const LID_BACK_BOT = "#23252a";
const BEZEL_COL = "#0a0a0c";

// Apple Magic Keyboard, ISO (European) layout — modelled on the reference
// photo: Touch ID, the modern function-row glyph set (brightness, Mission
// Control, Spotlight, dictation, Do Not Disturb, media transport, volume),
// dual symbol/number legends, a tall L-shaped Return, and an inverted-T arrow
// cluster. Keys are laid out absolutely from per-row weights so the alpha block
// stays grid-aligned and the L-Return can carve its notch with a clip-path.
type IconName =
  | "brightLow"
  | "brightHigh"
  | "mission"
  | "search"
  | "mic"
  | "moon"
  | "rewind"
  | "playpause"
  | "forward"
  | "mute"
  | "volDown"
  | "volUp";

type KSpec = {
  w?: number;
  label?: string;
  align?: "bl" | "br" | "tl" | "center";
  top?: string; // upper legend (number row)
  bottom?: string; // lower legend
  icon?: IconName; // function-row glyph
  cap?: string; // F-number caption under the glyph
  symTR?: string; // modifier symbol, top-right
  name?: string; // modifier name, bottom-left
  led?: boolean; // caps-lock indicator
  round?: boolean; // Touch ID button
  kind?: "enterTop" | "enterStem" | "arrows" | "space";
};

type Rect = { x: number; y: number; w: number; h: number; k: KSpec };

const FN_KEYS: KSpec[] = [
  { icon: "brightLow", cap: "F1" },
  { icon: "brightHigh", cap: "F2" },
  { icon: "mission", cap: "F3" },
  { icon: "search", cap: "F4" },
  { icon: "mic", cap: "F5" },
  { icon: "moon", cap: "F6" },
  { icon: "rewind", cap: "F7" },
  { icon: "playpause", cap: "F8" },
  { icon: "forward", cap: "F9" },
  { icon: "mute", cap: "F10" },
  { icon: "volDown", cap: "F11" },
  { icon: "volUp", cap: "F12" },
];

const letters = (s: string): KSpec[] =>
  s.split("").map((label) => ({ label }));

const ROWS: KSpec[][] = [
  [{ label: "esc", align: "bl", w: 1.3 }, ...FN_KEYS, { round: true }],
  [
    { top: "±", bottom: "§" },
    { top: "!", bottom: "1" },
    { top: "@", bottom: "2" },
    { top: "#", bottom: "3" },
    { top: "$", bottom: "4" },
    { top: "%", bottom: "5" },
    { top: "^", bottom: "6" },
    { top: "&", bottom: "7" },
    { top: "*", bottom: "8" },
    { top: "(", bottom: "9" },
    { top: ")", bottom: "0" },
    { top: "_", bottom: "-" },
    { top: "+", bottom: "=" },
    { label: "⌫", align: "center", w: 1.6 },
  ],
  [
    { label: "⇥", align: "tl", w: 1.5 },
    ...letters("QWERTYUIOP"),
    { top: "{", bottom: "[" },
    { top: "}", bottom: "]" },
    { kind: "enterTop", w: 1.6 },
  ],
  [
    { label: "⇪", align: "bl", led: true, w: 1.7 },
    ...letters("ASDFGHJKL"),
    { top: ":", bottom: ";" },
    { top: '"', bottom: "'" },
    { top: "|", bottom: "\\" },
    { kind: "enterStem", w: 0.9 },
  ],
  [
    { label: "⇧", align: "bl", w: 1.3 },
    { top: "~", bottom: "`" },
    ...letters("ZXCVBNM"),
    { top: "<", bottom: "," },
    { top: ">", bottom: "." },
    { top: "?", bottom: "/" },
    { label: "⇧", align: "br", w: 1.9 },
  ],
  [
    { label: "fn", align: "tl" },
    { symTR: "⌃", name: "control", w: 1.2 },
    { symTR: "⌥", name: "option", w: 1.1 },
    { symTR: "⌘", name: "command", w: 1.3 },
    { kind: "space", w: 5 },
    { symTR: "⌘", name: "command", w: 1.3 },
    { symTR: "⌥", name: "option", w: 1.1 },
    { kind: "arrows", w: 3 },
  ],
];

// Shared keycap face — flat, dark, with a faint top highlight and a base
// shadow, matching the matte space-gray caps in the reference photo.
const FACE: React.CSSProperties = {
  background: "linear-gradient(180deg, #3b3b3e 0%, #2c2c30 52%, #242427 100%)",
  borderRadius: 6,
  boxShadow:
    "0 1px 0 rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.5)",
  color: "#dcdce0",
  fontFamily: FONTS.sans,
  fontWeight: 400,
};

const ALIGN: Record<string, { ai: string; jc: string }> = {
  bl: { ai: "flex-end", jc: "flex-start" },
  br: { ai: "flex-end", jc: "flex-end" },
  tl: { ai: "flex-start", jc: "flex-start" },
  center: { ai: "center", jc: "center" },
};

const Sun: React.FC<{ r: number; ri: number; ro: number }> = ({ r, ri, ro }) => (
  <>
    <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="1.6" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      return (
        <line
          key={i}
          x1={12 + ri * Math.cos(rad)}
          y1={12 + ri * Math.sin(rad)}
          x2={12 + ro * Math.cos(rad)}
          y2={12 + ro * Math.sin(rad)}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      );
    })}
  </>
);

const FnIcon: React.FC<{ name: IconName }> = ({ name }) => {
  const svg = { width: 14, height: 14, viewBox: "0 0 24 24", style: { display: "block" as const } };
  const spk = "M3 9.5 H6.5 L11 5.5 V18.5 L6.5 14.5 H3 Z";
  switch (name) {
    case "brightLow":
      return (
        <svg {...svg}>
          <Sun r={2.4} ri={4.4} ro={5.4} />
        </svg>
      );
    case "brightHigh":
      return (
        <svg {...svg}>
          <Sun r={3.4} ri={5.6} ro={7.2} />
        </svg>
      );
    case "mission":
      return (
        <svg {...svg} fill="currentColor">
          <rect x="3" y="3.5" width="18" height="6.4" rx="1.6" />
          <rect x="3" y="12.6" width="8" height="7.9" rx="1.6" />
          <rect x="13" y="12.6" width="8" height="7.9" rx="1.6" />
        </svg>
      );
    case "search":
      return (
        <svg {...svg} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6" />
          <line x1="15" y1="15" x2="20" y2="20" />
        </svg>
      );
    case "mic":
      return (
        <svg {...svg} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
          <path d="M6 12 a6 6 0 0 0 12 0" />
          <line x1="12" y1="18" x2="12" y2="21" />
          <line x1="8.5" y1="21" x2="15.5" y2="21" />
        </svg>
      );
    case "moon":
      return (
        <svg {...svg} fill="currentColor">
          <path d="M20 14.6 A8.5 8.5 0 1 1 11 3.2 a6.6 6.6 0 0 0 9 11.4 z" />
        </svg>
      );
    case "rewind":
      return (
        <svg {...svg} fill="currentColor">
          <path d="M11 6 L4 12 L11 18 Z" />
          <path d="M20 6 L13 12 L20 18 Z" />
        </svg>
      );
    case "playpause":
      return (
        <svg {...svg} fill="currentColor">
          <path d="M4 6 L4 18 L12 12 Z" />
          <rect x="15" y="6" width="2.4" height="12" />
          <rect x="19" y="6" width="2.4" height="12" />
        </svg>
      );
    case "forward":
      return (
        <svg {...svg} fill="currentColor">
          <path d="M4 6 L11 12 L4 18 Z" />
          <path d="M13 6 L20 12 L13 18 Z" />
        </svg>
      );
    case "mute":
      return (
        <svg {...svg} fill="currentColor">
          <path d={spk} />
          <line x1="14.5" y1="9.5" x2="20" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="20" y1="9.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "volDown":
      return (
        <svg {...svg} fill="currentColor">
          <path d={spk} />
          <path d="M14 9 a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "volUp":
      return (
        <svg {...svg} fill="currentColor">
          <path d={spk} />
          <path d="M14 9 a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.5 6 a8 8 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
};

const KeyContent: React.FC<{ k: KSpec }> = ({ k }) => {
  if (k.icon) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          color: "#e3e3e7",
        }}
      >
        <FnIcon name={k.icon} />
        {k.cap && <span style={{ fontSize: 6.5, lineHeight: 1, opacity: 0.85 }}>{k.cap}</span>}
      </div>
    );
  }
  if (k.top || k.bottom) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 0 0 24%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 2,
          fontSize: 9,
          lineHeight: 1,
        }}
      >
        <span>{k.top}</span>
        <span>{k.bottom}</span>
      </div>
    );
  }
  if (k.symTR || k.name) {
    return (
      <>
        {k.symTR && <span style={{ position: "absolute", top: 3, right: 5, fontSize: 9 }}>{k.symTR}</span>}
        {k.name && <span style={{ position: "absolute", bottom: 3, left: 5, fontSize: 8 }}>{k.name}</span>}
      </>
    );
  }
  const a = ALIGN[k.align ?? "center"];
  const fs = k.label && k.label.length > 1 ? 8 : 13;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "3px 6px",
        display: "flex",
        alignItems: a.ai,
        justifyContent: a.jc,
        fontSize: fs,
      }}
    >
      {k.label}
    </div>
  );
};

// Inverted-T arrow cluster as on the Apple Magic Keyboard: the Up key is a
// half-height cap centred on the top row; Left / Down / Right are half-height
// caps along the bottom row. The top-left and top-right cells stay empty.
const ArrowCluster: React.FC<{ pos: React.CSSProperties }> = ({ pos }) => {
  const cap: React.CSSProperties = {
    ...FACE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 6.5,
    color: "#cfcfd4",
    lineHeight: 1,
  };
  return (
    <div
      style={{
        ...pos,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        columnGap: "4%",
        rowGap: "11%",
      }}
    >
      <span />
      <div style={cap}>▲</div>
      <span />
      <div style={cap}>◀</div>
      <div style={cap}>▼</div>
      <div style={cap}>▶</div>
    </div>
  );
};

const KeyCap: React.FC<{ rect: Rect }> = ({ rect }) => {
  const k = rect.k;
  const pos: React.CSSProperties = {
    position: "absolute",
    left: `${rect.x}%`,
    top: `${rect.y}%`,
    width: `${rect.w}%`,
    height: `${rect.h}%`,
  };
  if (k.kind === "space") return <div style={{ ...pos, ...FACE }} />;
  if (k.kind === "arrows") return <ArrowCluster pos={pos} />;
  if (k.round) {
    return (
      <div style={{ ...pos, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            ...FACE,
            background: "radial-gradient(circle at 50% 38%, #3a3a3e 0%, #29292c 70%, #232326 100%)",
          }}
        />
      </div>
    );
  }
  return (
    <div style={{ ...pos, ...FACE }}>
      {k.led && (
        <div
          style={{
            position: "absolute",
            left: 5,
            top: 5,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#5fdc7a",
            boxShadow: "0 0 4px #5fdc7a",
          }}
        />
      )}
      <KeyContent k={k} />
    </div>
  );
};

// L-shaped ISO Return: a single cap spanning the QWERTY + home rows, with a
// clip-path that carves out the notch where the | \ and quote keys sit.
const EnterKey: React.FC<{ top: Rect; stem: Rect }> = ({ top, stem }) => {
  const x0 = top.x;
  const y0 = top.y;
  const width = 100 - x0;
  const height = stem.y + stem.h - y0;
  const stemLeft = ((stem.x - x0) / width) * 100;
  const band = ((stem.y - y0) / height) * 100;
  const clip = `polygon(0 0, 100% 0, 100% 100%, ${stemLeft}% 100%, ${stemLeft}% ${band}%, 0 ${band}%)`;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x0}%`,
        top: `${y0}%`,
        width: `${width}%`,
        height: `${height}%`,
        clipPath: clip,
        ...FACE,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: `${band}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
        }}
      >
        ⏎
      </div>
    </div>
  );
};

function layoutRow(keys: KSpec[], y: number, h: number, gap: number): Rect[] {
  const wsum = keys.reduce((s, k) => s + (k.w ?? 1), 0);
  const avail = 100 - gap * (keys.length - 1);
  let x = 0;
  return keys.map((k) => {
    const w = ((k.w ?? 1) / wsum) * avail;
    const rect: Rect = { x, y, w, h, k };
    x += w + gap;
    return rect;
  });
}

const Keyboard: React.FC = () => {
  const G = 0.65; // horizontal gap, % of keyboard width
  const V = 1.7; // vertical gap, % of keyboard height
  const rowW = [0.82, 1, 1, 1, 1, 1];
  const sumV = rowW.reduce((a, b) => a + b, 0);
  const availV = 100 - V * (rowW.length - 1);
  let yAcc = 0;
  const rowGeom = rowW.map((w) => {
    const rh = (w / sumV) * availV;
    const geom = { y: yAcc, h: rh };
    yAcc += rh + V;
    return geom;
  });
  const rows = ROWS.map((row, ri) => layoutRow(row, rowGeom[ri].y, rowGeom[ri].h, G));
  const enterTop = rows[2][rows[2].length - 1];
  const enterStem = rows[3][rows[3].length - 1];

  return (
    <div
      style={{
        position: "absolute",
        left: "4.5%",
        right: "4.5%",
        top: "7%",
        height: "56%",
        background: "linear-gradient(180deg, #2a2c30 0%, #17181b 100%)",
        borderRadius: 12,
        boxShadow:
          "inset 0 2px 9px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.5)",
        padding: 11,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {rows.map((row: Rect[], ri: number) => (
          <React.Fragment key={ri}>
            {row.map((rect: Rect, ci: number) =>
              rect.k.kind === "enterTop" || rect.k.kind === "enterStem" ? null : (
                <KeyCap key={`${ri}-${ci}`} rect={rect} />
              ),
            )}
          </React.Fragment>
        ))}
        <EnterKey top={enterTop} stem={enterStem} />
      </div>
    </div>
  );
};

const SpeakerGrille: React.FC<{ side: "left" | "right" }> = ({ side }) => (
  <div
    style={{
      position: "absolute",
      top: "9%",
      height: "52%",
      width: "3.4%",
      [side]: "1.1%",
      borderRadius: 6,
      backgroundColor: "#7f838c",
      backgroundImage:
        "radial-gradient(rgba(0,0,0,0.55) 0.8px, transparent 1px)",
      backgroundSize: "5px 5px",
      opacity: 0.9,
    }}
  />
);

// Opening frame 1: a space-gray MacBook (no Apple logo) starts fully closed,
// eases open, and the platform.ciaobang.com landing page powers on inside.
export const IntroLaptop: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useAuthorFrame();

  // Hold closed for a beat, then the lid swings open about the back hinge.
  // Closed = lid folded forward onto the deck (coplanar => -(180 - DECK_TILT))
  // with the aluminium back facing up; open = standing, slightly reclined.
  const CLOSED_ANGLE = -(180 - DECK_TILT); // -118: coplanar with the deck
  const OPEN_ANGLE = -6; // standing, a touch of recline
  // One smooth, even swing. An ease-in-out gives a symmetric, bell-shaped
  // angular velocity: the lid lifts gently off the deck, cruises through the
  // middle, and settles — without the long decelerating "crawl" the previous
  // heavily-overdamped spring (damping 200) left in the last ~14°, which read as
  // the lid slowing to a near-stop. The motion then flows straight into the
  // camera dive below, so the opening never stalls-and-resumes.
  const open = interpolate(frame, [14, 76], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const lidAngle = interpolate(open, [0, 1], [CLOSED_ANGLE, OPEN_ANGLE]);

  // A small lift keeps the closed (coplanar) lid clear of the deck plane so it
  // doesn't z-fight / get occluded. It must vanish the instant the lid starts
  // opening, otherwise the hinge edge detaches from the deck and a gap shows.
  const lidLift = interpolate(open, [0, 0.1], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dive the camera into the display to hand off to Hero. The push now *overlaps*
  // the tail of the lid opening — it starts at frame 48, while the lid is still
  // settling, and ramps up with a gentle ease-in — so apparent motion flows
  // straight from "lid swinging" into "camera flying in" with nothing in
  // between. The old version held a flat ≈1.08 lean from frame 73→91 (after the
  // lid had already finished), which read as a dead pause before the dive kicked
  // in: the "rallentamento poi riprende". The zoom origin sits high, on the
  // screen body (≈50% / 26% of the 1920×1080 frame), so we fly *into* the display
  // and the keyboard deck drops out of frame rather than staying centred.
  // The push ends right as the display fills the frame (≈2.3× the rig), so the
  // homepage on the screen lands at ~1:1 — the same size <Hero/> opens at. Going
  // deeper would blow the page up past frame size and pop on the cut.
  const riseY = interpolate(open, [0, 1], [50, 0]);
  const pushIn = interpolate(frame, [48, INTRO_DURATION], [1, 2.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  // Scene entrance: the whole machine "spunta dal basso" — it slides up into the
  // centre from below the frame as the <SearchIntro/> search box (handed off
  // from) shrinks and rides up off the top. Done well before the lid opens.
  const enterY = interpolate(frame, [0, 26], [1180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Screen powers on as soon as the lid starts swinging open — the content is
  // already glowing inside while the laptop is barely cracked, and reaches full
  // brightness by the time it's ~40% open (rather than only once nearly open).
  const screenOn = interpolate(open, [0.04, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrapper durationInFrames={durationInFrames} fadeIn={10} fadeOut={16}>
      <div
        style={{
          width: 1920,
          height: 1080,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1900,
          perspectiveOrigin: "50% 38%",
          transform: `translateY(${enterY}px) scale(${pushIn})`,
          transformOrigin: "50% 26%",
        }}
      >
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `translateY(${RIG_DROP + riseY}px) scale(${RIG_SCALE})`,
          }}
        >
          {/* contact shadow on the table */}
          <div
            style={{
              position: "absolute",
              left: -DECK_W / 2 - 80,
              width: DECK_W + 160,
              top: DECK_DEPTH * 0.3,
              height: 190,
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)",
              filter: "blur(26px)",
              transform: "translateZ(-4px)",
            }}
          />

          {/* ---- base / keyboard deck ---- */}
          <div
            style={{
              position: "absolute",
              left: -DECK_W / 2,
              top: 0,
              width: DECK_W,
              height: DECK_DEPTH,
              transformOrigin: "center top",
              transform: `rotateX(${DECK_TILT}deg)`,
              borderRadius: "10px 10px 34px 34px",
              background: `linear-gradient(180deg, ${ALU_LIGHT} 0%, ${ALU_MID} 42%, ${ALU_DARK} 100%)`,
              boxShadow:
                "inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -18px 36px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.15)",
            }}
          >
            <SpeakerGrille side="left" />
            <SpeakerGrille side="right" />
            <Keyboard />
            {/* trackpad */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: "10%",
                width: "34%",
                height: "26%",
                borderRadius: 12,
                background: "linear-gradient(180deg, #bbbfc6 0%, #a3a7af 100%)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -2px 5px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            />
            {/* front finger groove (Mac.svg paint5) */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 6,
                width: 170,
                height: 14,
                borderRadius: "0 0 9px 9px",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.04))",
              }}
            />
          </div>

          {/* ---- lid: hinged at the back edge (shared with the deck). Body
               stands above the hinge; folds forward onto the deck when closed.
               +z front face = display (seen when open); -z back face =
               aluminium (seen from above when closed). translateZ lifts the
               closed lid clear of the deck plane to avoid z-fighting. */}
          <div
            style={{
              position: "absolute",
              left: -LID_W / 2,
              top: -LID_H,
              width: LID_W,
              height: LID_H,
              transformOrigin: "center bottom",
              transform: `rotateX(${lidAngle}deg) translateZ(${lidLift}px)`,
              transformStyle: "preserve-3d",
              borderRadius: 24,
            }}
          >
            {/* aluminium back (-z) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                borderRadius: 24,
                background: `linear-gradient(180deg, ${LID_BACK_TOP} 0%, ${LID_BACK_BOT} 100%)`,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 24,
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 74%, rgba(255,255,255,0.06) 100%)",
                }}
              />
              {/* Waving-hand mark on the lid back, shown in its own colours. The
                  back face is rotateY(180), so scaleX(-1) makes the mark read the
                  right way round. No colour filter — it keeps its olive ink. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "scaleX(-1)",
                }}
              >
                <Img
                  src={staticFile("survey.png")}
                  style={{
                    width: 150,
                    height: "auto",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                    opacity: 0.92,
                  }}
                />
              </div>
            </div>

            {/* display (+z front) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                borderRadius: 24,
                background: `linear-gradient(180deg, #2a2c31 0%, #1d1f23 100%)`,
                boxShadow:
                  "0 38px 84px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
                padding: BEZEL,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: BEZEL_COL,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: screenOn,
                    filter: `brightness(${interpolate(
                      screenOn,
                      [0, 1],
                      [0.2, 1],
                    )})`,
                  }}
                >
                  {/* Live screen, authored as a faithful 1920×1080 miniature of
                      <Hero/>'s frame so the camera's dive out of the display lands
                      on a pixel-identical layout (no swap of UIs). The 16:9 panel
                      matches the 16:9 frame <Hero/> fills; the whole stack is built
                      at 1920×1080 and scaled 0.602 to fit the 1156×650 panel. The
                      layer order mirrors <Hero/> exactly: the moving-sea shader
                      (background-30s, from the 4s mark) at the back, then the warm
                      hero-sun <ShellCard/> (the SAME warm backdrop <Hero/> sits on,
                      previously missing here — which is why the screen used to read
                      cold blue instead of <Hero/>'s warm cream), then the page. The
                      page holds at the top while the laptop opens and the camera
                      dives in; <Hero/> picks up the same sea + page and scrolls it
                      once it has landed, so the hand-off is seamless. */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 1920,
                      height: 1080,
                      transform: "translate(-50%, -50%) scale(0.602)",
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Light base behind the sea video: matches the SeaShader's
                        near-white (#eef0f4) base, so before the video's first
                        frame is decoded (the laptop's opening frames / preview
                        scrubbing) the screen reads white like the live site
                        rather than letting the black bezel show through the
                        still-transparent page. */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#eef0f4",
                      }}
                    />
                    <OffthreadVideo
                      src={staticFile("background-30s.webm")}
                      muted
                      trimBefore={SEA_TRIM}
                      // Don't let a transient preview seek error throw a
                      // MediaPlaybackError and crash the player; recover on the next
                      // frame. Re-throw during a real render so a missing frame never
                      // silently corrupts the output.
                      onError={(e) => {
                        if (getRemotionEnvironment().isRendering) {
                          throw e;
                        }
                        console.warn("Laptop backdrop video failed in preview.", e);
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {/* Warm hero-sun card over the sea. <Hero/> gets the same
                        backdrop from the global <ShellCard/> in <CiaoVideo/>, where
                        the full-frame sea on top mutes the aura to a neutral warm
                        cream; here the sea sits behind, so the card is held at a
                        matching partial opacity to land on the same muted warmth
                        rather than a stronger peach glow. */}
                    <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
                      <ShellCard />
                    </div>
                    <HomeScreen />
                  </div>
                </div>
                {/* screen glare */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(118deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 34%)",
                    pointerEvents: "none",
                  }}
                />
                {/* notch */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 156,
                    height: 21,
                    background: BEZEL_COL,
                    borderRadius: "0 0 12px 12px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
};
