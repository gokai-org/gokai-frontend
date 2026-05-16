"use client";

interface GrammarBoardBackdropProps {
  mastered?: boolean;
}

export function GrammarBoardBackdrop({ mastered = false }: GrammarBoardBackdropProps) {
  const accentLayers = mastered
    ? {
        primary:
          "absolute inset-0 opacity-[0.92] bg-[radial-gradient(ellipse_44%_34%_at_18%_26%,rgba(212,168,67,0.055)_0%,transparent_64%),radial-gradient(ellipse_38%_30%_at_78%_62%,rgba(184,146,46,0.038)_0%,transparent_60%),radial-gradient(ellipse_56%_40%_at_52%_84%,rgba(212,168,67,0.03)_0%,transparent_68%)] dark:bg-[radial-gradient(ellipse_44%_34%_at_18%_26%,rgba(240,210,122,0.06)_0%,transparent_64%),radial-gradient(ellipse_38%_30%_at_78%_62%,rgba(184,146,46,0.04)_0%,transparent_60%),radial-gradient(ellipse_56%_40%_at_52%_84%,rgba(212,168,67,0.03)_0%,transparent_68%)]",
        secondary:
          "absolute inset-0 opacity-[0.9] bg-[radial-gradient(ellipse_58%_44%_at_50%_42%,rgba(212,168,67,0.065)_0%,rgba(155,123,47,0.022)_54%,transparent_78%),radial-gradient(ellipse_34%_26%_at_22%_22%,rgba(200,158,60,0.034)_0%,transparent_58%),radial-gradient(ellipse_30%_24%_at_76%_74%,rgba(184,146,46,0.028)_0%,transparent_56%)] dark:bg-[radial-gradient(ellipse_58%_44%_at_50%_42%,rgba(240,210,122,0.08)_0%,rgba(155,123,47,0.03)_54%,transparent_78%),radial-gradient(ellipse_34%_26%_at_22%_22%,rgba(212,168,67,0.04)_0%,transparent_58%),radial-gradient(ellipse_30%_24%_at_76%_74%,rgba(184,146,46,0.03)_0%,transparent_56%)]",
      }
    : {
        primary:
          "absolute inset-0 opacity-[0.92] bg-[radial-gradient(ellipse_44%_34%_at_18%_26%,rgba(197,84,77,0.07)_0%,transparent_64%),radial-gradient(ellipse_38%_30%_at_78%_62%,rgba(156,47,40,0.048)_0%,transparent_60%),radial-gradient(ellipse_56%_40%_at_52%_84%,rgba(197,84,77,0.036)_0%,transparent_68%)] dark:bg-[radial-gradient(ellipse_44%_34%_at_18%_26%,rgba(239,128,120,0.075)_0%,transparent_64%),radial-gradient(ellipse_38%_30%_at_78%_62%,rgba(197,84,77,0.05)_0%,transparent_60%),radial-gradient(ellipse_56%_40%_at_52%_84%,rgba(197,84,77,0.04)_0%,transparent_68%)]",
        secondary:
          "absolute inset-0 opacity-[0.9] bg-[radial-gradient(ellipse_58%_44%_at_50%_42%,rgba(197,84,77,0.075)_0%,rgba(129,34,28,0.026)_54%,transparent_78%),radial-gradient(ellipse_34%_26%_at_22%_22%,rgba(176,64,57,0.04)_0%,transparent_58%),radial-gradient(ellipse_30%_24%_at_76%_74%,rgba(156,47,40,0.03)_0%,transparent_56%)] dark:bg-[radial-gradient(ellipse_58%_44%_at_50%_42%,rgba(239,128,120,0.09)_0%,rgba(129,34,28,0.035)_54%,transparent_78%),radial-gradient(ellipse_34%_26%_at_22%_22%,rgba(197,84,77,0.05)_0%,transparent_58%),radial-gradient(ellipse_30%_24%_at_76%_74%,rgba(156,47,40,0.04)_0%,transparent_56%)]",
      };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(162deg,#ffffff_0%,#fefefe_42%,#fdfcfc_72%,#faf8f8_100%)] dark:bg-[linear-gradient(162deg,#090909_0%,#0d0d0d_42%,#0a0a0a_72%,#080808_100%)]" />
      <div className={accentLayers.primary} />
      <div className={accentLayers.secondary} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(10,10,14,0.09)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_42%,rgba(4,4,4,0.7)_100%)]" />
    </div>
  );
}