"use client";

import React from "react";
import { SidebarProvider } from "@/shared/components/SidebarContext";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { GuideTourProvider } from "@/features/help/components/GuideTourProvider";
import { GuideTourOverlay } from "@/features/help/components/GuideTourOverlay";
import { SettingsBootstrap } from "@/features/configuration/components/SettingsBootstrap";
import { TypographyProvider } from "@/shared/components/TypographyProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TypographyProvider>
        <ToastProvider>
          <GuideTourProvider>
            <SettingsBootstrap />
            {children}
            <GuideTourOverlay />
          </GuideTourProvider>
        </ToastProvider>
      </TypographyProvider>
    </SidebarProvider>
  );
}
