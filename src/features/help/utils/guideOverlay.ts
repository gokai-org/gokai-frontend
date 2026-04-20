export const GUIDE_VIEWPORT_GUTTER = 16;
export const GUIDE_SPOTLIGHT_GLOW =
  "0 0 0 1px rgba(255,255,255,0.14), 0 0 0 9999px rgba(8,8,12,0.68), 0 18px 60px rgba(0,0,0,0.45)";
export const GUIDE_CARD_MAX_WIDTH = 460;

export type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

export type GuideCardMetrics = {
  width: number;
  maxHeight: number;
  isMobile: boolean;
  isTablet: boolean;
};

export type GuideCardStyle = {
  width: number;
  left: number;
  top: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getVisibleArea(rect: DOMRect) {
  const visibleWidth = Math.max(
    0,
    Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
  );
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
  );

  return visibleWidth * visibleHeight;
}

function getViewportCenterDistance(rect: DOMRect) {
  const rectCenterX = rect.left + rect.width / 2;
  const rectCenterY = rect.top + rect.height / 2;
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  return Math.hypot(rectCenterX - viewportCenterX, rectCenterY - viewportCenterY);
}

export function getGuideCardMetrics(
  viewportWidth: number,
  viewportHeight: number,
): GuideCardMetrics {
  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  const width = Math.min(
    isMobile ? 320 : isTablet ? 380 : GUIDE_CARD_MAX_WIDTH,
    viewportWidth - GUIDE_VIEWPORT_GUTTER * 2,
  );
  const maxHeight = Math.max(
    280,
    viewportHeight - (isMobile ? 24 : GUIDE_VIEWPORT_GUTTER * 2),
  );

  return {
    width,
    maxHeight,
    isMobile,
    isTablet,
  };
}

export function resolveGuideTarget(selector: string) {
  const candidates = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

  const visibleCandidates = candidates
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const visibleArea = getVisibleArea(rect);
      const rawArea = rect.width * rect.height;
      const visibilityRatio = rawArea > 0 ? visibleArea / rawArea : 0;
      const priority = Number(element.dataset.helpTargetPriority ?? 0);

      return {
        element,
        rect,
        visibleArea,
        visibilityRatio,
        priority,
        centerDistance: getViewportCenterDistance(rect),
        isVisible:
          rect.width > 0 &&
          rect.height > 0 &&
          visibleArea > 0 &&
          styles.display !== "none" &&
          styles.visibility !== "hidden" &&
          styles.opacity !== "0",
      };
    })
    .filter((candidate) => candidate.isVisible);

  if (visibleCandidates.length === 0) {
    return null;
  }

  return visibleCandidates.reduce((best, candidate) => {
    if (candidate.priority !== best.priority) {
      return candidate.priority > best.priority ? candidate : best;
    }

    if (candidate.visibilityRatio !== best.visibilityRatio) {
      return candidate.visibilityRatio > best.visibilityRatio ? candidate : best;
    }

    if (candidate.visibleArea !== best.visibleArea) {
      return candidate.visibleArea > best.visibleArea ? candidate : best;
    }

    return candidate.centerDistance < best.centerDistance ? candidate : best;
  }).element;
}

export function hasVisibleGuideLoading() {
  const loadingNodes = Array.from(
    document.querySelectorAll('[data-help-loading="true"]'),
  ) as HTMLElement[];

  return loadingNodes.some((element) => {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const visibleArea = getVisibleArea(rect);
    const isClipped = styles.clip === "rect(0px, 0px, 0px, 0px)";
    const isInsetHidden = styles.clipPath.includes("inset(50%)");

    return (
      visibleArea > 24 &&
      styles.display !== "none" &&
      styles.visibility !== "hidden" &&
      styles.opacity !== "0" &&
      !isClipped &&
      !isInsetHidden
    );
  });
}

export function isGuideStepReady(selector?: string) {
  if (hasVisibleGuideLoading()) {
    return false;
  }

  if (!selector) {
    return true;
  }

  return resolveGuideTarget(selector) !== null;
}

export function resolveSpotlightRect(
  element: HTMLElement,
  padding: number,
  insets?: Partial<Record<"top" | "right" | "bottom" | "left", number>>,
): SpotlightRect {
  const rect = element.getBoundingClientRect();
  const top = Math.max(
    GUIDE_VIEWPORT_GUTTER,
    rect.top - padding - (insets?.top ?? 0),
  );
  const left = Math.max(
    GUIDE_VIEWPORT_GUTTER,
    rect.left - padding - (insets?.left ?? 0),
  );
  const right = Math.min(
    window.innerWidth - GUIDE_VIEWPORT_GUTTER,
    rect.right + padding + (insets?.right ?? 0),
  );
  const bottom = Math.min(
    window.innerHeight - GUIDE_VIEWPORT_GUTTER,
    rect.bottom + padding + (insets?.bottom ?? 0),
  );

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    right,
    bottom,
  };
}

