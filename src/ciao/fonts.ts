import { continueRender, delayRender, staticFile } from "remotion";

// Loads UncutSans-Variable.ttf (the Ciao! brand sans) once per render.
let started = false;

export const loadCiaoFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;

  const handle = delayRender("Loading Ciao fonts");
  const face = new FontFace(
    "UncutSans",
    `url(${staticFile("UncutSans-Variable.ttf")})`,
    { weight: "100 900", style: "normal" },
  );
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      continueRender(handle);
    })
    .catch((err) => {
      console.warn("Ciao font load issue:", err);
      continueRender(handle);
    });
};
