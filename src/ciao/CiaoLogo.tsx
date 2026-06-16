import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// "👋 Ciao!" lockup — uses the brand sparkle SVG + "Ciao!" text in UncutSans.
// The sparkle "hand" waves back and forth (a friendly greeting): ~1.6 Hz, ±18°,
// pivoting near the wrist (bottom-centre).
export const CiaoLogo: React.FC<{ size?: number; dark?: boolean }> = ({
  size = 40,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // seconds
  const angle = Math.sin(t * Math.PI * 2 * 1.6) * 18;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      <Img
        src={staticFile(dark ? "ciao-sparkle-dark.svg" : "ciao-sparkle.svg")}
        style={{
          width: size * 1.1,
          height: size * 1.1,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "50% 80%",
        }}
      />
      <span
        style={{
          fontFamily: "UncutSans",
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -0.4,
          color: dark ? "#faf9f7" : "#000",
          lineHeight: 1,
        }}
      >
        Ciao!
      </span>
    </div>
  );
};
