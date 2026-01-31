interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color = '#993331' }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-500 shrink-0">
        {progress}%
      </span>
    </div>
  );
}
