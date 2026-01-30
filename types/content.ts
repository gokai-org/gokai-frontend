// KANJI
export type Kanji = {
  id: string;
  symbol: string;
  readings: string[];
  meanings: string[];
  points_to_unlock: number;
};

export type KanjiExerciseAnswer = {
  id: string;
  kanji_id: string;
  user_id: string;
  exercise_type?: string;
  points?: number;
  duration?: number;
  is_correct?: boolean;
  answered_at?: string;
};

// THEMES & SUBTHEMES 
export type Theme = {
  id: string;
  meaning: string | null;
  kanji: string;
  kana: string;
  released: boolean;
};

export type Subtheme = {
  id: string;
  meaning: string;
  theme_id: string;
  kanji: string;
  kana: string;
};

// WORDS 
export type Word = {
  id: string;
  subtheme_id: string | null;
  kanji: string | null;
  hiragana: string | null;
  icon: string | null;
  meanings: string[] | null;
};

export type WordKanji = {
  word_id: string;
  kanji_id: string;
};

// GRAPH & NODES 
export type Graph = {
  id: string;
  user_id: string;
  theme_id: string;
};

export type Node = {
  id: string;
  graph_id: string;
  subtheme_id: string | null;
  is_home: boolean;
};

// LESSONS 
export type LessonType = 'kanji' | 'word' | 'grammar' | string;

export type Lesson = {
  id: string;
  description: string;
  embedding: number[];
  lesson_type: LessonType;
  entity_id: string;
};

// GRAMMAR 
export type GrammarLesson = {
  id: string;
  title: string;
  description: string | null;
  points_to_unlock: number;
  use_cases: string;
  examples: string;
};

// STREAKS
export type Streak = {
  id: string;
  user_id: string;
  created_at: string;
  ended_at: string | null;
};
