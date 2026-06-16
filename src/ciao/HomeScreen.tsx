import React from "react";
import { CiaoLogo } from "./CiaoLogo";
import { SURVEY_WIN, SurveyWindow } from "./SurveyWindow";
import { COLORS, FONTS, NAV_ITEMS } from "./theme";

// The survey preview's resting top-left in the 1920×1080 homepage. Centred
// horizontally, peeking up from the bottom edge; <Hero/> scrolls it from here to
// frame-centre. Shared so <Hero/>'s standalone survey window lines up exactly.
export const SURVEY_PREVIEW_LEFT = (1920 - SURVEY_WIN.width) / 2; // 220
export const SURVEY_PREVIEW_TOP = 760;

// The platform.ciaobang.com landing page, authored once at the full 1920×1080
// frame size and fully self-contained (it carries its own warm hero aura). It
// is rendered both full-frame by <Hero/> and, scaled down, inside the laptop
// display in <IntroLaptop/>. Because the two placements share this exact
// component, the camera's dive into the laptop screen lands on a pixel-identical
// layout with no visible cut.
//
// The optional props drive <Hero/>'s entrance animation; their defaults are the
// settled state, which is what the laptop screen shows.
export const HomeScreen: React.FC<{
  headlineY?: number;
  headlineOpacity?: number;
  subOpacity?: number;
  ctaOpacity?: number;
  previewY?: number;
  showPreview?: boolean;
}> = ({
  headlineY = 0,
  headlineOpacity = 1,
  subOpacity = 1,
  ctaOpacity = 1,
  previewY = 0,
  showPreview = true,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // No clip of its own: the host (laptop panel / Hero frame) clips, and the
        // page is translated vertically to scroll, so its below-the-fold preview
        // must stay visible to be revealed.
        fontFamily: FONTS.sans,
        color: COLORS.ink,
      }}
    >
      {/* No background of its own — the page content is transparent so each
          host supplies the warm backdrop: <Hero/> keeps the global <ShellCard/>
          aura (unchanged from before), and the laptop draws its own matching
          warm backdrop behind this same content. */}

      {/* clean top band behind the nav, so the bar stays crisp and identical
          regardless of the aura behind it */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 172,
          background:
            "linear-gradient(180deg, rgba(250,249,247,0.97) 0%, rgba(250,249,247,0.86) 44%, rgba(250,249,247,0.42) 76%, rgba(250,249,247,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* nav bar */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 64,
          right: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <CiaoLogo size={44} />
        <div style={{ display: "flex", gap: 56 }}>
          {NAV_ITEMS.map((n) => (
            <div
              key={n.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 22,
                fontWeight: 600,
                color: COLORS.ink,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: n.dot,
                  display: "inline-block",
                }}
              />
              {n.label}
            </div>
          ))}
        </div>
        <div
          style={{
            background: COLORS.ink,
            color: COLORS.white,
            padding: "16px 28px",
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          Sign in to start →
        </div>
      </div>

      {/* headline */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 124,
            lineHeight: 1.04,
            letterSpacing: -2.5,
            margin: 0,
            padding: "0 120px",
            color: COLORS.ink,
          }}
        >
          A closer read of <em>who you are</em>,
          <br />
          one question at a time.
        </h1>
      </div>

      {/* subtitle */}
      <div
        style={{
          position: "absolute",
          top: 510,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: subOpacity,
          fontSize: 30,
          color: COLORS.inkSoft,
          fontWeight: 400,
        }}
      >
        Surveys to discover your personality and beliefs.
      </div>

      {/* CTAs */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 20,
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            background: COLORS.ink,
            color: COLORS.white,
            padding: "22px 38px",
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Sign in to start →
        </div>
        <div
          style={{
            background: COLORS.white,
            color: COLORS.ink,
            padding: "22px 38px",
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 600,
            border: `1.5px solid ${COLORS.lineStrong}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <GithubMark /> Star on GitHub
        </div>
      </div>

      {/* survey preview peeking from the bottom — the SAME <SurveyWindow/> the
          next scene opens on, so the camera's push into it lands on a
          pixel-identical layout (no swap of fake UIs). It scrolls up via
          `previewY`; <Hero/> rides it all the way to frame-centre. */}
      {showPreview && (
        <div
          style={{
            position: "absolute",
            left: SURVEY_PREVIEW_LEFT,
            top: SURVEY_PREVIEW_TOP,
            transform: `translateY(${previewY}px)`,
          }}
        >
          <SurveyWindow />
        </div>
      )}
    </div>
  );
};

const GithubMark: React.FC = () => (
  <div
    style={{
      width: 22,
      height: 22,
      borderRadius: 999,
      background: COLORS.ink,
    }}
  />
);
