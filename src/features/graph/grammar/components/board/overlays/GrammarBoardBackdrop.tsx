"use client";

export function GrammarBoardBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,241,242,0.95))] dark:bg-[linear-gradient(180deg,rgba(19,20,22,0.98),rgba(13,14,16,0.98))]" />
      <div className="absolute inset-0 opacity-[0.045] bg-[repeating-linear-gradient(0deg,rgba(17,24,39,0.08),rgba(17,24,39,0.08)_1px,transparent_1px,transparent_9px)] dark:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.022),rgba(255,255,255,0.022)_1px,transparent_1px,transparent_9px)] dark:opacity-[0.055]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_62%,rgba(17,24,39,0.06)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,transparent_58%,rgba(0,0,0,0.36)_100%)]" />
    </div>
  );
}