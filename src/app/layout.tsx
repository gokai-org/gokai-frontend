import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GOKAI — Aprende japonés con IA",
  description: "Plataforma de aprendizaje de japonés con IA y rutas dinámicas.",
};

/** Inline script that runs before React hydration to prevent flash of wrong theme */
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('gokai-theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-surface-primary text-content-primary">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
