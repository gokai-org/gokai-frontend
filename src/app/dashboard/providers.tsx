"use client";

import React from "react";
import { SidebarProvider } from "@/shared/components/SidebarContext";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { GuideTourProvider } from "@/features/help/components/GuideTourProvider";
import { GuideTourOverlay } from "@/features/help/components/GuideTourOverlay";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ToastProvider>
        <GuideTourProvider>
          {children}
          <GuideTourOverlay />
        </GuideTourProvider>
      </ToastProvider>
    </SidebarProvider>
  );
}
