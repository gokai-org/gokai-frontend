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
  themeId: string;
  kanji: string;
  kana: string;
};

export type SubthemeWithTheme = Subtheme & {
  theme: Theme;
};

export type Graph = {
  id: string;
  userId: string;
  themeId: string;
};

export type GraphNode = {
  id: string;
  graphId: string;
  subthemeId: string | null;
  isHome: boolean;
};
