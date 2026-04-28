import { useEffect, useState } from "react";

import {
  KAZU_EXPECTED_PATH_COUNT,
  KAZU_SVG_SOURCE,
} from "../constants/kazuMascot.svg";

let cachedKazuPaths: readonly string[] | null = null;
let kazuPathRequest: Promise<readonly string[]> | null = null;

export async function loadKazuSvgPaths() {
  if (cachedKazuPaths) return cachedKazuPaths;

  kazuPathRequest ??= fetch(KAZU_SVG_SOURCE)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${KAZU_SVG_SOURCE}`);
      }

      return response.text();
    })
    .then((svgMarkup) => {
      const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
      const paths = Array.from(document.querySelectorAll("path")).map(
        (path) => path.outerHTML,
      );

      if (process.env.NODE_ENV !== "production" && paths.length !== KAZU_EXPECTED_PATH_COUNT) {
        console.warn(
          `Kazu SVG path count changed from ${KAZU_EXPECTED_PATH_COUNT} to ${paths.length}. Review mascot path groups.`,
        );
      }

      cachedKazuPaths = paths;
      return paths;
    });

  return kazuPathRequest;
}

export function useKazuSvgPaths() {
  const [paths, setPaths] = useState<readonly string[]>(cachedKazuPaths ?? []);

  useEffect(() => {
    if (paths.length > 0) return;

    let mounted = true;

    loadKazuSvgPaths()
      .then((nextPaths) => {
        if (mounted) setPaths(nextPaths);
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.error(error);
        }
      });

    return () => {
      mounted = false;
    };
  }, [paths.length]);

  return paths;
}