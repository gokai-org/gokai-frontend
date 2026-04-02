import type { Metadata } from "next";
import { Montserrat, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { PlatformMotionProvider } from "@/shared/components/PlatformMotionProvider";
import { ThemeProvider } from "@/shared/components/ThemeProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GOKAI — Aprende japonés con IA",
  description: "Plataforma de aprendizaje de japonés con IA y rutas dinámicas.",
};

/** Inline script that runs before React hydration to prevent flash of wrong theme/font */
const themeInitScript = `
(function(){
  try {
    var d = document.documentElement;
    var t = localStorage.getItem('gokai-theme');
    if (t === 'dark') d.classList.add('dark');
    var fsMap = {"Pequeño":"small","Mediano":"medium","Grande":"large","Muy grande":"x-large"};
    var fs = localStorage.getItem('gokai-font-size');
    if (fs && fsMap[fs]) d.setAttribute('data-font-size', fsMap[fs]);
    var jpMap = {"Noto Sans JP":"noto","Hiragino":"hiragino","Yu Gothic":"yugothic","Meiryo":"meiryo"};
    var jp = localStorage.getItem('gokai-jp-font');
    if (jp && jpMap[jp]) d.setAttribute('data-jp-font', jpMap[jp]);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${notoSansJP.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-surface-primary text-content-primary">
        <ThemeProvider>
          <PlatformMotionProvider>{children}</PlatformMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
