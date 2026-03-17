interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({
  progress,
  color = "#993331",
}: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      <span className="shrink-0 text-[12px] font-extrabold text-[#993331]">
        {progress}%
      </span>
    </div>
  );
}