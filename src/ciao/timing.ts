import { useCurrentFrame } from "remotion";

export const AUTHOR_FPS = 30;
export const RENDER_FPS = 60;
export const TIME_SCALE = RENDER_FPS / AUTHOR_FPS;

export const tl = (authorFrames: number): number =>
  Math.round(authorFrames * TIME_SCALE);

export const useAuthorFrame = (): number =>
  useCurrentFrame() / TIME_SCALE;
