"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function ContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isChatbot = pathname === "/dashboard/chatbot";

  // Padding fijo para el sidebar colapsado
  const padDesktop = "lg:pl-[140px]";
  const padMd = "md:pl-[120px]";

  if (isChatbot) {
    return (
      <main className={["h-screen bg-white overflow-hidden", padMd, padDesktop].join(" ")}>
        {children}
      </main>
    );
  }

  return (
    <main className={["min-h-dvh bg-white px-4 md:px-6 py-6", padMd, padDesktop].join(" ")}>
      <div>
        {children}
      </div>
    </main>
  );
}
