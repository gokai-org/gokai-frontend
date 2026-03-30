"use client";

import { ReactNode } from "react";

interface DashboardHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  japaneseText?: string;
  statusBadge?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  rightContent?: ReactNode;
}

export function DashboardHeader({
  icon,
  title,
  subtitle,
  japaneseText,
  statusBadge,
  showSearch = false,
  searchPlaceholder = "Buscar...",
  onSearchChange,
  rightContent,
}: DashboardHeaderProps) {
  return (
    <header className="bg-surface-primary px-6 h-20 flex items-center justify-between sticky top-0 z-10 relative">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-md">
            {icon}
          </div>
        </div>

        {/* Información */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-accent">
                {title}
              </h1>
              {japaneseText && (
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
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-content-tertiary">{subtitle}</p>
              {statusBadge}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Buscador */}
        {showSearch && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-secondary rounded-full border border-border-default">
            <svg
              className="w-4 h-4 text-content-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-transparent text-sm outline-none w-32 lg:w-48 text-content-primary placeholder:text-content-muted"
            />
          </div>
        )}

        {/* Contenido personalizado */}
        {rightContent || (
          <button className="text-content-muted hover:text-content-secondary transition-colors p-2 hover:bg-surface-secondary rounded-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Línea */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-border-default via-border-default to-border-default"
        style={{ marginLeft: "-200px", width: "calc(100% + 200px)" }}
      />
    </header>
  );
}
