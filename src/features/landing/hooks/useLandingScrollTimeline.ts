"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LandingScrollTimeline, LandingViewportState } from "@/features/landing/types";
import { clamp, smoothstep } from "@/features/landing/lib/landingSceneMath";

function getViewportState(): LandingViewportState {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      dpr: 1,
      isMobile: false,
      isTablet: false,
      reducedMotion: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1200,
    reducedMotion:
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  };
}

export function useLandingScrollTimeline(sectionIds: string[]): LandingScrollTimeline {
  const ids = useMemo(() => sectionIds, [sectionIds]);
  const frameRef = useRef<number | null>(null);

  const [timeline, setTimeline] = useState<LandingScrollTimeline>({
    activeId: ids[0] ?? "inicio",
    nextId: ids[1] ?? null,
    globalProgress: 0,
    activeProgress: 0,
    blendToNext: 0,
    sections: {},
    viewport: getViewportState(),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      frameRef.current = null;

      const viewport = getViewportState();
      const scrollY = window.scrollY || 0;
      const viewportCenter = scrollY + viewport.height * 0.52;
      const totalScrollable = Math.max(
        1,
        document.documentElement.scrollHeight - viewport.height,
      );

      const sections = Object.fromEntries(
        ids.map((id) => {
          const element = document.getElementById(id);
          if (!element) {
            return [
              id,
              {
                id,
                top: 0,
                height: viewport.height,
                progress: 0,
                focus: 0,
                viewportOffset: 0,
              },
            ];
          }

          const rect = element.getBoundingClientRect();
          const top = scrollY + rect.top;
          const height = Math.max(rect.height, viewport.height * 0.78);
          const start = top - viewport.height * 0.72;
          const end = top + height - viewport.height * 0.3;
          const progress = clamp((scrollY - start) / Math.max(1, end - start), 0, 1);
          const center = top + height / 2;
          const distance = Math.abs(viewportCenter - center);
          const focus = clamp(1 - distance / (height * 0.55 + viewport.height * 0.35), 0, 1);

          return [
            id,
            {
              id,
              top,
              height,
              progress,
              focus,
              viewportOffset: rect.top,
            },
          ];
        }),
      );

      const activeId =
        ids
          .slice()
          .sort((left, right) => (sections[right]?.focus ?? 0) - (sections[left]?.focus ?? 0))[0] ??
        ids[0] ??
        "inicio";

      const activeIndex = Math.max(0, ids.indexOf(activeId));
      const nextId = ids[activeIndex + 1] ?? null;
      const activeProgress = sections[activeId]?.progress ?? 0;

      setTimeline({
        activeId,
        nextId,
        globalProgress: clamp(scrollY / totalScrollable, 0, 1),
        activeProgress,
        blendToNext: smoothstep(0.22, 0.88, activeProgress),
        sections,
        viewport,
      });
    };

    const requestUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [ids]);

  return timeline;
}