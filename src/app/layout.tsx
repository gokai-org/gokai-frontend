import type { Metadata } from "next";
import {
  Montserrat,
  Noto_Sans_JP,
  Noto_Serif_JP,
  Sawarabi_Mincho,
} from "next/font/google";
import "./globals.css";
import { PlatformMotionProvider } from "@/shared/components/PlatformMotionProvider";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { TypographyProvider } from "@/shared/components/TypographyProvider";

const siteIcon = "/logos/gokai-logo-web.svg";

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

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const sawarabiMincho = Sawarabi_Mincho({
  weight: "400",
  variable: "--font-sawarabi-mincho",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "GOKAI — Aprende japonés con IA",
  description: "Plataforma de aprendizaje de japonés con IA y rutas dinámicas.",
  icons: {
    icon: [{ url: siteIcon, type: "image/svg+xml" }],
    shortcut: [siteIcon],
    apple: [siteIcon],
  },
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
    var jpMap = {"Noto Sans JP":"noto","Noto Serif JP":"noto-serif","Hiragino":"noto-serif","Sawarabi Mincho":"sawarabi","Yu Gothic":"sawarabi","Meiryo":"meiryo"};
    var jp = localStorage.getItem('gokai-jp-font');
    if (jp && jpMap[jp]) {
      d.setAttribute('data-jp-font', jpMap[jp]);
      if (jp === 'Hiragino') localStorage.setItem('gokai-jp-font', 'Noto Serif JP');
      if (jp === 'Yu Gothic') localStorage.setItem('gokai-jp-font', 'Sawarabi Mincho');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${notoSansJP.variable} ${notoSerifJP.variable} ${sawarabiMincho.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-surface-primary text-content-primary">
        <ThemeProvider>
          <TypographyProvider>
            <PlatformMotionProvider>{children}</PlatformMotionProvider>
          </TypographyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
