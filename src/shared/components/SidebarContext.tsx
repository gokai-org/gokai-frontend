"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type SidebarCtx = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
  blurred: boolean;
  setBlurred: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [blurred, setBlurred] = useState(false);

  const value = useMemo(
    () => ({ expanded, setExpanded, hidden, setHidden, blurred, setBlurred }),
    [expanded, hidden, blurred],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
