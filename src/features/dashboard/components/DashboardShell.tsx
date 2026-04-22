"use client";

import { ReactNode } from "react";

interface DashboardShellProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  containerClassName?: string;
  useContainer?: boolean;
}

const baseContentClassName = "flex-1 overflow-y-auto bg-surface-primary";
const baseContainerClassName = "mx-auto px-4 sm:px-6 lg:px-10 py-6";

const joinClassNames = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export function DashboardShell({
  header,
  children,
  footer,
  contentClassName,
  containerClassName,
  useContainer = true,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-0 h-full flex-col bg-surface-primary">
      {header}
      <div className={joinClassNames(baseContentClassName, contentClassName)}>
        {useContainer ? (
          <div
            className={joinClassNames(
              baseContainerClassName,
              containerClassName,
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
      {footer}
    </div>
  );
}
