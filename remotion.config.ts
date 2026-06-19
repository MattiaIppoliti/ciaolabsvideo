/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);

// The Hero/IntroLaptop backdrops extract frames from background-30s.mp4 via
// <OffthreadVideo>. Seeking + decoding a frame can occasionally exceed the
// default 30s delayRender timeout on a cold cache or busy disk, which fails the
// whole render. Give those video-frame fetches extra headroom so a slow seek
// retries instead of aborting.
Config.setDelayRenderTimeoutInMilliseconds(120000);

// The <SeaShader> backdrop runs a real WebGL (OGL) shader. The headless render
// browser has no WebGL context by default, so getContext("webgl") returns null
// and the shader crashes ("Cannot set properties of null (setting 'renderer')").
// Enable an OpenGL backend so the renderer gets a real WebGL context. "angle"
// is hardware-accelerated and recommended for local rendering; switch to
// "swangle" if a headless/CI machine has no usable GPU.
Config.setChromiumOpenGlRenderer("angle");
