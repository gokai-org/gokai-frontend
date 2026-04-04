"use client";

import { useEffect, useState } from "react";

export function useLandingActiveSection(defaultSection = "inicio") {
  const [activeId, setActiveId] = useState<string>(defaultSection);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]"),
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          )[0];

        if (visibleEntry?.target?.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        threshold: [0.25, 0.4, 0.55, 0.7],
        rootMargin: "-20% 0px -45% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

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
