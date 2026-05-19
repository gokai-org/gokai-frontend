"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function AdminContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isSupport = pathname === "/admin/dashboard/support";
  const isKanji = pathname === "/admin/dashboard/kanji";
  const isLessons = pathname === "/admin/dashboard/lessons";
  const isVocabulary = pathname === "/admin/dashboard/vocabulary";
  const isStatistics = pathname === "/admin/dashboard/statistics";
  const isCoupons = pathname === "/admin/dashboard/coupons";

  const padDesktop = "lg:pl-[140px]";
  const padMd = "md:pl-[120px]";

  if (
    isSupport ||
    isKanji ||
    isLessons ||
    isVocabulary ||
    isStatistics ||
    isCoupons
  ) {
    return (
      <main
        className={[
          "h-screen bg-surface-primary overflow-hidden",
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
        "min-h-dvh bg-surface-primary px-4 md:px-6 py-6",
        padMd,
        padDesktop,
      ].join(" ")}
    >
      <div>{children}</div>
    </main>
  );
}
