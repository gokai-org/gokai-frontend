"use client";

import { ToastProvider } from "@/shared/ui/ToastProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
