import React from "react";
import { useAuthorFrame } from "./timing";
import { COLORS } from "./theme";

// Simple frame-driven typewriter — types `text` at `cps` chars per second
// (authored 30fps frames). `start` = first authored frame the type begins.
export const Typewriter: React.FC<{
  text: string;
  start?: number;
  cps?: number;
  caret?: boolean;
  caretColor?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  start = 0,
  cps = 28,
  caret = true,
  caretColor = COLORS.ink,
  style,
}) => {
  const frame = useAuthorFrame();
  const t = Math.max(0, frame - start);
  const total = text.length;
  const shown = Math.min(total, Math.floor((t / 30) * cps));
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {text.slice(0, shown)}
      {caret && shown < total && (
        <span
          style={{
            display: "inline-block",
            width: "0.55ch",
            height: "1em",
            background: caretColor,
            marginLeft: 2,
            transform: "translateY(0.18em)",
            opacity: blink ? 1 : 0.2,
          }}
        />
      )}
    </span>
  );
};
