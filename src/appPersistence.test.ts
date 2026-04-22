import { beforeEach, describe, expect, it, vi } from "vitest";
import { presets } from "./clothes";
import { getInitialAppState, persistAppState } from "./appPersistence";

const STORAGE_KEY = "ubierz-sie-state-v1";

type StorageMap = Record<string, string>;

function mockWindowWithStorage(initial: StorageMap = {}) {
  const store: StorageMap = { ...initial };

  const localStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
  };

  vi.stubGlobal("window", { localStorage });

  return { localStorage, store };
}

describe("appPersistence", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns fallback state when storage is empty", () => {
    mockWindowWithStorage();

    const state = getInitialAppState();

    expect(state.activePreset.id).toBe(presets[0].id);
    expect(Array.from(state.checked).sort()).toEqual(
      [...presets[0].itemIds].sort(),
    );
    expect(state.game).toEqual({ phase: "setup" });
    expect(state.mobileTab).toBe("preview");
  });

  it("restores valid persisted state and sanitizes checked ids", () => {
    const persisted = {
      version: 1,
      activePresetId: "lato",
      checkedIds: ["spodenki", "spodnie", "buty", "nieznane-id"],
      game: { phase: "playing", queue: ["buty", "skarpetki"], step: 1 },
      mobileTab: "sidebar",
    };

    mockWindowWithStorage({ [STORAGE_KEY]: JSON.stringify(persisted) });

    const state = getInitialAppState();

    expect(state.activePreset.id).toBe("lato");
    expect(state.mobileTab).toBe("sidebar");
    expect(state.game).toEqual({
      phase: "playing",
      queue: ["buty", "skarpetki"],
      step: 1,
    });

    // Only one item per bodyPart+layer can survive sanitization.
    expect(state.checked.has("spodnie")).toBe(true);
    expect(state.checked.has("spodenki")).toBe(false);
    expect(state.checked.has("buty")).toBe(true);
  });

  it("falls back to setup game when persisted game payload is invalid", () => {
    const persisted = {
      version: 1,
      activePresetId: "zima",
      checkedIds: ["kurtka"],
      game: { phase: "playing", queue: ["kurtka"], step: 99 },
      mobileTab: "preview",
    };

    mockWindowWithStorage({ [STORAGE_KEY]: JSON.stringify(persisted) });

    const state = getInitialAppState();

    expect(state.game).toEqual({ phase: "setup" });
  });

  it("falls back when persisted schema version is unsupported", () => {
    const persisted = {
      version: 2,
      activePresetId: "lato",
      checkedIds: ["buty"],
      game: { phase: "done" },
      mobileTab: "sidebar",
    };

    mockWindowWithStorage({ [STORAGE_KEY]: JSON.stringify(persisted) });

    const state = getInitialAppState();

    expect(state.activePreset.id).toBe(presets[0].id);
    expect(state.game).toEqual({ phase: "setup" });
    expect(state.mobileTab).toBe("preview");
  });

  it("persists snapshot to localStorage", () => {
    const { localStorage } = mockWindowWithStorage();

    persistAppState({
      activePreset: presets[2],
      checked: new Set(["koszulka", "bluza", "spodnie"]),
      game: { phase: "done" },
      mobileTab: "sidebar",
    });

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, value] = localStorage.setItem.mock.calls[0] as [string, string];
    expect(key).toBe(STORAGE_KEY);

    expect(JSON.parse(value)).toEqual({
      version: 1,
      activePresetId: presets[2].id,
      checkedIds: ["koszulka", "bluza", "spodnie"],
      game: { phase: "done" },
      mobileTab: "sidebar",
    });
  });

  it("does not throw when localStorage write fails", () => {
    const { localStorage } = mockWindowWithStorage();
    localStorage.setItem.mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() =>
      persistAppState({
        activePreset: presets[0],
        checked: new Set(),
        game: { phase: "setup" },
        mobileTab: "preview",
      }),
    ).not.toThrow();
  });
});