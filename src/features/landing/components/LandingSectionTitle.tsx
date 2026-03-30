"use client";

interface LandingSectionTitleProps {
  id: string;
  titleA?: string;
  titleB?: string;
  desc?: string;
  isCenter?: boolean;
}

export function LandingSectionTitle({
  id,
  titleA,
  titleB,
  desc,
  isCenter = false,
}: LandingSectionTitleProps) {
  if (id === "experiencia") {
    return (
      <div className="text-center">
        <p className="text-2xl font-extrabold text-accent md:text-4xl">
          Más que una app de idiomas
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          Una experiencia inteligente
        </h2>
      </div>
    );
  }

  if (id === "planes") {
    return (
      <div className="text-center">
        <p className="text-3xl font-extrabold text-accent md:text-5xl">
          Empieza gratis
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          Desbloquea todo con <span className="text-accent">GOKAI+</span>
        </h2>
      </div>
    );
  }

  if (id === "contacto") {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <span className="block text-accent">{titleA}</span>
          <span className="block">{titleB}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-content-secondary md:text-xl">
          {desc}
        </p>
      </div>
    );
  }

  return (
    <>
      <h2
        className={[
          "font-extrabold leading-[1.02] tracking-tight",
          isCenter
            ? id === "como-funciona"
              ? "text-4xl md:text-6xl lg:text-7xl"
              : "text-5xl md:text-7xl lg:text-8xl"
            : "text-5xl md:text-7xl",
        ].join(" ")}
      >
        <span className={isCenter ? "block lg:inline" : "block"}>{titleA}</span>
        <span
          className={
            isCenter
              ? "block text-accent lg:ml-3 lg:inline"
              : "block text-accent"
          }
        >
          {titleB}
        </span>
      </h2>

      <p
        className={[
          "leading-relaxed text-content-secondary",
          isCenter
            ? "mx-auto mt-3 max-w-3xl text-base md:text-xl"
            : "mt-6 text-lg md:text-2xl",
        ].join(" ")}
      >
        {desc}
      </p>
    </>
  );
}