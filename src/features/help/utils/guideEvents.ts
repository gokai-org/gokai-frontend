export const HELP_GUIDE_SECTION_EVENT = "gokai:help-guide-section";
export const HELP_GUIDE_LIBRARY_RESET_EVENT = "gokai:help-guide-library-reset";
export const HELP_GUIDE_WRITING_EVENT = "gokai:help-guide-writing";
export const HELP_GUIDE_GRAMMAR_EVENT = "gokai:help-guide-grammar";
export const FIRST_RUN_SIDEBAR_PREVIEW_EVENT =
  "gokai:first-run-sidebar-preview";

export type HelpGuideSectionDetail = {
  section: string;
};

export type HelpGuideWritingDetail = {
  script: "hiragana" | "katakana" | "kanji";
  action: "focus" | "open" | "reset";
  target?: "available" | "path";
};

export type HelpGuideGrammarDetail = {
  action: "focus" | "open" | "reset";
  target?: "available" | "start" | "outer" | "inner" | "goal" | "next" | "path";
};

export function dispatchHelpGuideSection(section: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<HelpGuideSectionDetail>(HELP_GUIDE_SECTION_EVENT, {
      detail: { section },
    }),
  );
}

export function dispatchHelpGuideLibraryReset() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(HELP_GUIDE_LIBRARY_RESET_EVENT));
}

export function dispatchHelpGuideWriting(
  script: HelpGuideWritingDetail["script"],
  action: HelpGuideWritingDetail["action"],
  target?: HelpGuideWritingDetail["target"],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<HelpGuideWritingDetail>(HELP_GUIDE_WRITING_EVENT, {
      detail: { script, action, target },
    }),
  );
}

export function dispatchHelpGuideGrammar(
  action: HelpGuideGrammarDetail["action"],
  target?: HelpGuideGrammarDetail["target"],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<HelpGuideGrammarDetail>(HELP_GUIDE_GRAMMAR_EVENT, {
      detail: { action, target },
    }),
  );
}