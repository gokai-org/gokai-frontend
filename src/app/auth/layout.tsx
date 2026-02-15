"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@/shared/ui/ToastProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <ToastProvider>{children}</ToastProvider>
    </GoogleOAuthProvider>
  );
}
