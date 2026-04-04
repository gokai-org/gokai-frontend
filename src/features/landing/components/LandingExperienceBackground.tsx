"use client";

interface LandingExperienceBackgroundProps {
  progress: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function ss(e0: number, e1: number, v: number) {
  const x = clamp((v - e0) / (e1 - e0 || 1), 0, 1);
  return x * x * (3 - 2 * x);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function LandingExperienceBackground({
  progress,
}: LandingExperienceBackgroundProps) {
  const panelRise = ss(0.06, 0.94, progress);
  const panelTranslate = lerp(90, 0, panelRise);
  const gridReveal = ss(0.28, 0.88, progress);
  const shadowOpacity = lerp(0.14, 0.01, panelRise);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Panel que sube desde abajo */}
      <div
        className="absolute inset-x-0 bottom-0 h-[130vh]"
        style={{
          transform: `translateY(${panelTranslate}vh)`,
          willChange: "transform",
        }}
      >
        {/* ── Base: blanco en light, negro de plataforma en dark ── */}
        <div className="absolute inset-0 rounded-t-[2.8rem] bg-white dark:bg-[#131313]" />

        {/* Sombra de borde al subir */}
        <div
          className="absolute inset-x-0 top-0 h-[18vh]"
          style={{
            opacity: shadowOpacity,
            background:
              "linear-gradient(180deg,rgba(0,0,0,0.14) 0%,rgba(0,0,0,0.04) 54%,rgba(0,0,0,0) 100%)",
          }}
        />

        {/* ── Grid idéntico al mapa de kanjis ── */}
        <div
          className="absolute inset-0 rounded-t-[2.8rem] overflow-hidden"
          style={{ opacity: gridReveal }}
        >
          {/* Líneas 160 px — tono rojo de la plataforma */}
          <div
            className="absolute inset-0 dark:opacity-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(153,51,49,0.13) 0.9px, transparent 0.9px), linear-gradient(90deg, rgba(153,51,49,0.13) 0.9px, transparent 0.9px)",
              backgroundSize: "160px 160px",
            }}
          />
          {/* Dark-mode override */}
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(rgba(186,72,69,0.10) 0.9px, transparent 0.9px), linear-gradient(90deg, rgba(186,72,69,0.10) 0.9px, transparent 0.9px)",
              backgroundSize: "160px 160px",
            }}
          />

          {/* Dots 480 px — tono rojo */}
          <div
            className="absolute inset-0 dark:opacity-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(153,51,49,0.20) 2.8px, transparent 2.8px)",
              backgroundSize: "480px 480px",
            }}
          />
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(186,72,69,0.16) 2.8px, transparent 2.8px)",
              backgroundSize: "480px 480px",
            }}
          />
        </div>

        {/* Glow de marca sutil */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(153,51,49,0.07),transparent_34%)]"
          style={{ opacity: lerp(0, 1, ss(0.58, 1.0, progress)) }}
        />
      </div>
    </div>
  );
}
