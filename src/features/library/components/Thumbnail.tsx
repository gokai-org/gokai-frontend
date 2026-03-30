interface ThumbnailProps {
  content: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function Thumbnail({
  content,
  size = "large",
  className = "",
}: ThumbnailProps) {
  const sizeClasses = {
    small: "w-18 h-22 text-3xl",
    medium: "aspect-[3/4] text-5xl",
    large: "aspect-[3/4] text-6xl",
  };

  return (
    <div
      className={[
        "relative flex items-center justify-center overflow-hidden rounded-[20px]",
        "bg-gradient-to-br from-[#FAF6F4] via-[#F8F3F1] to-[#F3E7E4]",
        "border border-accent/8",
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-accent/[0.06] to-transparent" />
      <span className="relative z-10 font-bold tracking-tight text-accent">
        {content}
      </span>
    </div>
  );
}