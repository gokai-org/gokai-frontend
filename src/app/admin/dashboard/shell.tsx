"use client";

import React from "react";

export default function AdminContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const padDesktop = "lg:pl-[140px]";
  const padMd = "md:pl-[120px]";

  return (
    <main
      className={[
        "h-dvh overflow-hidden bg-surface-primary",
        padMd,
        padDesktop,
      ].join(" ")}
    >
      {children}
    </main>
  );
}
