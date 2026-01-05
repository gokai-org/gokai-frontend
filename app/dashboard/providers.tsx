"use client";

import React from "react";
import { SidebarProvider } from "@/components/navigation/sidebar-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}