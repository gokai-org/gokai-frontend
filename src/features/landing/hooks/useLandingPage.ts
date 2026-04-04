"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HOW_TABS,
  SECTIONS,
  type HowTabId,
} from "@/features/landing/data/landingData";
import { useLandingActiveSection } from "@/features/landing/hooks/useLandingActiveSection";

export function useLandingPage() {
  const { activeId } = useLandingActiveSection("inicio");
  const [howTab, setHowTab] = useState<HowTabId>("explora");

  const how = useMemo(
    () => HOW_TABS.find((tab) => tab.id === howTab)!,
    [howTab],
  );

  const sectionIds = useMemo(() => SECTIONS.map((section) => section.id), []);

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

  return {
    activeId,
    howTab,
    setHowTab,
    how,
    sectionIds,
  };
}
