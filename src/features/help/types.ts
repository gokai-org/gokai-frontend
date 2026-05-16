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
  tourId: string;
}

export interface TipItem {
  icon: ReactNode;
  title: string;
  description: string;
}
