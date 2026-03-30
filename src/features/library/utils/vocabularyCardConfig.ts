export const CARD_EASE = [0.22, 1, 0.36, 1] as const;

export const RED_ICON_FILTER =
  "brightness(0) saturate(100%) invert(26%) sepia(52%) saturate(778%) hue-rotate(328deg) brightness(87%) contrast(93%)";

export type VocabularyVariant = "theme" | "subtheme" | "word";

export interface VariantConfig {
  label: string;
  cardGradient: string;
  thumbGradient: string;
  glassBadge: string;
  coloredBadge: string;
  shadowCard: string;
  shadowHover: string;
  ring: string;
}

// ─── Variant map ──────────────────────────────────────────────────────────────

export const VARIANT_CONFIG: Record<VocabularyVariant, VariantConfig> = {
  theme: {
    label: "Tema",
    cardGradient: "from-[#6B1A18] via-[#993331] to-[#C24B40]",
    thumbGradient: "from-[#993331] to-[#BA5149]",
    glassBadge: "bg-white/15 text-white border-white/20",
    coloredBadge: "bg-[#993331]/10 text-[#993331] border-[#993331]/15",
    shadowCard: "shadow-[0_4px_24px_-6px_rgba(153,51,49,0.10)]",
    shadowHover: "hover:shadow-[0_20px_40px_-8px_rgba(153,51,49,0.45)]",
    ring: "focus-visible:ring-[#993331]/30",
  },

  subtheme: {
    label: "Subtema",
    cardGradient: "from-[#7A2220] via-[#A63B38] to-[#C85B52]",
    thumbGradient: "from-[#A63B38] to-[#C85B52]",
    glassBadge: "bg-white/15 text-white border-white/20",
    coloredBadge: "bg-[#A63B38]/10 text-[#A63B38] border-[#A63B38]/15",
    shadowCard: "shadow-[0_4px_24px_-6px_rgba(166,59,56,0.10)]",
    shadowHover: "hover:shadow-[0_20px_40px_-8px_rgba(166,59,56,0.45)]",
    ring: "focus-visible:ring-[#A63B38]/30",
  },

  word: {
    label: "Palabra",
    cardGradient: "from-[#B84C45] to-[#D06A61]",
    thumbGradient: "from-[#B84C45] to-[#D06A61]",
    glassBadge: "bg-white/15 text-white border-white/20",
    coloredBadge: "bg-[#B84C45]/10 text-[#B84C45] border-[#B84C45]/15",
    shadowCard: "shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)]",
    shadowHover: "hover:shadow-[0_8px_24px_-8px_rgba(153,51,49,0.15)]",
    ring: "focus-visible:ring-[#993331]/20",
  },
};
