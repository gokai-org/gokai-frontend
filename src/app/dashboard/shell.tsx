"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function ContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isChatbot = pathname === "/dashboard/chatbot";
  const isLibrary = pathname === "/dashboard/library";
  const isReviews = pathname === "/dashboard/reviews";
  const isGraph = pathname === "/dashboard/graph";
  const isStatistics = pathname === "/dashboard/statistics";
  const isHelp = pathname === "/dashboard/help";
  const isNotices = pathname === "/dashboard/notices";
  const isConfiguration = pathname === "/dashboard/configuration";

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
          "h-screen bg-white overflow-hidden",
          padMd,
          padDesktop,
        ].join(" ")}
      >
        {children}
      </main>
    );
  }

  return (
    <main
      className={[
        "min-h-dvh bg-white px-4 md:px-6 py-6",
        padMd,
        padDesktop,
      ].join(" ")}
    >
      <div>{children}</div>
    </main>
  );
}
