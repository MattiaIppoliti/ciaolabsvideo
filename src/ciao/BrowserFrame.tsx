import React from "react";
import { COLORS } from "./theme";

// Safari-style browser chrome used across the survey/dashboard/chat scenes.
export const BrowserFrame: React.FC<{
  url: string;
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ url, width, height, children, style }) => {
  return (
    <div
      style={{
        width,
        height,
        background: COLORS.white,
        borderRadius: 22,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.18), 0 2px 0 rgba(0,0,0,0.04) inset",
        border: `1px solid ${COLORS.lineStrong}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* title bar */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingInline: 22,
          borderBottom: `1px solid ${COLORS.line}`,
          background: COLORS.cream,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div
              key={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 18,
            color: COLORS.muted,
            fontSize: 18,
          }}
        >
          <span>‹</span>
          <span>›</span>
        </div>
        <div
          style={{
            flex: 1,
            margin: "0 14px",
            height: 32,
            borderRadius: 8,
            background: COLORS.oatLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.inkSoft,
            fontSize: 15,
            letterSpacing: 0.1,
          }}
        >
          {url}
        </div>
        <div style={{ color: COLORS.muted, fontSize: 22 }}>＋</div>
        <div style={{ color: COLORS.muted, fontSize: 22 }}>⧉</div>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
};
