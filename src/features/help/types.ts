import type { ReactNode } from "react";

export type HelpTabKey = "guides" | "faq" | "tips";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GuideCardItem {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  tourIndex: number;
}

export interface TipItem {
  icon: ReactNode;
  title: string;
  description: string;
}
