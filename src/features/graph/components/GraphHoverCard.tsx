"use client";

import { memo, type ReactNode } from "react";

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
  return (
    <div
      className={`graph-hover-card graph-hover-card--${variant} pointer-events-none absolute z-40`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -100%)",
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
            {showMore ? (
              <div className="graph-hover-card__footer">
                <span className="graph-hover-card__more-btn">Ver más →</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(GraphHoverCard);