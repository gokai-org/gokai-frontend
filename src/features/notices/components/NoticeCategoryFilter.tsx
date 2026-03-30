"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import type { NoticeCategoryItem } from "@/features/notices/types";

interface NoticeCategoryFilterProps {
  categories: NoticeCategoryItem[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const STORAGE_KEY = "notice-category-order";

export function NoticeCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: NoticeCategoryFilterProps) {
  const [orderedCategories, setOrderedCategories] = useState<NoticeCategoryItem[]>(
    () => {
      if (typeof window === "undefined") return categories;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return categories;

      try {
        const orderIds = JSON.parse(stored) as string[];
        const ordered = orderIds
          .map((id) => categories.find((cat) => cat.id === id))
          .filter((cat): cat is NoticeCategoryItem => cat !== undefined);

        const newCategories = categories.filter(
          (cat) => !orderIds.includes(cat.id),
        );

        return [...ordered, ...newCategories];
      } catch {
        return categories;
      }
    },
  );

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
  const activeButtonClass =
    "border-accent bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-md shadow-accent/15";
  const inactiveButtonClass =
    "border-border-default bg-surface-primary text-content-secondary hover:border-accent/20 hover:text-accent hover:shadow-sm";

  return (
    <div className="no-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1 pb-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={[
          baseButtonClass,
          selectedCategory === null ? activeButtonClass : inactiveButtonClass,
        ].join(" ")}
      >
        <span>Todas</span>
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
          >
            <button
              onClick={() => onSelectCategory(category.id)}
              className={[
                baseButtonClass,
                selectedCategory === category.id
                  ? activeButtonClass
                  : inactiveButtonClass,
              ].join(" ")}
            >
              <span>{category.name}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  selectedCategory === category.id
                    ? "bg-surface-primary/15 text-content-inverted"
                    : "bg-accent/8 text-accent",
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