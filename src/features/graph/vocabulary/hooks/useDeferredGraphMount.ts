"use client";

import { startTransition, useEffect, useState } from "react";
import { scheduleMapIdleWork } from "../lib/japanMapPerformance";

export function useDeferredGraphMount(activeKey: string | null, delay = 520) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    if (!activeKey) {
      return;
    }

    return scheduleMapIdleWork(
      () => {
        startTransition(() => {
          setReady(true);
        });
      },
      { delay, timeout: delay + 500 },
    );
  }, [activeKey, delay]);

  return ready;
}

