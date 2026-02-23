"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type SidebarCtx = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);

  const value = useMemo(() => ({ expanded, setExpanded, hidden, setHidden }), [expanded, hidden]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}