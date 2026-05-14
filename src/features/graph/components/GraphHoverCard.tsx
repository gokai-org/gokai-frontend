"use client";

import { memo, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

type GraphHoverCardProps = {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  caption?: string;
  eyebrow?: string;
  badge?: string;
  mascot?: ReactNode;
  subtitleLang?: string;
  variant?: "region" | "kazu";
  showMore?: boolean;
};

function GraphHoverCard({
  x,
  y,
  title,
  subtitle,
  caption,
  eyebrow,
  badge,
  mascot,
  subtitleLang,
  variant = "region",
  showMore = false,
}: GraphHoverCardProps) {
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    const updateViewport = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", updateViewport, true);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", updateViewport, true);
    };
  }, []);

  const placement = useMemo(() => {
    const viewportWidth = viewportSize.width;
    const viewportHeight = viewportSize.height;
    const horizontalPadding = 14;
    const verticalPadding = 14;
    const anchorGap = variant === "kazu" ? 18 : 14;
    const estimatedWidth = Math.max(
      180,
      Math.min(variant === "kazu" ? 348 : 220, viewportWidth - horizontalPadding * 2),
    );
    const estimatedHeight = variant === "kazu"
      ? showMore
        ? 244
        : 220
      : 140;
    const left = Math.min(
      Math.max(x - estimatedWidth / 2, horizontalPadding),
      Math.max(horizontalPadding, viewportWidth - estimatedWidth - horizontalPadding),
    );
    const canPlaceAbove = y - estimatedHeight - anchorGap >= verticalPadding;
    const top = canPlaceAbove
      ? y - estimatedHeight - anchorGap
      : Math.min(
          y + anchorGap,
          Math.max(verticalPadding, viewportHeight - estimatedHeight - verticalPadding),
        );

    return {
      left,
      top: Math.max(verticalPadding, top),
      width: estimatedWidth,
    };
  }, [showMore, variant, viewportSize.height, viewportSize.width, x, y]);

  const content = (
    <div
      className={`graph-hover-card graph-hover-card--${variant} pointer-events-none z-[120]`}
      style={{
        position: "fixed",
        left: `${placement.left}px`,
        top: `${placement.top}px`,
        width: `${placement.width}px`,
        maxWidth: `calc(100vw - 28px)`,
      }}
    >
      <div className="graph-hover-card__surface">
        {eyebrow || badge ? (
          <div className="graph-hover-card__meta">
            {eyebrow ? <div className="graph-hover-card__eyebrow">{eyebrow}</div> : null}
            {badge ? <div className="graph-hover-card__badge">{badge}</div> : null}
          </div>
        ) : null}

        <div className={`graph-hover-card__body${mascot ? " has-mascot" : ""}`}>
          {mascot ? <div className="graph-hover-card__mascot">{mascot}</div> : null}

          <div className="graph-hover-card__content">
            <div className="graph-hover-card__title">{title}</div>
            {subtitle ? (
              <div className="graph-hover-card__subtitle" lang={subtitleLang}>
                {subtitle}
              </div>
            ) : null}
            {caption ? <div className="graph-hover-card__caption">{caption}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isClient || typeof document === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}

export default memo(GraphHoverCard);