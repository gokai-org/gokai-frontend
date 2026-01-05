"use client";

import React from "react";
import { useSidebar } from "@/components/navigation/sidebar-context";

export default function ContentShell({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();

  const padDesktop = expanded ? "lg:pl-[380px]" : "lg:pl-[140px]";
  const padMd = expanded ? "md:pl-[360px]" : "md:pl-[120px]";

  return (
    <main className={["h-dvh bg-white", padMd, padDesktop].join(" ")}>
      <div className="h-full overflow-y-auto px-4 py-6 md:px-6">
        {children}
      </div>
    </main>
  );
}
