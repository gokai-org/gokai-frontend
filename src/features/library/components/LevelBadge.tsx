type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface LevelBadgeProps {
  level: Level;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelColors: Record<Level, string> = {
    N5: 'bg-green-100 text-green-700',
    N4: 'bg-blue-100 text-blue-700',
    N3: 'bg-yellow-100 text-yellow-700',
    N2: 'bg-orange-100 text-orange-700',
    N1: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${levelColors[level]}`}>
      {level}
    </span>
  );
}
