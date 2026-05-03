export type GrammarCardArtworkTone = "paper" | "accent" | "locked";

export type GrammarCardVariant = {
  bg: string;
  text: string;
  badge: string;
  border: string;
  artTone: GrammarCardArtworkTone;
};

export const GRAMMAR_UNLOCKED_CARD_VARIANTS: readonly GrammarCardVariant[] = [
  {
    bg: "bg-surface-tertiary grammar-card-surface-1",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 grammar-card-badge-default",
    border: "border-content-primary/10 grammar-card-border-default",
    artTone: "paper",
  },
  {
    bg: "bg-accent/15 dark:bg-accent/20",
    text: "text-content-primary dark:text-white",
    badge: "bg-accent/15 dark:bg-accent/25",
    border: "border-accent/20 dark:border-accent/25",
    artTone: "accent",
  },
  {
    bg: "bg-surface-inset grammar-card-surface-2",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 grammar-card-badge-default",
    border: "border-content-primary/10 grammar-card-border-default",
    artTone: "paper",
  },
  {
    bg: "bg-surface-secondary grammar-card-surface-3",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 grammar-card-badge-default",
    border: "border-content-primary/10 grammar-card-border-default",
    artTone: "paper",
  },
] as const;

export const GRAMMAR_LOCKED_CARD_VARIANT: GrammarCardVariant = {
  bg: "bg-surface-tertiary grammar-card-surface-locked",
  text: "text-content-primary dark:text-white",
  badge: "bg-black/5 grammar-card-badge-locked",
  border: "border-border-default/70 grammar-card-border-locked",
  artTone: "locked",
};

export const GRAMMAR_ARTWORK_PALETTE_CLASSES: Record<
  GrammarCardArtworkTone,
  { primary: string; secondary: string }
> = {
  paper: {
    primary: "bg-[#5f575225] dark:bg-[#f2eae214]",
    secondary: "bg-[#8b827b16] dark:bg-[#d8cec50c]",
  },
  accent: {
    primary: "bg-[#675a541f] dark:bg-[#d45d551f]",
    secondary: "bg-[#95898314] dark:bg-[#f3a29312]",
  },
  locked: {
    primary: "bg-[#6259531b] dark:bg-[#d8d0c912]",
    secondary: "bg-[#90867f12] dark:bg-[#ece5df0b]",
  },
};

export const GRAMMAR_CARD_HOVER_SURFACE_CLASS =
  "grammar-card-hover-surface transition-[background-color,border-color,box-shadow] duration-300 ease-out";

export const GRAMMAR_CARD_HOVER_TITLE_CLASS =
  "grammar-card-hover-title transition-[color,opacity] duration-300 ease-out";

export const GRAMMAR_CARD_HOVER_ARTWORK_PRIMARY_CLASS =
  "grammar-card-hover-artwork-primary";

export const GRAMMAR_CARD_HOVER_ARTWORK_SECONDARY_CLASS =
  "grammar-card-hover-artwork-secondary";