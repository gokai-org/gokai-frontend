"use client";

import { useState, useEffect, useRef } from "react";
import { Reorder } from "framer-motion";
import { LibraryCategory } from "@/features/library/types";

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
  const [orderedCategories, setOrderedCategories] = useState<LibraryCategory[]>(
    () => {
      if (typeof window === "undefined") return categories;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return categories;

      try {
        const orderIds = JSON.parse(stored) as string[];
        const ordered = orderIds
          .map((id) => categories.find((cat) => cat.id === id))
          .filter((cat): cat is LibraryCategory => cat !== undefined);

        const newCategories = categories.filter(
          (cat) => !orderIds.includes(cat.id),
        );

        return [...ordered, ...newCategories];
      } catch {
        return categories;
      }
    },
  );

  // Detectar si es dispositivo touch para deshabilitar drag y habilitar scroll nativo
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orderIds = orderedCategories.map((cat) => cat.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
  }, [orderedCategories]);

  useEffect(() => {
    queueMicrotask(() => {
      setOrderedCategories((prev) => {
        const orderMap = new Map(prev.map((cat, idx) => [cat.id, idx]));
        return categories
          .map((cat) => ({
            ...cat,
            order: orderMap.get(cat.id) ?? Infinity,
          }))
          .sort((a, b) => a.order - b.order)
          .map(({ order, ...cat }) => cat);
      });
    });
  }, [categories]);

  const baseButtonClass =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300";

  function getActiveClass(id: string) {
    if (id === "hiragana")
      return "border-[#7B3F8A] bg-gradient-to-r from-[#7B3F8A] to-[#5C2E69] text-content-inverted shadow-md shadow-[#7B3F8A]/15";
    if (id === "katakana")
      return "border-[#1B5078] bg-gradient-to-r from-[#1B5078] to-[#0D2E4A] text-content-inverted shadow-md shadow-[#1B5078]/15";
    return "border-accent bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-md shadow-accent/15";
  }

  function getInactiveClass(id: string) {
    if (id === "hiragana")
      return "border-border-default bg-surface-primary text-content-secondary hover:border-[#7B3F8A]/20 hover:text-[#7B3F8A] hover:shadow-sm";
    if (id === "katakana")
      return "border-border-default bg-surface-primary text-content-secondary hover:border-[#1B5078]/20 hover:text-[#1B5078] hover:shadow-sm";
    return "border-border-default bg-surface-primary text-content-secondary hover:border-accent/20 hover:text-accent hover:shadow-sm";
  }

  function getBadgeClass(categoryId: string, isActive: boolean) {
    if (isActive) return "bg-surface-primary/15 text-content-inverted";
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
          selectedCategory === null ? getActiveClass("todos") : getInactiveClass("todos"),
        ].join(" ")}
      >
        <span>Todos</span>
      </button>

      <Reorder.Group
        axis="x"
        values={orderedCategories}
        onReorder={setOrderedCategories}
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