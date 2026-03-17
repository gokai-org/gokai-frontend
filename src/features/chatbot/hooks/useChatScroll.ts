"use client";

import { RefObject, useEffect } from "react";

interface UseChatScrollParams {
  dependency: unknown;
  anchorRef: RefObject<HTMLDivElement | null>;
}

export function useChatScroll({
  dependency,
  anchorRef,
}: UseChatScrollParams) {
  useEffect(() => {
    anchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [dependency, anchorRef]);
}