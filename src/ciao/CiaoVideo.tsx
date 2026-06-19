import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  Series,
  staticFile,
} from "remotion";
import { RENDER_FPS, tl } from "./timing";
import { loadCiaoFonts } from "./fonts";
import { Background } from "./Background";
import {
  SearchIntro,
  SEARCH_INTRO_DURATION,
  SEARCH_EXIT_START,
} from "./scenes/SearchIntro";
import { IntroLaptop, INTRO_DURATION } from "./scenes/IntroLaptop";
import { Hero, HERO_DURATION } from "./scenes/Hero";
import { SurveyQuestion, SURVEY_DURATION } from "./scenes/SurveyQuestion";
import { Interlude, INTERLUDE_DURATION } from "./scenes/Interlude";
import { Dashboard, DASHBOARD_DURATION } from "./scenes/Dashboard";
import { ChatBridge, CHAT_BRIDGE_DURATION } from "./scenes/ChatBridge";
import { Chat, CHAT_DURATION } from "./scenes/Chat";

export const SCENES = {
  intro: INTRO_DURATION,
  hero: HERO_DURATION,
  survey: SURVEY_DURATION,
  interlude: INTERLUDE_DURATION,
  dashboard: DASHBOARD_DURATION,
  chatBridge: CHAT_BRIDGE_DURATION,
  chat: CHAT_DURATION,
} as const;

export const TOTAL_DURATION =
  SCENES.intro +
  SCENES.hero +
  SCENES.survey +
  SCENES.interlude +
  SCENES.dashboard +
  SCENES.chatBridge +
  SCENES.chat;

// The film opens on the platform.ciaobang.com search box (<SearchIntro/>): it
// sits centred and large, types the URL, then hands off to the laptop. As the
// box shrinks and slides up off the top, the laptop <Series/> rises in from the
// bottom and its lid opens. To overlap the two, the laptop content is offset to
// begin at LAPTOP_START — the same author frame the search box starts its exit —
// so the box is still riding up while the laptop is already entering.
export const LAPTOP_START = SEARCH_EXIT_START;
export const PLAYBACK_DURATION = tl(LAPTOP_START) + tl(TOTAL_DURATION);

export const CiaoVideo: React.FC = () => {
  loadCiaoFonts();
  // The warm hero-sun aura + card belong only to the hero (home) scene, where
  // <Hero/> now renders the <ShellCard/> itself — layered over its sea video and
  // locked to the homepage through the zoom (matching the laptop screen's own
  // stack), so the framed sun stays visible across the dive out of the laptop.
  // The intro laptop scene and the survey/dashboard/chat scenes sit on the bare
  // moving-cloud <Background/>.

  // Soundtrack — plays across the whole film and eases its volume down over the
  // final FADE_OUT seconds so the music lands softly on the last frame instead
  // of cutting off abruptly.
  const FADE_OUT = Math.round(2.5 * RENDER_FPS);

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("Funkster.mp3")}
        volume={(frame) =>
          interpolate(
            frame,
            [PLAYBACK_DURATION - FADE_OUT, PLAYBACK_DURATION],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <Background />
      {/* Opening search box — top layer. Plays from the first frame and overlaps
          the laptop's entrance while it shrinks and rides up off the top. */}
      <Sequence
        durationInFrames={tl(SEARCH_INTRO_DURATION)}
        style={{ zIndex: 10 }}
      >
        <SearchIntro durationInFrames={SEARCH_INTRO_DURATION} />
      </Sequence>
      <Sequence from={tl(LAPTOP_START)}>
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
        <Series.Sequence durationInFrames={tl(SCENES.interlude)}>
          <Interlude durationInFrames={SCENES.interlude} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.dashboard)}>
          <Dashboard durationInFrames={SCENES.dashboard} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.chatBridge)}>
          <ChatBridge durationInFrames={SCENES.chatBridge} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={tl(SCENES.chat)}>
          <Chat durationInFrames={SCENES.chat} />
        </Series.Sequence>
        </Series>
      </Sequence>
    </AbsoluteFill>
  );
};
