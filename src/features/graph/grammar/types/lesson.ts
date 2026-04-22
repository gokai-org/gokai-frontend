export type GrammarLessonSummary = {
  id: string;
  title: string;
  pointsToUnlock: number | null;
  status?: string | null;
  completed?: boolean | null;
  available?: boolean | null;
  unlocked?: boolean | null;
  current?: boolean | null;
  symbol?: string | null;
};

export type GrammarStudyProgress = {
  grammarId: string;
  title: string;
  pointsToUnlock: number;
  completed: boolean;
};

export type GrammarUnlockResponse = {
  success: boolean;
  message: string;
  userPoints: number;
  points?: number | null;
};

export type GrammarLesson = {
  id: string;
  title: string;
  description: string | null;
  pointsToUnlock: number | null;
  content: LessonContent | null;
};

export type TableComponent = {
  type: "table";
  content: {
    headers: string[];
    rows: TableRow[];
  };
};

export type ImageStepperComponent = {
  type: "image_stepper";
  content: ImageStep[];
};

export type MeaningComponent = ImageStepperComponent | TableComponent;

export type LessonContent = {
  meaning: MeaningComponent | null;
  howToUse: TableComponent | null;
  examples: TextStepperComponent | null;
  exam: ExamItem[];
};

export type ImageStep = {
  img: string;
  description: string;
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

export type GrammarQuizSubmitBody = {
  score: number;
  duration: number;
};

export type GrammarQuizSubmitResponse = {
  success: boolean;
  message: string;
  userPoints: number;
  pointsAwarded: number;
  isCorrect: boolean;
};

export type GrammarQuizCompletionResult = {
  grammarId: string;
  score: number;
  isCorrect: boolean;
  pointsAwarded: number;
  userPoints: number;
};