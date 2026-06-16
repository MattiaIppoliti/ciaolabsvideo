import React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";

// The live platform.ciaobang.com ambient backdrop — the site's real
// `serendipity-ogl` WebGL shader (the slow-moving "sea" of soft clouds with the
// dotted grid baked in). This is a direct port of the app's
// AnimatedGradientBackdrop: it runs the exact same shader, so the video matches
// the live site pixel-for-pixel and there is no <video> to decode/seek in the
// Studio preview.
//
// The shader's uTime is driven by the requestAnimationFrame timestamp, which
// Remotion mocks deterministically during rendering — so the sea advances in
// lock-step with the frame being rendered and the output is reproducible.

type SerendipityUniform = { value: number };
type SerendipityResolutionUniform = { value: [number, number] };
type SerendipityOgl = {
  initialize: (host: HTMLElement) => void;
  dispose: () => void;
  program: {
    uniforms: {
      uResolution: SerendipityResolutionUniform;
      uSpeed: SerendipityUniform;
      uScale: SerendipityUniform;
      uRed: SerendipityUniform;
      uGreen: SerendipityUniform;
      uBlue: SerendipityUniform;
      uIntensity: SerendipityUniform;
      uBackgroundRed: SerendipityUniform;
      uBackgroundGreen: SerendipityUniform;
      uBackgroundBlue: SerendipityUniform;
      uInterpolation: SerendipityUniform;
      uPattern: SerendipityUniform;
    };
  };
};

declare global {
  interface Window {
    serendipity_ogl?: SerendipityOgl;
  }
}

// Resolve through staticFile so it works in the Studio preview AND in a render
// (the renderer serves public/ from a hashed base, not from "/scripts/...").
const SCRIPT_SRC = staticFile("scripts/serendipity-ogl.min.js");
const SCRIPT_ID = "serendipity-ogl-script";

// The site's light-theme preset (lifted verbatim from the app).
const LIGHT_PRESET = {
  uSpeed: 0.6,
  uScale: 2.7,
  uRed: 0.9,
  uGreen: 0.95,
  uBlue: 1,
  uIntensity: 1.8,
  uBackgroundRed: 0.07,
  uBackgroundGreen: 0.05,
  uBackgroundBlue: 0.13,
  uInterpolation: 0.5,
  uPattern: 0.13,
};

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.serendipity_ogl) return Promise.resolve();

  const existing = document.getElementById(
    SCRIPT_ID,
  ) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "true") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("serendipity load failed")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("serendipity load failed")),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

function applyPreset(lib: SerendipityOgl) {
  const { uniforms } = lib.program;
  uniforms.uSpeed.value = LIGHT_PRESET.uSpeed;
  uniforms.uScale.value = LIGHT_PRESET.uScale;
  uniforms.uRed.value = LIGHT_PRESET.uRed;
  uniforms.uGreen.value = LIGHT_PRESET.uGreen;
  uniforms.uBlue.value = LIGHT_PRESET.uBlue;
  uniforms.uIntensity.value = LIGHT_PRESET.uIntensity;
  uniforms.uBackgroundRed.value = LIGHT_PRESET.uBackgroundRed;
  uniforms.uBackgroundGreen.value = LIGHT_PRESET.uBackgroundGreen;
  uniforms.uBackgroundBlue.value = LIGHT_PRESET.uBackgroundBlue;
  uniforms.uInterpolation.value = LIGHT_PRESET.uInterpolation;
  uniforms.uPattern.value = LIGHT_PRESET.uPattern;
}

// The serendipity-ogl renderer derives its canvas size, drawing-buffer size, GL
// viewport (re-applied EVERY frame from the renderer's internal width/height)
// and the uResolution uniform from window.innerWidth/innerHeight. Inside
// Remotion the composition frame is fixed (1920x1080) and is NOT the browser
// window, so the shader only ever covers a window-sized rectangle — leaving the
// rest of the frame empty. We pin the dimensions the library reads to the
// composition size so it fills the whole frame, and keep the override in place
// so the library's own "resize" handler keeps sizing to the frame too.
function pinWindowSize(
  win: Window,
  width: number,
  height: number,
): () => void {
  const prevW = Object.getOwnPropertyDescriptor(win, "innerWidth");
  const prevH = Object.getOwnPropertyDescriptor(win, "innerHeight");
  Object.defineProperty(win, "innerWidth", {
    configurable: true,
    get: () => width,
  });
  Object.defineProperty(win, "innerHeight", {
    configurable: true,
    get: () => height,
  });
  return () => {
    if (prevW) Object.defineProperty(win, "innerWidth", prevW);
    else delete (win as unknown as Record<string, unknown>).innerWidth;
    if (prevH) Object.defineProperty(win, "innerHeight", prevH);
    else delete (win as unknown as Record<string, unknown>).innerHeight;
  };
}

function fillFrame(host: HTMLElement, lib: SerendipityOgl) {
  const canvas = host.querySelector("canvas");
  if (canvas) {
    // Stretch the canvas across the whole host as a belt-and-suspenders guard,
    // regardless of the px size the library assigned to its style.
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
  }
  // uResolution is only initialised once (at script load) and never updated on
  // resize, so set it explicitly to the composition aspect.
  const uResolution = lib.program?.uniforms?.uResolution;
  if (uResolution) uResolution.value = [host.clientWidth, host.clientHeight];
}

export const SeaShader: React.FC = () => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const { width, height } = useVideoConfig();
  const [handle] = React.useState(() =>
    delayRender("serendipity-ogl shader init"),
  );

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      continueRender(handle);
      return;
    }

    let cancelled = false;
    let unpin: (() => void) | null = null;
    loadScript()
      .then(() => {
        if (cancelled) return;
        const lib = window.serendipity_ogl;
        if (lib) {
          try {
            // Pin BEFORE initialize(): the library's init runs its first resize
            // synchronously, sizing everything to the composition frame.
            unpin = pinWindowSize(window, width, height);
            lib.initialize(host);
            applyPreset(lib);
            fillFrame(host, lib);
          } catch (err) {
            console.error("SeaShader init failed", err);
          }
        }
        continueRender(handle);
      })
      .catch((err) => {
        console.error("SeaShader script load failed", err);
        continueRender(handle);
      });

    return () => {
      cancelled = true;
      const lib = window.serendipity_ogl;
      if (lib) {
        try {
          lib.dispose();
        } catch {
          /* ignore */
        }
      }
      host.querySelectorAll("canvas").forEach((c) => c.remove());
      unpin?.();
    };
  }, [handle, width, height]);

  return (
    <AbsoluteFill style={{ background: "#eef0f4" }}>
      <div
        ref={hostRef}
        aria-hidden="true"
        style={{ width: "100%", height: "100%", position: "relative" }}
      />
    </AbsoluteFill>
  );
};
