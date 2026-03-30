"use client";

interface ChatTypingIndicatorProps {
  compact?: boolean;
}

export function ChatTypingIndicator({
  compact = false,
}: ChatTypingIndicatorProps) {
  return (
    <div className="mb-4 flex justify-start">
      <div className="max-w-[85%] sm:max-w-[72%]">
        <div className="mb-2 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold tracking-wide text-content-inverted">
          SEN
        </div>

        <div
          className={[
            "rounded-[24px] border border-border-subtle bg-surface-primary px-4 py-3 shadow-sm",
            compact ? "w-[84px]" : "w-[100px]",
          ].join(" ")}
        >
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-2 w-2 animate-bounce rounded-full bg-accent/45"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}