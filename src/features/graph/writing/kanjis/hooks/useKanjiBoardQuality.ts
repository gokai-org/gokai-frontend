"use client";

import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import {
  createWritingBoardQualityProfile,
  useWritingBoardQuality,
} from "../../shared/hooks/useWritingBoardQuality";
import type { KanjiBoardQualityProfile } from "../types";

export function createKanjiBoardQualityProfile(
  graphicsProfile: GraphicsProfile,
): KanjiBoardQualityProfile {
  return createWritingBoardQualityProfile(graphicsProfile);
}

export function useKanjiBoardQuality(graphicsProfile: GraphicsProfile) {
  return useWritingBoardQuality(graphicsProfile);
}
