import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "GOKAI",
    short_name: "GOKAI",
    description: "Plataforma de aprendizaje de japonés con IA y rutas dinámicas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f2ee",
    theme_color: "#ab3b35",
    icons: [
      {
        src: "/logos/gokai-logo-web.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}