"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { authConfig } from "@/shared/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={authConfig.publicGoogleClientId}>
      <ToastProvider>{children}</ToastProvider>
    </GoogleOAuthProvider>
  );
}