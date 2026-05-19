"use client";

import { useEffect } from "react";

export function useModalPageLock(active = true) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [active]);
}

export function stopModalEvent(event: {
  stopPropagation: () => void;
}) {
  event.stopPropagation();
}
