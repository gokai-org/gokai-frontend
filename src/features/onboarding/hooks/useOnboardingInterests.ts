"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { hydrateOnboardingInterestSections } from "@/features/onboarding/data/interestSections";
import { saveOnboardingInterestThemeIds } from "@/features/onboarding/lib/interestThemeStorage";
import {
  ensureOnboardingVocabularyGraphs,
  getOnboardingThemes,
  saveOnboardingInterests,
} from "@/features/onboarding/services/api";
import type {
  OnboardingInterestSection,
  OnboardingTheme,
  SelectedOnboardingInterests,
} from "@/features/onboarding/types";

type OnboardingLoadStatus = "idle" | "loading" | "success" | "error";

export function useOnboardingInterests() {
  const [themes, setThemes] = useState<OnboardingTheme[]>([]);
  const [status, setStatus] = useState<OnboardingLoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] =
    useState<SelectedOnboardingInterests>({});
  const [saving, setSaving] = useState(false);

  const loadThemes = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const nextThemes = await getOnboardingThemes();
      setThemes(Array.isArray(nextThemes) ? nextThemes : []);
      setStatus("success");
    } catch (loadError) {
      console.error("Error cargando temas para onboarding:", loadError);
      setStatus("error");
      setError("No se pudieron cargar los temas disponibles.");
    }
  }, []);

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  const sections = useMemo<OnboardingInterestSection[]>(
    () => hydrateOnboardingInterestSections(themes),
    [themes],
  );

  const availableThemeIds = useMemo(() => {
    const ids = new Set<string>();

    sections.forEach((section) => {
      section.interests.forEach((interest) => {
        if (interest.themeId) {
          ids.add(interest.themeId);
        }
      });
    });

    return ids;
  }, [sections]);

  const selectedThemeIds = useMemo(
    () =>
      Object.values(selectedInterests).filter((themeId) =>
        availableThemeIds.has(themeId),
      ),
    [availableThemeIds, selectedInterests],
  );

  const selectedCount = selectedThemeIds.length;

  const toggleInterest = useCallback(
    (sectionId: string, themeId: string | null) => {
      if (!themeId) {
        return;
      }

      setSelectedInterests((current) => {
        const next = { ...current };

        if (next[sectionId] === themeId) {
          delete next[sectionId];
        } else {
          next[sectionId] = themeId;
        }

        return next;
      });
    },
    [],
  );

  const saveSelections = useCallback(async () => {
    if (selectedThemeIds.length === 0) {
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await saveOnboardingInterests(selectedThemeIds);
      const savedThemeIds = response.themes?.length ? response.themes : selectedThemeIds;
      saveOnboardingInterestThemeIds(savedThemeIds);
      await ensureOnboardingVocabularyGraphs(savedThemeIds);
      return response;
    } catch (saveError) {
      console.error("Error guardando intereses:", saveError);
      setError("No se pudieron guardar tus intereses. Inténtalo de nuevo.");
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, [selectedThemeIds]);

  return {
    sections,
    status,
    error,
    saving,
    selectedInterests,
    selectedCount,
    selectedThemeIds,
    retryLoadThemes: loadThemes,
    toggleInterest,
    saveSelections,
  };
}
