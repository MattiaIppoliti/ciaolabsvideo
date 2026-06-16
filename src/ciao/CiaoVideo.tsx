import React from "react";
import { AbsoluteFill, Sequence, Series } from "remotion";
import { tl } from "./timing";
import { loadCiaoFonts } from "./fonts";
import { Background } from "./Background";
import { ShellCard } from "./ShellCard";
import { IntroLaptop, INTRO_DURATION } from "./scenes/IntroLaptop";
import { Hero, HERO_DURATION } from "./scenes/Hero";
import { SurveyQuestion, SURVEY_DURATION } from "./scenes/SurveyQuestion";
import { Dashboard, DASHBOARD_DURATION } from "./scenes/Dashboard";
import { Chat, CHAT_DURATION } from "./scenes/Chat";

export const SCENES = {
  intro: INTRO_DURATION,
  hero: HERO_DURATION,
  survey: SURVEY_DURATION,
  dashboard: DASHBOARD_DURATION,
  chat: CHAT_DURATION,
} as const;

export const TOTAL_DURATION =
  SCENES.intro +
  SCENES.hero +
  SCENES.survey +
  SCENES.dashboard +
  SCENES.chat;

export const CiaoVideo: React.FC = () => {
  loadCiaoFonts();
  // The warm hero-sun aura + card belong only to the hero (home) scene. The
  // intro laptop scene and the survey/dashboard/chat scenes sit on the bare
  // moving-cloud <Background/>, so the aura is scoped to the hero window and
  // eases in/out at its boundaries.
  const HERO_FROM = tl(SCENES.intro);
  const HERO_LEN = tl(SCENES.hero);

  return (
    <AbsoluteFill>
      <Background />
      <Sequence from={HERO_FROM} durationInFrames={HERO_LEN}>
        <ShellCard
          durationInFrames={HERO_LEN}
          fadeIn={tl(12)}
          fadeOut={tl(14)}
        />
      </Sequence>
      <Series>
        <Series.Sequence durationInFrames={tl(SCENES.intro)}>
          <IntroLaptop durationInFrames={SCENES.intro} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.hero)}>
          <Hero durationInFrames={SCENES.hero} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.survey)}>
          <SurveyQuestion durationInFrames={SCENES.survey} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.dashboard)}>
          <Dashboard durationInFrames={SCENES.dashboard} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.chat)}>
          <Chat durationInFrames={SCENES.chat} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
