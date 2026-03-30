"use client";

import { ReactNode } from "react";

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const joinClassNames = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={joinClassNames(
        "flex items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2
          className={joinClassNames(
            "text-xl font-bold text-content-primary",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={joinClassNames(
              "text-sm text-content-tertiary",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
