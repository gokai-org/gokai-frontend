"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HOW_TABS,
  SECTIONS,
  type HowTabId,
} from "@/features/landing/data/landingData";
import { useLandingActiveSection } from "@/features/landing/hooks/useLandingActiveSection";

export function useLandingPage() {
  const logoWrapRef = useRef<HTMLDivElement | null>(null);
  const howSectionRef = useRef<HTMLElement | null>(null);

  const { activeId } = useLandingActiveSection("inicio");
  const [showLogo, setShowLogo] = useState(true);
  const [howTab, setHowTab] = useState<HowTabId>("explora");

  const how = useMemo(
    () => HOW_TABS.find((tab) => tab.id === howTab)!,
    [howTab],
  );

  useEffect(() => {
    const rawHash = typeof window !== "undefined" ? window.location.hash : "";
    const hash = rawHash.replace("#", "");

    if (!hash) return;

    const exists = SECTIONS.some((section) => section.id === hash);
    if (!exists) return;

    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  useEffect(() => {
    let raf = 0;

    const updateLogoVisibility = () => {
      const element = howSectionRef.current;
      if (!element) return;

      const headerOffset = 86;
      const rect = element.getBoundingClientRect();
      const isBeforeHowSection = rect.top > headerOffset;

      setShowLogo(isBeforeHowSection);
    };

    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateLogoVisibility);
    };

    updateLogoVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateLogoVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateLogoVisibility);
    };
  }, []);

  useEffect(() => {
    let raf = 0;

    const handleScroll = () => {
      if (!showLogo || !logoWrapRef.current) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!logoWrapRef.current) return;

        const scrollY = window.scrollY || 0;
        const degrees = scrollY * 0.12;

        logoWrapRef.current.style.transform = `rotate(${degrees}deg)`;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showLogo]);

  const isCenterMode =
    (SECTIONS.find((section) => section.id === activeId)?.layout ?? "split") ===
    "center";

  const showGraph =
    activeId === "como-funciona" ||
    activeId === "experiencia" ||
    activeId === "planes" ||
    activeId === "contacto";

  return {
    logoWrapRef,
    howSectionRef,
    activeId,
    showLogo,
    howTab,
    setHowTab,
    how,
    isCenterMode,
    showGraph,
  };
}