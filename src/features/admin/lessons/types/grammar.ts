export type AdminGrammarComponentType = "image_stepper" | "table" | "text_stepper";

export type AdminGrammarTableCell = {
  value: string;
  rowspan: number;
  colspan: number;
};

export type AdminGrammarTableRow = {
  cells: AdminGrammarTableCell[];
};

export type AdminGrammarTableContent = {
  headers: string[];
  rows: AdminGrammarTableRow[];
};

export type AdminGrammarImageStep = {
  img: string;
  description: string;
};

export type AdminGrammarTextStep = {
  kanji: string;
  kana: string;
  meaning: string;
};

export type AdminGrammarSectionContent =
  | AdminGrammarTableContent
  | AdminGrammarImageStep[]
  | AdminGrammarTextStep[];

export type AdminGrammarComponent = {
  type: AdminGrammarComponentType;
  content: AdminGrammarSectionContent;
};

export type AdminGrammarQuestionOption = {
  option: string;
  correct: boolean;
};

export type AdminGrammarCompleteOption = {
  value: string;
  text: string;
  correct: boolean;
};

export type AdminGrammarQuestionExam = {
  type: "question";
  question: string;
  options: AdminGrammarQuestionOption[];
};

export type AdminGrammarCompleteExam = {
  type: "complete";
  question: string;
  options: AdminGrammarCompleteOption[];
};

export type AdminGrammarOrderExam = {
  type: "order";
  question: string;
  order: string[];
  answer?: string;
};

export type AdminGrammarExamItem =
  | AdminGrammarQuestionExam
  | AdminGrammarCompleteExam
  | AdminGrammarOrderExam;

export type AdminGrammarLessonSummary = {
  id: string;
  title: string;
  description: string | null;
  pointsToUnlock: number | null;
  meaningType: AdminGrammarComponentType | null;
  howToUseType: AdminGrammarComponentType | null;
  examplesType: AdminGrammarComponentType | null;
  examCount: number;
};

export type AdminGrammarLesson = {
  id: string;
  title: string;
  description: string | null;
  pointsToUnlock: number | null;
  content: {
    meaning: AdminGrammarComponent;
    howToUse: AdminGrammarComponent;
    examples: AdminGrammarComponent;
    exam: AdminGrammarExamItem[];
  };
};

export type AdminGrammarLessonStats = {
  totalLessons: number;
  tableSections: number;
  examItems: number;
  withDescription: number;
};