// Types
export type {
  MasteryState,
  MasteryModuleId,
  MasteryModuleConfig,
  MasterySnapshot,
  CelebrationPhase,
  CelebrationState,
  CameraTourWaypoint,
  CelebrationModalContent,
} from "./types";

// Constants
export {
  MASTERY_THRESHOLDS,
  MASTERY_MODULE_CONFIGS,
  MASTERY_MODULES,
  getMasteryCelebratedKey,
} from "./constants/masteryConfig";

// Hooks
export { useMasteryState } from "./hooks/useMasteryState";
export { useMasteryCelebration } from "./hooks/useMasteryCelebration";
export { useMasteryOrchestrator } from "./hooks/useMasteryOrchestrator";

// Utils
export {
  buildCameraTourWaypoints,
  getGoldenCount,
  isNodeGolden,
} from "./utils/graphMasteryAnimation";
export { MASTERY_GOLD, MASTERY_CSS_VARS } from "./utils/masteryColors";

// Components
export { MasteryThemeProvider, useMasteryTheme } from "./components/MasteryThemeProvider";
export { MasteryOverlay } from "./components/MasteryOverlay";
export { MasteryCelebrationModal } from "./components/MasteryCelebrationModal";
export { MasteryBoardWrapper } from "./components/MasteryBoardWrapper";
export {
  MasteredModulesProvider,
  useMasteredModules,
} from "./components/MasteredModulesProvider";
