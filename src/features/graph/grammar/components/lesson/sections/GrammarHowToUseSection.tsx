"use client";

import type { TableComponent } from "../../../types";
import GrammarAdaptiveTable from "./GrammarAdaptiveTable";

export default function GrammarHowToUseSection({ howToUse }: { howToUse: TableComponent }) {
  return <GrammarAdaptiveTable table={howToUse} section="howToUse" />;
}
