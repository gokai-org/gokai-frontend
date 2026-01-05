"use client";

import React from "react";
import { useSidebar } from "@/components/navigation/sidebar-context";

export default function ContentShell({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();

  const padDesktop = expanded ? "lg:pl-[380px]" : "lg:pl-[140px]";
  const padMd = expanded ? "md:pl-[360px]" : "md:pl-[120px]";

  return (
    <main className={["min-h-dvh bg-white px-4 md:px-6 py-6", padMd, padDesktop].join(" ")}>
      <div>
        {children}
      </div>
    </main>
  );
}
