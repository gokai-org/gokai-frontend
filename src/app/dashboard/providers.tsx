"use client";

import React from "react";
import { SidebarProvider } from "@/shared/components/SidebarContext";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { GuideTourProvider } from "@/features/help/components/GuideTourProvider";
import { GuideTourOverlay } from "@/features/help/components/GuideTourOverlay";
import { SettingsBootstrap } from "@/features/configuration/components/SettingsBootstrap";
import { TypographyProvider } from "@/shared/components/TypographyProvider";
import { MasteredModulesProvider } from "@/features/mastery/components/MasteredModulesProvider";
import { AuthenticatedUserGate } from "@/features/auth/components/AuthenticatedUserGate";
import { ProgressBootstrap } from "@/features/dashboard/components/ProgressBootstrap";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedUserGate>
      <SidebarProvider>
        <TypographyProvider>
          <ToastProvider>
            <GuideTourProvider>
              <MasteredModulesProvider>
                <SettingsBootstrap />
                <ProgressBootstrap />
                {children}
                <GuideTourOverlay />
              </MasteredModulesProvider>
            </GuideTourProvider>
          </ToastProvider>
        </TypographyProvider>
      </SidebarProvider>
    </AuthenticatedUserGate>
  );
}
