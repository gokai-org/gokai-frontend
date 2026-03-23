"use client";

import React from "react";
import { SidebarProvider } from "@/shared/components/SidebarContext";
import { ToastProvider } from "@/shared/ui/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ToastProvider>{children}</ToastProvider>
    </SidebarProvider>
  );
}
