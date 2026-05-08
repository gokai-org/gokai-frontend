"use client";

import { startTransition, useEffect, useState } from "react";
import { scheduleMapIdleWork } from "../lib/japanMapPerformance";

export function useDeferredGraphMount(activeKey: string | null, delay = 520) {
  const [mountedKey, setMountedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!activeKey) {
      return;
    }

    return scheduleMapIdleWork(
      () => {
        startTransition(() => {
          setMountedKey(activeKey);
        });
      },
      { delay, timeout: delay + 500 },
    );
  }, [activeKey, delay]);

  return Boolean(activeKey && mountedKey === activeKey);
}

