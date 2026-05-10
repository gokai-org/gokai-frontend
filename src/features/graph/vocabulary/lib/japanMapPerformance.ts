export type ScheduledMapWorkOptions = {
  delay?: number;
  timeout?: number;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function scheduleMapIdleWork(
  callback: () => void,
  { delay = 0, timeout = 700 }: ScheduledMapWorkOptions = {},
) {
  let cancelled = false;
  let delayId: number | null = null;
  let rafId: number | null = null;
  let idleId: number | null = null;
  const idleWindow = window as IdleWindow;

  const run = () => {
    if (cancelled) {
      return;
    }

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(
        () => {
          if (!cancelled) {
            callback();
          }
        },
        { timeout },
      );
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = window.requestAnimationFrame(() => {
        if (!cancelled) {
          callback();
        }
      });
    });
  };

  if (delay > 0) {
    delayId = window.setTimeout(run, delay);
  } else {
    run();
  }

  return () => {
    cancelled = true;

    if (delayId !== null) {
      window.clearTimeout(delayId);
    }

    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }

    if (idleId !== null && typeof idleWindow.cancelIdleCallback === "function") {
      idleWindow.cancelIdleCallback(idleId);
    }
  };
}

