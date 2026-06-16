// Ciao! design tokens — Clay palette from apps/survey globals.css.
export const COLORS = {
  // Surfaces
  cream: "#faf9f7",
  oat: "#dad4c8",
  oatLight: "#eee9df",
  white: "#ffffff",
  black: "#000000",
  // Ink
  ink: "#000000",
  inkSoft: "#55534e",
  muted: "#9f9b93",
  // Accents (clay)
  matcha: "#84e7a5",
  matchaDeep: "#078a52",
  slushie: "#3bd3fd",
  slushieDeep: "#0089ad",
  lemon: "#fbbd41",
  lemonDeep: "#d08a11",
  ube: "#c1b0ff",
  ubeDeep: "#43089f",
  pomegranate: "#fc7981",
  blueberry: "#01418d",
  focus: "#146ef5",
  // Plot
  plotStart: "rgba(252,121,129,0.42)",
  plotEnd: "rgba(59,211,253,0.72)",
  // Geometry
  radiusCard: 24,
  radiusSection: 40,
  hardShadow: "-7px 7px 0 #000",
  softShadow:
    "0 1px 1px rgba(0,0,0,0.1), 0 -1px 1px rgba(0,0,0,0.04) inset, 0 -0.5px 1px rgba(0,0,0,0.05)",
  line: "rgba(218,212,200,0.9)",
  lineStrong: "#dad4c8",
} as const;

export const FONTS = {
  sans: 'UncutSans, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

// Tagline categories shown in the landing nav (see screenshot 1).
export const NAV_ITEMS = [
  { label: "Surveys", dot: COLORS.lemon },
  { label: "Dashboards", dot: COLORS.lemon },
  { label: "Chat", dot: COLORS.pomegranate },
] as const;

// Personality dashboard scores (see screenshot 3).
export const SCORES = [
  { trait: "Openness", value: 42, band: "High", color: COLORS.slushie },
  {
    trait: "Conscientiousness",
    value: 35,
    band: "Middle",
    color: COLORS.lemon,
  },
  { trait: "Extraversion", value: 18, band: "Low", color: COLORS.pomegranate },
] as const;

export const TOP_TRAITS = [
  { trait: "Fantasy", value: 45, color: COLORS.slushie },
  { trait: "Empathy", value: 36, color: COLORS.lemon },
  { trait: "Assertiveness", value: 16, color: COLORS.pomegranate },
] as const;

// Survey progress sidebar list (see screenshot 2). The active row (105) is the
// question shown in the question pane; the rest sit around it in the scroller.
export const SURVEY_LIST = [
  { num: 104, text: "I don't use harsh language." },
  { num: 105, text: "I am able to fix electrical-wiring problems." },
  { num: 106, text: "I enjoy games of strategy." },
  { num: 107, text: "I was a slow learner in school." },
  { num: 108, text: "I rarely feel blue." },
] as const;

export const LIKERT = [
  { n: 1, label: "Very inaccurate" },
  { n: 2, label: "Moderately inaccurate" },
  { n: 3, label: "Slightly inaccurate" },
  { n: 4, label: "Slightly accurate" },
  { n: 5, label: "Moderately accurate" },
  { n: 6, label: "Very accurate" },
] as const;

// "Response pattern" violin (screenshot 2): % of other respondents that chose
// each Likert option 1→6 for question 105. Sums to 100.
export const RESPONSE_PATTERN = [3, 15, 36, 32, 12, 2] as const;
