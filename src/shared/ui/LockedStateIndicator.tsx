"use client";

import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

type LockedStateBadgeSize = "xs" | "sm" | "md";

const BADGE_SIZE_CLASSES: Record<LockedStateBadgeSize, string> = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-8 w-8",
};

const ICON_SIZE_CLASSES: Record<LockedStateBadgeSize, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-4 w-4",
};

interface LockedStateBadgeProps {
  size?: LockedStateBadgeSize;
  className?: string;
}

export function LockedStateBadge({
  size = "sm",
  className = "",
}: LockedStateBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full border border-black/8 bg-white/78 text-content-muted/70 dark:border-white/10 dark:bg-[#221f26] dark:text-white/38",
        BADGE_SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <LockKeyhole className={ICON_SIZE_CLASSES[size]} strokeWidth={2} />
    </span>
  );
}

interface LockedStateStackProps {
  symbol?: ReactNode;
  badgeSize?: LockedStateBadgeSize;
  className?: string;
}

export function LockedStateStack({
  symbol,
  badgeSize = "sm",
  className = "",
}: LockedStateStackProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {symbol ? symbol : null}
      <LockedStateBadge size={badgeSize} />
    </div>
  );
}