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
  const isLessons = pathname === "/admin/dashboard/lessons";
  const isStatistics = pathname === "/admin/dashboard/statistics";

  const padDesktop = "lg:pl-[140px]";
  const padMd = "md:pl-[120px]";

  if (isSupport || isLessons || isStatistics) {
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
