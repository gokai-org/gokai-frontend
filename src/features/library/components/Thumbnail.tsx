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
      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
      <span className="relative z-10 font-bold text-gray-900">{content}</span>
    </div>
  );
}
