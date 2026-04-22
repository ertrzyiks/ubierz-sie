import { clothingItems, presets, type Preset } from "./clothes";

export type PersistedGameState =
  | { phase: "setup" }
  | {
      phase: "shuffling";
      queue: string[];
      step: number;
      frames: string[];
      index: number;
    }
  | { phase: "playing"; queue: string[]; step: number }
  | { phase: "done" };

export type PersistedMobileTab = "preview" | "sidebar";

export interface AppStateSnapshot {
  activePreset: Preset;
  checked: Set<string>;
  game: PersistedGameState;
  mobileTab: PersistedMobileTab;
}

interface PersistedAppState {
  version: 1;
  activePresetId: string;
  checkedIds: string[];
  game: PersistedGameState;
  mobileTab: PersistedMobileTab;
}

const STORAGE_KEY = "ubierz-sie-state-v1";
const FALLBACK_PRESET = presets[0];
const VALID_ITEM_IDS = new Set(clothingItems.map((item) => item.id));

function isMobileTab(value: unknown): value is PersistedMobileTab {
  return value === "preview" || value === "sidebar";
}

function sanitizeCheckedIds(checkedIds: string[]): Set<string> {
  const byBodyPartAndLayer = new Set<string>();
  const nextChecked = new Set<string>();

  for (const item of clothingItems) {
    if (!checkedIds.includes(item.id)) continue;

    const key = `${item.bodyPart}:${item.layer}`;
    if (byBodyPartAndLayer.has(key)) continue;

    byBodyPartAndLayer.add(key);
    nextChecked.add(item.id);
  }

  return nextChecked;
}

function sanitizeQueue(queue: unknown): string[] | null {
  if (!Array.isArray(queue)) return null;

  const sanitized = queue.filter(
    (id): id is string => typeof id === "string" && VALID_ITEM_IDS.has(id),
  );

  if (sanitized.length !== queue.length) return null;
  return sanitized;
}

function sanitizePersistedGameState(game: unknown): PersistedGameState {
  if (!game || typeof game !== "object") return { phase: "setup" };

  const gameRecord = game as Record<string, unknown>;

  const phase = typeof gameRecord.phase === "string" ? gameRecord.phase : null;

  if (phase === "setup" || phase === "done") {
    return { phase };
  }

  if (phase === "playing") {
    const queue = sanitizeQueue(gameRecord.queue);
    const step =
      typeof gameRecord.step === "number" ? gameRecord.step : Number.NaN;

    if (!queue || queue.length === 0 || !Number.isInteger(step)) {
      return { phase: "setup" };
    }

    if (step < 0 || step >= queue.length) {
      return { phase: "setup" };
    }

    return { phase: "playing", queue, step };
  }

  if (phase === "shuffling") {
    const queue = sanitizeQueue(gameRecord.queue);
    const frames = sanitizeQueue(gameRecord.frames);
    const step =
      typeof gameRecord.step === "number" ? gameRecord.step : Number.NaN;
    const index =
      typeof gameRecord.index === "number" ? gameRecord.index : Number.NaN;

    if (
      !queue ||
      queue.length === 0 ||
      !frames ||
      frames.length === 0 ||
      !Number.isInteger(step) ||
      !Number.isInteger(index)
    ) {
      return { phase: "setup" };
    }

    if (
      step < 0 ||
      step >= queue.length ||
      index < 0 ||
      index >= frames.length
    ) {
      return { phase: "setup" };
    }

    return { phase: "shuffling", queue, step, frames, index };
  }

  return { phase: "setup" };
}

export function getInitialAppState(): AppStateSnapshot {
  const fallback: AppStateSnapshot = {
    activePreset: FALLBACK_PRESET,
    checked: new Set(FALLBACK_PRESET.itemIds),
    game: { phase: "setup" },
    mobileTab: "preview",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;

    const persisted = parsed as Partial<PersistedAppState>;
    if (persisted.version !== 1) return fallback;

    const activePreset =
      presets.find((preset) => preset.id === persisted.activePresetId) ??
      FALLBACK_PRESET;
    const checkedIds = Array.isArray(persisted.checkedIds)
      ? persisted.checkedIds.filter(
          (id): id is string =>
            typeof id === "string" && VALID_ITEM_IDS.has(id),
        )
      : activePreset.itemIds;

    return {
      activePreset,
      checked: sanitizeCheckedIds(checkedIds),
      game: sanitizePersistedGameState(persisted.game),
      mobileTab: isMobileTab(persisted.mobileTab)
        ? persisted.mobileTab
        : "preview",
    };
  } catch {
    return fallback;
  }
}

export function persistAppState(state: AppStateSnapshot): void {
  if (typeof window === "undefined") return;

  const persistedState: PersistedAppState = {
    version: 1,
    activePresetId: state.activePreset.id,
    checkedIds: Array.from(state.checked),
    game: state.game,
    mobileTab: state.mobileTab,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch {
    // Ignore storage errors (e.g. private mode quota limits).
  }
}
