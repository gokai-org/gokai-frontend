"use client";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

import {
  HelpBanner,
  HelpTabs,
  HelpGuidesSection,
  HelpFaqSection,
  HelpTipsSection,
  HelpSupportCTA,
  HelpSkeleton,
} from "@/features/help";
import { useHelpPage } from "@/features/help/hooks/useHelpPage";

export default function HelpPageRoute() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredFaqs,
    supportOpen,
    setSupportOpen,
    handleStartGuide,
    SupportModal,
  } = useHelpPage();

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  if (loading) {
    return (
      <DashboardShell>
        <HelpSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 pb-12">
        <AnimatedEntrance
          index={0}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <HelpBanner
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocusFaq={() => setActiveTab("faq")}
            animationsEnabled={animationsEnabled}
            heavyAnimationsEnabled={heavyAnimationsEnabled}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <HelpTabs activeTab={activeTab} onChange={setActiveTab} />
        </AnimatedEntrance>

        <div className="space-y-10">
          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            {activeTab === "guides" && (
              <HelpGuidesSection
                onStartGuide={handleStartGuide}
                animationsEnabled={animationsEnabled}
                heavyAnimationsEnabled={heavyAnimationsEnabled}
              />
            )}

            {activeTab === "faq" && (
              <HelpFaqSection
                searchQuery={searchQuery}
                faqs={filteredFaqs}
                animationsEnabled={animationsEnabled}
                heavyAnimationsEnabled={heavyAnimationsEnabled}
              />
            )}

            {activeTab === "tips" && (
              <HelpTipsSection
                animationsEnabled={animationsEnabled}
                heavyAnimationsEnabled={heavyAnimationsEnabled}
              />
            )}
          </AnimatedEntrance>

          <AnimatedEntrance
            index={3}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <HelpSupportCTA
              onContactSupport={() => setSupportOpen(true)}
              animationsEnabled={animationsEnabled}
              heavyAnimationsEnabled={heavyAnimationsEnabled}
            />
          </AnimatedEntrance>
        </div>
      </div>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </DashboardShell>
  );
}
