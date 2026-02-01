"use client";

import React from "react";
import { SidebarProvider } from "@/components/navigation/sidebar-context";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SidebarProvider>
  );
}