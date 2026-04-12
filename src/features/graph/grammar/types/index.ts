// ──────────────────────────────────────────────────────
// API / Summary
// ──────────────────────────────────────────────────────

export type GrammarLessonSummary = {
  id: string;
  title: string;
  pointsToUnlock: number | null;
};

// ──────────────────────────────────────────────────────
// Full lesson detail
// ──────────────────────────────────────────────────────

export type GrammarLesson = {
  id: string;
  title: string;
  description: string | null;
  pointsToUnlock: number | null;
  content: LessonContent | null;
};

export type LessonContent = {
  meaning: ImageStepperComponent;
  howToUse: TableComponent;
  examples: TextStepperComponent;
  exam: ExamItem[];
};

export type ImageStepperComponent = {
  type: "image_stepper";
  content: ImageStep[];
};

export type ImageStep = {
  img: string;
  description: string;
};

export type TableComponent = {
  type: "table";
  content: {
    headers: string[];
    rows: TableRow[];
  };
};

export type TableRow = { cells: TableCell[] };

export type TableCell = {
  value: string;
  rowspan: number;
  colspan: number;
};

export type TextStepperComponent = {
  type: "text_stepper";
  content: ExampleStep[];
};

export type ExampleStep = {
  kanji: string;
  kana: string;
  meaning: string;
};

// ──────────────────────────────────────────────────────
// Exam discriminated union
// ──────────────────────────────────────────────────────

export type ExamItem = QuestionExam | CompleteExam | OrderExam;

export type QuestionExam = {
  type: "question";
  question: string;
  options: QuestionOption[];
};

export type QuestionOption = {
  option: string;
  correct: boolean;
};

export type CompleteExam = {
  type: "complete";
  question: string;
  options: CompleteOption[];
};

export type CompleteOption = {
  value: string;
  text: string;
  correct: boolean;
};

export type OrderExam = {
  type: "order";
  question: string;
  options?: string[];
  answer?: string;
  order?: string[];
};

// ──────────────────────────────────────────────────────
// Board types (ReactFlow)
// ──────────────────────────────────────────────────────

export type GrammarBoardStatus = "completed" | "available" | "locked";

export type GrammarBoardProgress = {
  id: string;
  index: number;
  symbol: string;
  title: string;
  pointsToUnlock: number;
  status: GrammarBoardStatus;
  isMock: boolean;
};

export type GrammarBoardNodeData = {
  progress: GrammarBoardProgress;
  selected: boolean;
  glowScale: number;
  shadowScale: number;
  showOrbitRings: boolean;
  shouldUsePulse: boolean;
  drawerOpen?: boolean;
};

export type GrammarBoardEdgeData = {
  status: GrammarBoardStatus;
  widthScale: number;
  opacityScale: number;
};

// ──────────────────────────────────────────────────────
// Quiz submit
// ──────────────────────────────────────────────────────

export type GrammarQuizSubmitBody = {
  score: number;
  duration: number;
};