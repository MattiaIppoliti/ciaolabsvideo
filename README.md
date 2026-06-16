# ciaolabsvideo

Remotion hero video for **platform.ciaobang.com** — 4 scenes that mirror the
landing page, the personality survey, the results dashboard and the Ask Ciao!
chat. Same scaffold as `myvideo/` (LAI), rebranded to the Ciao! Clay palette
and `UncutSans` typeface.

## Run

```bash
pnpm install
pnpm dev     # opens Remotion studio at http://localhost:3000
pnpm render  # writes out/ciao.mp4
```

## Stack

- Remotion 4.0.468, React 19
- Tailwind v4 (just for the global reset)
- UncutSans-Variable + Ciao! brand assets in `public/`

## Structure

```
src/
  Root.tsx              composition registration
  ciao/
    CiaoVideo.tsx       Series of the 4 scenes
    Background.tsx      cream + sunburst backdrop
    BrowserFrame.tsx    Safari-style chrome around each app screen
    CiaoLogo.tsx        sparkle + "Ciao!" lockup
    Typewriter.tsx      frame-driven typing
    SceneWrapper.tsx    cross-fade boundary
    theme.ts            Clay palette + scene data
    timing.ts           30fps authored / 60fps rendered bridge
    fonts.ts            UncutSans loader
    scenes/
      Hero.tsx              landing
      SurveyQuestion.tsx    "I rarely worry." + Likert grid
      Dashboard.tsx         gauges + top traits
      Chat.tsx              Ask Ciao! conversation
```

Authored at 30fps, rendered at 60fps — wrap any timeline-frame value in
`tl()`.

Total duration: 730 authored frames (~24s at 30fps) → 1460 render frames.
