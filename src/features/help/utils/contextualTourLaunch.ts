export const HELP_CONTEXTUAL_TOUR_REQUEST_STORAGE_KEY =
  "gokai:help-contextual-tour-request";

export type HelpContextualTourRequest = "vocabulary-graph";

export function queueHelpContextualTourRequest(
  request: HelpContextualTourRequest,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    HELP_CONTEXTUAL_TOUR_REQUEST_STORAGE_KEY,
    request,
  );
}

export function readHelpContextualTourRequest() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(
    HELP_CONTEXTUAL_TOUR_REQUEST_STORAGE_KEY,
  );

  return value === "vocabulary-graph" ? value : null;
}

export function clearHelpContextualTourRequest() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(HELP_CONTEXTUAL_TOUR_REQUEST_STORAGE_KEY);
}