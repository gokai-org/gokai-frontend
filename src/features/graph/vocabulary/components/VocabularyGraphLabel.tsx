type VocabularyGraphLabelProps = {
  idPrefix: string;
  text: string;
  lines?: string[];
  x?: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fontSize: number;
};

export function VocabularyGraphVisualDefs({
  idPrefix,
}: {
  idPrefix: string;
}) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-edge-default`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--vocabulary-edge-default)" stopOpacity={0.72} />
        <stop offset="52%" stopColor="var(--vocabulary-edge-highlight)" stopOpacity={0.92} />
        <stop offset="100%" stopColor="var(--vocabulary-edge-default)" stopOpacity={0.72} />
      </linearGradient>
      <linearGradient id={`${idPrefix}-edge-completed`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--vocabulary-edge-completed)" stopOpacity={0.74} />
        <stop offset="54%" stopColor="var(--vocabulary-edge-completed-highlight)" stopOpacity={0.96} />
        <stop offset="100%" stopColor="var(--vocabulary-edge-completed)" stopOpacity={0.78} />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-red-gradient`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--vocabulary-node-red-fill)" />
        <stop offset="100%" stopColor="var(--vocabulary-node-red-fill-end)" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-black-gradient`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--vocabulary-node-black-fill)" />
        <stop offset="100%" stopColor="var(--vocabulary-node-black-fill-end)" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-white-gradient`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--vocabulary-node-white-fill)" />
        <stop offset="100%" stopColor="var(--vocabulary-node-white-fill-end)" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-node-locked-gradient`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--vocabulary-node-locked-fill)" />
        <stop offset="100%" stopColor="var(--vocabulary-node-locked-fill-end)" />
      </linearGradient>
    </defs>
  );
}

export function VocabularyGraphLabel({
  idPrefix,
  text,
  lines,
  x = 0,
  y,
  width,
  height,
  radius,
  fontSize,
}: VocabularyGraphLabelProps) {
  void idPrefix;
  const resolvedLines = lines?.length ? lines : [text];
  const lineHeight = fontSize * 1.18;
  const textBlockHeight = lineHeight * resolvedLines.length;
  const firstLineY = y + (height - textBlockHeight) / 2 + fontSize * 0.84;

  return (
    <g style={{ pointerEvents: "none" }}>
      <title>{text}</title>
      <rect
        x={x - width / 2}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill="var(--vocabulary-label-fill)"
        stroke="var(--vocabulary-label-border)"
        strokeWidth={0.28}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={x - width / 2 + 0.16}
        y={y + 0.14}
        width={Math.max(width - 0.32, 0)}
        height={Math.max(height * 0.34, 0.56)}
        rx={Math.max(radius - 0.12, 0.5)}
        fill="var(--vocabulary-label-highlight)"
        opacity={1}
      />
      <rect
        x={x - width / 2 + 0.14}
        y={y + 0.14}
        width={Math.max(width - 0.28, 0)}
        height={Math.max(height - 0.28, 0)}
        rx={Math.max(radius - 0.12, 0.5)}
        fill="none"
        stroke="var(--vocabulary-label-inner-border)"
        strokeWidth={0.14}
        vectorEffect="non-scaling-stroke"
      />
      <text
        textAnchor="middle"
        fill="var(--vocabulary-label-text)"
        fontSize={fontSize}
        fontWeight={700}
        letterSpacing={0}
      >
        {resolvedLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={x} y={firstLineY + index * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}