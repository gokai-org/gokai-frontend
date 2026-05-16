import type { ReactNode } from "react";
import { PremiumFeatureGate } from "./PremiumFeatureGate";

interface PremiumLockedViewProps {
  preview: ReactNode;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featureLabel?: string;
  detailItems?: string[];
  caption?: string;
  hero?: ReactNode;
  className?: string;
  surfaceClassName?: string;
}

export function PremiumLockedView({
  preview,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  featureLabel,
  detailItems,
  caption,
  hero,
  className = "",
  surfaceClassName = "",
}: PremiumLockedViewProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[32px] border border-[#BA5149]/14 bg-surface-primary/92",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(186,81,73,0.08))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(37,10,16,0.24))]" />
      <div className={surfaceClassName}>{preview}</div>
      <PremiumFeatureGate
        title={title}
        description={description}
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        secondaryHref={secondaryHref}
        secondaryLabel={secondaryLabel}
        featureLabel={featureLabel}
        detailItems={detailItems}
        caption={caption}
        hero={hero}
      />
    </div>
  );
}