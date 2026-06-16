import React, { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { COLORS, FONTS } from "./theme";

// The "Waving…" thinking indicator from the Ciao! chat. In the app
// (apps/survey ai-chat.tsx → ThinkingLottie, aria-label "Ciao! is waving") this
// is NOT a waving hand: it's the /loading.lottie animation — a morphing grey
// loader ring — sitting next to a label whose trailing dots cycle
// 3 → 2 → 1 → 2 every ~400ms. We render the very same Lottie here.
const DOT_COUNTS = [3, 2, 1, 2] as const;

export const WavingIndicator: React.FC<{ size?: number }> = ({ size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [handle] = useState(() => delayRender("Loading Ciao! waving Lottie"));
  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(staticFile("loading-lottie.json"))
      .then((res) => res.json())
      .then((json: LottieAnimationData) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle]);

  // 400ms per tick (matches the ai-chat setInterval cadence).
  const tick = Math.floor(frame / (fps * 0.4)) % DOT_COUNTS.length;
  const dots = ".".repeat(DOT_COUNTS[tick]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        role="img"
        aria-label="Ciao! is waving"
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop
            style={{ width: size, height: size }}
          />
        ) : null}
      </div>
      <span style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.muted }}>
        Waving
        {/* fixed-width slot so the label doesn't reflow as the dots cycle */}
        <span
          style={{ display: "inline-block", width: "1.6em", textAlign: "left" }}
        >
          {dots}
        </span>
      </span>
    </div>
  );
};
