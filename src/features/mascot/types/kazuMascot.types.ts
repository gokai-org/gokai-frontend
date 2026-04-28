export type KazuMascotState =
  | "idle"
  | "focus"
  | "correct"
  | "wrong"
  | "reward"
  | "sleep"
  | "proud"
  | "determined"
  | "concerned";

export interface KazuSvgMascotProps {
  state: KazuMascotState;
  size?: number;
  className?: string;
  reducedMotion?: boolean;
}

export interface UseKazuMascotOptions {
  initialState?: KazuMascotState;
  autoIdleDelayMs?: Partial<Record<"correct" | "wrong" | "reward", number>>;
  inactivityDelayMs?: number;
}

export interface UseKazuMascotReturn {
  state: KazuMascotState;
  setState: (state: KazuMascotState) => void;
  onFocus: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  onReward: () => void;
  onIdle: () => void;
  onSleep: () => void;
}

export interface KazuMascotProps {
  state?: KazuMascotState;
  correctSignal?: number;
  wrongSignal?: number;
  rewardSignal?: number;
  size?: number;
  className?: string;
  reducedMotion?: boolean;
  focusOnHover?: boolean;
  ariaLabel?: string;
}
