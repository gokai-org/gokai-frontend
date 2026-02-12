type Props = { activeIndex?: number };

export default function ProgressDots({ activeIndex = 0 }: Props) {
  const dots = [0, 1, 2];

  return (
    <div className="flex items-center gap-3">
      {dots.map((d) => (
        <span
          key={d}
          className={[
            "h-1.5 rounded-full transition-all duration-300",
            d === activeIndex
              ? "w-12 bg-red-800"
              : "w-8 bg-red-800/30",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
