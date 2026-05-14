"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Reorder } from "framer-motion";
import { LibraryCategory } from "@/features/library/types";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import type { MasteryModuleId } from "@/features/mastery/types";

interface CategoryFilterProps {
  categories: LibraryCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const STORAGE_KEY = "library-category-order";

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [orderedCategoryIds, setOrderedCategoryIds] = useState<string[]>(() => {
      if (typeof window === "undefined") {
        return categories.map((category) => category.id);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return categories.map((category) => category.id);

      try {
        return JSON.parse(stored) as string[];
      } catch {
        return categories.map((category) => category.id);
      }
  });

  const mergedOrderedCategoryIds = useMemo(() => {
    const availableIds = new Set(categories.map((category) => category.id));
    const nextIds = orderedCategoryIds.filter((id) => availableIds.has(id));
    const missingIds = categories
      .map((category) => category.id)
      .filter((id) => !nextIds.includes(id));

    return [...nextIds, ...missingIds];
  }, [categories, orderedCategoryIds]);

  const orderedCategories = useMemo(() => {
    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const ordered = mergedOrderedCategoryIds
      .map((id) => categoriesById.get(id))
      .filter((category): category is LibraryCategory => category !== undefined);
    return ordered;
  }, [categories, mergedOrderedCategoryIds]);

  // Detectar si es dispositivo touch para deshabilitar drag y habilitar scroll nativo
  const [isTouch] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: coarse)").matches
      : false,
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedOrderedCategoryIds));
  }, [mergedOrderedCategoryIds]);

  const baseButtonClass =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300";

  const mastered = useMasteredModules();
  const isGold = (id: string) => mastered.has(id as MasteryModuleId);

  function getActiveClass(id: string) {
    if (isGold(id))
      return "border-[#D4A843] bg-gradient-to-r from-[#D4A843] to-[#9B7B2F] text-content-inverted shadow-md shadow-[#D4A843]/15";
    if (id === "hiragana")
      return "border-[#7B3F8A] bg-gradient-to-r from-[#7B3F8A] to-[#5C2E69] text-content-inverted shadow-md shadow-[#7B3F8A]/15";
    if (id === "katakana")
      return "border-[#1B5078] bg-gradient-to-r from-[#1B5078] to-[#0D2E4A] text-content-inverted shadow-md shadow-[#1B5078]/15";
    return "border-accent bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-md shadow-accent/15";
  }

  function getInactiveClass(id: string) {
    if (isGold(id))
      return "border-border-default bg-surface-primary text-content-secondary hover:border-[#D4A843]/20 hover:text-[#D4A843] hover:shadow-sm";
    if (id === "hiragana")
      return "border-border-default bg-surface-primary text-content-secondary hover:border-[#7B3F8A]/20 hover:text-[#7B3F8A] hover:shadow-sm";
    if (id === "katakana")
      return "border-border-default bg-surface-primary text-content-secondary hover:border-[#1B5078]/20 hover:text-[#1B5078] hover:shadow-sm";
    return "border-border-default bg-surface-primary text-content-secondary hover:border-accent/20 hover:text-accent hover:shadow-sm";
  }

  function getBadgeClass(categoryId: string, isActive: boolean) {
    if (isActive) return "bg-surface-primary/15 text-content-inverted";
    if (isGold(categoryId)) return "bg-[#D4A843]/10 text-[#D4A843]";
    if (categoryId === "hiragana") return "bg-[#7B3F8A]/10 text-[#7B3F8A]";
    if (categoryId === "katakana") return "bg-[#1B5078]/10 text-[#1B5078]";
    return "bg-accent/8 text-accent";
  }

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1 pb-2 touch-pan-x"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <button
        onClick={() => onSelectCategory(null)}
        className={[
          baseButtonClass,
          selectedCategory === null
            ? getActiveClass("todos")
            : getInactiveClass("todos"),
        ].join(" ")}
      >
        <span>Todos</span>
      </button>

      <Reorder.Group
        axis="x"
        values={orderedCategories}
        onReorder={(nextCategories) => {
          setOrderedCategoryIds(nextCategories.map((category) => category.id));
        }}
        className="flex items-center gap-3"
      >
        {orderedCategories.map((category) => (
          <Reorder.Item
            key={category.id}
            value={category}
            className="cursor-grab active:cursor-grabbing"
            drag={isTouch ? false : "x"}
            dragListener={!isTouch}
          >
            <button
              onClick={() => onSelectCategory(category.id)}
              className={[
                baseButtonClass,
                selectedCategory === category.id
                  ? getActiveClass(category.id)
                  : getInactiveClass(category.id),
              ].join(" ")}
            >
              <span>{category.name}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  getBadgeClass(category.id, selectedCategory === category.id),
                ].join(" ")}
              >
                {category.count}
              </span>
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
