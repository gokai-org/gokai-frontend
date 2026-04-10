export const SCRIPT_CARD_EASE = [0.22, 1, 0.36, 1] as const;

export type ScriptVariant = "kanji" | "hiragana" | "katakana";

export interface ScriptCardConfig {
  /** Shape rendered in the top-left symbol box */
  symbolShape: "circle" | "mahjong" | "shogi";
  bgTint: string;
  hoverGradient: string;
  thumbGradient: string;
  pointsBadge: string;
  shadowCard: string;
  shadowHover: string;
  ring: string;
  decorOpacity: string;
  heartColor: string;
  heartBg: string;
}

// ─── Config map ───────────────────────────────────────────────────────────────

// ─── Golden mastery config (shared across all variants) ──────────────────────

export const SCRIPT_CARD_GOLD_CONFIG: Omit<ScriptCardConfig, "symbolShape"> = {
  bgTint: "",
  hoverGradient: "from-[#7A5C1C] via-[#D4A843] to-[#F0D27A]",
  thumbGradient: "from-[#D4A843] to-[#F0D27A]",
  pointsBadge:
    "bg-[#D4A843]/10 text-[#9B7B2F] border-[#D4A843]/15 group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-white",
  shadowCard: "shadow-[0_4px_20px_-6px_rgba(212,168,67,0.12)]",
  shadowHover: "hover:shadow-[0_20px_40px_-8px_rgba(212,168,67,0.45)]",
  ring: "focus-visible:ring-[#D4A843]/30",
  decorOpacity: "text-[#D4A843]/[0.05] group-hover:text-white/[0.08]",
  heartColor: "text-[#D4A843]",
  heartBg: "border-[#D4A843]/20 bg-[#D4A843]/10",
};

export const SCRIPT_CARD_CONFIG: Record<ScriptVariant, ScriptCardConfig> = {
  kanji: {
    symbolShape: "circle",
    bgTint: "",
    hoverGradient: "from-[#5C1210] via-[#8C2E2C] to-[#BA4845]",
    thumbGradient: "from-[#993331] to-[#BA5149]",
    pointsBadge:
      "bg-[#993331]/10 text-[#993331] border-[#993331]/15 group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-white",
    shadowCard: "shadow-[0_4px_20px_-6px_rgba(153,51,49,0.12)]",
    shadowHover: "hover:shadow-[0_20px_40px_-8px_rgba(153,51,49,0.45)]",
    ring: "focus-visible:ring-[#993331]/30",
    decorOpacity: "text-[#993331]/[0.05] group-hover:text-white/[0.08]",
    heartColor: "text-[#993331]",
    heartBg: "border-[#993331]/20 bg-[#993331]/10",
  },

  hiragana: {
    symbolShape: "shogi",
    bgTint: "",
    hoverGradient: "from-[#3B1840] via-[#6B3578] to-[#9B56A8]",
    thumbGradient: "from-[#7B3F8A] to-[#A866B5]",
    pointsBadge:
      "bg-[#7B3F8A]/10 text-[#7B3F8A] border-[#7B3F8A]/15 group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-white",
    shadowCard: "shadow-[0_4px_20px_-6px_rgba(123,63,138,0.12)]",
    shadowHover: "hover:shadow-[0_20px_40px_-8px_rgba(107,53,120,0.45)]",
    ring: "focus-visible:ring-[#7B3F8A]/30",
    decorOpacity: "text-[#7B3F8A]/[0.05] group-hover:text-white/[0.08]",
    heartColor: "text-[#7B3F8A]",
    heartBg: "border-[#7B3F8A]/20 bg-[#7B3F8A]/10",
  },

  katakana: {
    symbolShape: "mahjong",
    bgTint: "",
    hoverGradient: "from-[#0D2E4A] via-[#1B5078] to-[#2E82B5]",
    thumbGradient: "from-[#1B5078] to-[#2E82B5]",
    pointsBadge:
      "bg-[#1B5078]/10 text-[#1B5078] border-[#1B5078]/15 group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-white",
    shadowCard: "shadow-[0_4px_20px_-6px_rgba(27,80,120,0.12)]",
    shadowHover: "hover:shadow-[0_20px_40px_-8px_rgba(27,80,120,0.45)]",
    ring: "focus-visible:ring-[#1B5078]/30",
    decorOpacity: "text-[#1B5078]/[0.05] group-hover:text-white/[0.08]",
    heartColor: "text-[#1B5078]",
    heartBg: "border-[#1B5078]/20 bg-[#1B5078]/10",
  },
};