export function getSpotlightCardStyle(
  rect: SpotlightRect,
  cardWidth: number,
  cardHeight: number,
  position:
    | "center"
    | "top"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-right"
    | undefined,
): GuideCardStyle {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 20;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const boundedCardWidth = Math.min(
    cardWidth,
    viewportWidth - GUIDE_VIEWPORT_GUTTER * 2,
  );
  const maxLeft = Math.max(
    GUIDE_VIEWPORT_GUTTER,
    viewportWidth - GUIDE_VIEWPORT_GUTTER - boundedCardWidth,
  );
  const maxTop = Math.max(
    GUIDE_VIEWPORT_GUTTER,
    viewportHeight - GUIDE_VIEWPORT_GUTTER - cardHeight,
  );

  const clampRect = (left: number, top: number): GuideCardStyle => ({
    width: boundedCardWidth,
    left: clamp(left, GUIDE_VIEWPORT_GUTTER, maxLeft),
    top: clamp(top, GUIDE_VIEWPORT_GUTTER, maxTop),
  });

  const overlapArea = (candidate: GuideCardStyle) => {
    const horizontal = Math.max(
      0,
      Math.min(candidate.left + boundedCardWidth, rect.right) -
        Math.max(candidate.left, rect.left),
    );
    const vertical = Math.max(
      0,
      Math.min(candidate.top + cardHeight, rect.bottom) -
        Math.max(candidate.top, rect.top),
    );

    return horizontal * vertical;
  };

  const preferredOrder = (() => {
    switch (position) {
      case "top-left":
        return ["top-left", "top", "left", "top-right", "bottom-left", "right", "bottom", "bottom-right", "center"] as const;
      case "top-right":
        return ["top-right", "top", "right", "top-left", "bottom-right", "left", "bottom", "bottom-left", "center"] as const;
      case "top":
        return ["top", "top-right", "top-left", "right", "left", "bottom", "bottom-right", "bottom-left", "center"] as const;
      case "left":
        return ["left", "top-left", "bottom-left", "top", "bottom", "right", "top-right", "bottom-right", "center"] as const;
      case "right":
        return ["right", "top-right", "bottom-right", "top", "bottom", "left", "top-left", "bottom-left", "center"] as const;
      case "bottom-left":
        return ["bottom-left", "bottom", "left", "bottom-right", "top-left", "right", "top", "top-right", "center"] as const;
      case "bottom-right":
        return ["bottom-right", "bottom", "right", "bottom-left", "top-right", "left", "top", "top-left", "center"] as const;
      case "center":
        return ["center", "right", "left", "bottom", "top", "bottom-right", "bottom-left", "top-right", "top-left"] as const;
      case "bottom":
      default:
        return ["bottom", "bottom-right", "bottom-left", "right", "left", "top", "top-right", "top-left", "center"] as const;
    }
  })();

  const candidates = preferredOrder.map((candidatePosition) => {
    switch (candidatePosition) {
      case "top-left":
        return clampRect(rect.left, rect.top - gap - cardHeight);
      case "top-right":
        return clampRect(rect.right - boundedCardWidth, rect.top - gap - cardHeight);
      case "top":
        return clampRect(centerX - boundedCardWidth / 2, rect.top - gap - cardHeight);
      case "left":
        return clampRect(rect.left - gap - boundedCardWidth, centerY - cardHeight / 2);
      case "right":
        return clampRect(rect.right + gap, centerY - cardHeight / 2);
      case "bottom-left":
        return clampRect(rect.left, rect.bottom + gap);
      case "bottom-right":
        return clampRect(rect.right - boundedCardWidth, rect.bottom + gap);
      case "center":
        return clampRect(centerX - boundedCardWidth / 2, centerY - cardHeight / 2);
      case "bottom":
      default:
        return clampRect(centerX - boundedCardWidth / 2, rect.bottom + gap);
    }
  });

  const noOverlapCandidate = candidates.find((candidate) => overlapArea(candidate) === 0);

  if (noOverlapCandidate) {
    return noOverlapCandidate;
  }

  return candidates.reduce((best, candidate) =>
    overlapArea(candidate) < overlapArea(best) ? candidate : best,
  );
}