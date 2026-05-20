"use client";

import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  japaneseText: string;
  rightContent?: ReactNode;
}

export function AdminPageHeader({
  icon,
  title,
  subtitle,
  japaneseText,
  rightContent,
}: AdminPageHeaderProps) {
  return (
    <header className="relative z-20 border-b border-border-subtle bg-surface-primary/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[112px] max-w-[1760px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent shadow-md">
            {icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-accent sm:text-2xl">
                {title}
              </h1>
              <span
                className="text-sm font-bold text-accent"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  letterSpacing: "0.25em",
                  lineHeight: "1",
                }}
              >
                {japaneseText}
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-content-tertiary sm:text-[13px]">
              {subtitle}
            </p>
          </div>
        </div>

        {rightContent ? (
          <div className="flex min-h-[56px] w-full items-center xl:w-auto xl:justify-end">
            {rightContent}
          </div>
        ) : null}
      </div>
    </header>
  );
}
