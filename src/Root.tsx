import "./index.css";
import { Composition } from "remotion";
import { CiaoVideo, PLAYBACK_DURATION } from "./ciao/CiaoVideo";
import { RENDER_FPS } from "./ciao/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Ciao"
        component={CiaoVideo}
        durationInFrames={PLAYBACK_DURATION}
        fps={RENDER_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
