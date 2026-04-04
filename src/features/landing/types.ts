export type LandingViewportState = {
  width: number;
  height: number;
  dpr: number;
  isMobile: boolean;
  isTablet: boolean;
  reducedMotion: boolean;
};

export type LandingSectionMetrics = {
  id: string;
  top: number;
  height: number;
  progress: number;
  focus: number;
  viewportOffset: number;
};

export type LandingScrollTimeline = {
  activeId: string;
  nextId: string | null;
  globalProgress: number;
  activeProgress: number;
  blendToNext: number;
  sections: Record<string, LandingSectionMetrics>;
  viewport: LandingViewportState;
};

export type LandingScenePreset = {
  spreadX: number;
  spreadY: number;
  depth: number;
  zoom: number;
  rotationX: number;
  rotationY: number;
  drift: number;
  nodeAlpha: number;
  edgeAlpha: number;
  glow: number;
  haze: number;
  focusX: number;
  focusY: number;
  maxLinkDistance: number;
  backgroundFade: number;
  vignette: number;
  pointerInfluence: number;
};

export type LandingSceneState = LandingScenePreset & {
  sectionId: string;
  nextId: string | null;
  blend: number;
  nodeCount: number;
  howCloseUp: number;
  cinematicZoom: number;
  centerPull: number;
  intensityBoost: number;
};
