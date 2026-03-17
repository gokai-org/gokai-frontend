"use client";

import { useMemo, useState } from "react";
import SupportContactForm from "@/features/support/components/SupportContactForm";
import { useGuideTour } from "@/features/help/components/GuideTourProvider";
import { getTourByIndex } from "@/features/help/components/tourData";
import { HELP_FAQS } from "@/features/help/utils/help.constants";
import type { HelpTabKey } from "@/features/help/types";

export function useHelpPage() {
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<HelpTabKey>("guides");
  const [supportOpen, setSupportOpen] = useState(false);

  const { startTour } = useGuideTour();

  const handleStartGuide = (tourIndex: number) => {
    const tour = getTourByIndex(tourIndex);
    if (tour) startTour(tour);
  };

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return HELP_FAQS;

    return HELP_FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return {
    loading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredFaqs,
    supportOpen,
    setSupportOpen,
    handleStartGuide,
    SupportModal: SupportContactForm,
  };
}