import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="min-h-dvh overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}