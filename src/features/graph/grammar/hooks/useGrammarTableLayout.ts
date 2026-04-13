import { useMemo } from "react";
import type { TableComponent } from "../types";
import {
  resolveGrammarTableLayout,
  type GrammarTableSection,
} from "../lib/grammarTableLayout";

export function useGrammarTableLayout(
  table: TableComponent,
  section: GrammarTableSection,
) {
  return useMemo(
    () => resolveGrammarTableLayout(table, section),
    [section, table],
  );
}