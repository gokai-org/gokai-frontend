"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { MiniUserProfileDock } from "@/features/dashboard/components/MiniUserProfileDock";

export default function ContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChatbot = pathname === "/dashboard/chatbot";
  const isLibrary = pathname === "/dashboard/library";
  const isReviews = pathname === "/dashboard/reviews";
  const isGraph = pathname.startsWith("/dashboard/graph");
  const isGrammarBoard = pathname === "/dashboard/graph/grammar";
  const isKanjiBoard =
    pathname === "/dashboard/graph/kanjis" ||
    (pathname === "/dashboard/graph/writing" &&
      searchParams.get("tab") === "kanji");
  const isStatistics = pathname === "/dashboard/statistics";
  const isHelp = pathname === "/dashboard/help";
  const isNotices = pathname === "/dashboard/notices";
  const isConfiguration = pathname === "/dashboard/configuration";
  const shouldShowMiniProfile =
    isChatbot || isLibrary || isReviews || isGrammarBoard || isKanjiBoard;

  const padDesktop = "lg:pl-[140px]";
  const padMd = "md:pl-[120px]";

  // Full-height routes (no outer scroll)
  if (
    isChatbot ||
    isLibrary ||
    isReviews ||
    isGraph ||
    isStatistics ||
    isHelp ||
    isNotices ||
    isConfiguration
  ) {
    return (
      <main
        className={[
          "relative h-dvh bg-surface-primary overflow-hidden",
          padMd,
          padDesktop,
        ].join(" ")}
      >
        {shouldShowMiniProfile && (
          <div className="pointer-events-none fixed right-2 top-2 z-[70] md:right-3 md:top-3 lg:right-8 lg:top-4">
            <div className="pointer-events-auto">
              <MiniUserProfileDock />
            </div>
          </div>
        )}

        {children}
      </main>
    );
  }

  return (
    <main
      className={[
        "min-h-dvh bg-surface-primary px-4 md:px-6 py-6",
        padMd,
        padDesktop,
      ].join(" ")}
    >
      <div>{children}</div>
    </main>
  );
}
