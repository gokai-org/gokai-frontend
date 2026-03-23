"use client";

import { useEffect } from "react";

export function AdminHistoryProtection() {
  useEffect(() => {
    let isProcessing = false;

    const handlePopState = () => {
      if (isProcessing) return;

      const currentPath = window.location.pathname;

      if (currentPath.startsWith("/admin/dashboard")) {
        isProcessing = true;
        window.history.pushState(null, "", currentPath);
        setTimeout(() => {
          isProcessing = false;
        }, 100);
      }
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
