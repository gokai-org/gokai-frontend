"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { MiniGokaDock } from "@/features/dashboard/components/MiniGokaDock";
import { subscribeLibraryDockVisibility } from "@/features/library/utils/libraryDockVisibility";

export default function ContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showLibraryMiniDock, setShowLibraryMiniDock] = useState(false);

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
    isChatbot ||
    isReviews ||
    isGrammarBoard ||
    isKanjiBoard ||
    (isLibrary && showLibraryMiniDock);

  useEffect(() => {
    if (!isLibrary) {
      return;
    }

    return subscribeLibraryDockVisibility(({ categoryId }) => {
      setShowLibraryMiniDock(
        categoryId === "kanji" || categoryId === "grammar",
      );
    });
  }, [isLibrary]);

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
        <AnimatePresence>
          {shouldShowMiniProfile && (
            <motion.div
              className="pointer-events-none fixed right-2 top-2 z-[70] md:right-3 md:top-3 lg:right-8 lg:top-4"
              initial={false}
              exit={{ opacity: 1 }}
            >
              <div className="pointer-events-auto">
                <MiniGokaDock />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
