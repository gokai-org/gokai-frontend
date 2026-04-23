export const LIBRARY_DOCK_VISIBILITY_EVENT =
  "gokai:library-dock-visibility";

export type LibraryDockVisibilityDetail = {
  categoryId: string | null;
};

export function dispatchLibraryDockVisibility(categoryId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<LibraryDockVisibilityDetail>(
      LIBRARY_DOCK_VISIBILITY_EVENT,
      {
        detail: { categoryId },
      },
    ),
  );
}

export function subscribeLibraryDockVisibility(
  listener: (detail: LibraryDockVisibilityDetail) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<LibraryDockVisibilityDetail>;
    listener(customEvent.detail ?? { categoryId: null });
  };

  window.addEventListener(LIBRARY_DOCK_VISIBILITY_EVENT, handler);

  return () => {
    window.removeEventListener(LIBRARY_DOCK_VISIBILITY_EVENT, handler);
  };
}