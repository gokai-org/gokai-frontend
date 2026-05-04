type VocabularyGraphLabelProps = {
  idPrefix: string;
  text: string;
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
  void idPrefix;

  return null;
}

export function VocabularyGraphLabel({
  idPrefix,
  text,
  y,
  width,
  height,
  radius,
  fontSize,
}: VocabularyGraphLabelProps) {
  void idPrefix;

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect
        x={-width / 2}
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
        x={-width / 2 + 0.16}
        y={y + 0.14}
        width={Math.max(width - 0.32, 0)}
        height={Math.max(height * 0.34, 0.56)}
        rx={Math.max(radius - 0.12, 0.5)}
        fill="var(--vocabulary-label-highlight)"
        opacity={1}
      />
      <rect
        x={-width / 2 + 0.14}
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
        x={0}
        y={y + height / 2 + 0.03}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--vocabulary-label-text)"
        fontSize={fontSize}
        fontWeight={700}
        letterSpacing={0.01}
      >
        {text}
      </text>
    </g>
  );
}