"use client";

import { HELP_TABS } from "@/features/help/utils/help.constants";
import type { HelpTabKey } from "@/features/help/types";

interface HelpTabsProps {
  activeTab: HelpTabKey;
  onChange: (tab: HelpTabKey) => void;
}

export function HelpTabs({ activeTab, onChange }: HelpTabsProps) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-full bg-surface-tertiary p-1.5">
      {HELP_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300 ${
            activeTab === tab.key
              ? "bg-surface-primary text-accent shadow-sm"
              : "text-content-tertiary hover:text-content-secondary"
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}