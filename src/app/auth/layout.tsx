"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeModeToggle } from "@/shared/components";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { authConfig } from "@/shared/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={authConfig.publicGoogleClientId}>
      <ToastProvider>
        <ThemeModeToggle className="fixed right-4 top-4 z-50 md:right-6 md:top-6" />
        {children}
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}