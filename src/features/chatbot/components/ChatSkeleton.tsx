"use client";

export function ChatSkeleton() {
  return (
    <div className="flex w-full flex-1 flex-col gap-4 py-2">
      {Array.from({ length: 6 }).map((_, index) => {
        const isRight = index % 2 !== 0;

        return (
          <div
            key={index}
            className={`flex ${isRight ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "h-20 rounded-[24px] bg-surface-tertiary/80 animate-pulse",
                isRight ? "w-[58%]" : "w-[66%]",
              ].join(" ")}
            />
          </div>
        );
      })}
    </div>
  );
}
