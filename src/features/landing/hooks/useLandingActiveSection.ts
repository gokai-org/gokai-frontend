"use client";

import { useEffect, useState } from "react";

export function useLandingActiveSection(defaultSection = "inicio") {
  const [activeId, setActiveId] = useState<string>(defaultSection);

  useEffect(() => {
    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));

    let frame: number | null = null;

    const updateActiveByScroll = () => {
      frame = null;

      const sections = getSections();
      if (sections.length === 0) return;

      const scrollY = window.scrollY || 0;
      const headerOffset = 110;
      const marker = scrollY + headerOffset + window.innerHeight * 0.12;

      let nextActive = sections[0]?.id ?? defaultSection;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const top = scrollY + rect.top;
        const bottom = top + Math.max(rect.height, 1);

        if (marker >= top && marker < bottom) {
          nextActive = section.id;
        }
      }

      const first = sections[0];
      const last = sections[sections.length - 1];

      if (first) {
        const firstTop = scrollY + first.getBoundingClientRect().top;
        if (marker < firstTop) {
          nextActive = first.id;
        }
      }

      if (last) {
        const lastRect = last.getBoundingClientRect();
        const lastTop = scrollY + lastRect.top;
        const lastBottom = lastTop + Math.max(lastRect.height, 1);
        if (marker >= lastBottom) {
          nextActive = last.id;
        }
      }

      setActiveId((prev) => (prev === nextActive ? prev : nextActive));
    };

    const requestUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateActiveByScroll);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [defaultSection]);

  useEffect(() => {
    const updateFromHash = () => {
      const rawHash = typeof window !== "undefined" ? window.location.hash : "";
      const hash = rawHash.replace("#", "");

      if (!hash) {
        setActiveId(defaultSection);
        return;
      }

      const element = document.getElementById(hash);
      if (element) {
        setActiveId(hash);
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    return () => window.removeEventListener("hashchange", updateFromHash);
  }, [defaultSection]);

  return {
    activeId,
    setActiveId,
  };
}
