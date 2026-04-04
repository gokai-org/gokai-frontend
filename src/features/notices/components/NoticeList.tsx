"use client";

import { AnimatePresence } from "framer-motion";
import type { Notice } from "@/features/notices/types";
import { NoticeCardRouter } from "./NoticeCardRouter";
import NoticeEmptyState from "./NoticeEmptyState";

interface NoticeListProps {
  notices: Notice[];
  searchQuery: string;
  showUnreadOnly: boolean;
  onReset: () => void;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function NoticeList({
  notices,
  searchQuery,
  showUnreadOnly,
  onReset,
  onToggleRead,
  onTogglePin,
  onDelete,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
}: NoticeListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <NoticeCardRouter
              key={notice.id}
              notice={notice}
              onToggleRead={onToggleRead}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
              animationsEnabled={animationsEnabled}
              heavyAnimationsEnabled={heavyAnimationsEnabled}
            />
          ))
        ) : (
          <NoticeEmptyState
            key="empty"
            searchQuery={searchQuery}
            showUnreadOnly={showUnreadOnly}
            onReset={onReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
