"use client";

import { useState, useEffect } from "react";
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

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
          selectedCategory === null
            ? "bg-[#993331] text-white shadow-md"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
        }`}
      >
        Todos
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
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? "bg-[#993331] text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-75">{category.count}</span>
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
