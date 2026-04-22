import { useEffect, useState } from "react";
import "./App.css";
import { clothingItems, presets, type Preset } from "./clothes";
import { BODY_PARTS, buildGameQueue } from "./buildGameQueue";
import {
  getInitialAppState,
  persistAppState,
  type AppStateSnapshot,
} from "./appPersistence";

type GameState =
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

type MobileTab = "preview" | "sidebar";

interface InitialAppState {
  activePreset: Preset;
  checked: Set<string>;
  game: GameState;
  mobileTab: MobileTab;
}

function App() {
  const [initialState] = useState<InitialAppState>(() => getInitialAppState());
  const [activePreset, setActivePreset] = useState<Preset>(
    initialState.activePreset,
  );
  const [checked, setChecked] = useState<Set<string>>(initialState.checked);
  const [game, setGame] = useState<GameState>(initialState.game);
  const [mobileTab, setMobileTab] = useState<MobileTab>(initialState.mobileTab);

  function createShuffleFrames(targetId: string) {
    const availableIds = clothingItems.map((item) => item.id);
    const randomFrames = Array.from({ length: 16 }, (_, index) => {
      const randomId =
        availableIds[Math.floor(Math.random() * availableIds.length)] ??
        targetId;

      if (index > 11 && Math.random() > 0.5) {
        return targetId;
      }

      return randomId;
    });

    return [...randomFrames, targetId, targetId];
  }

  function startShuffle(queue: string[], step: number) {
    const targetId = queue[step];

    setGame({
      phase: "shuffling",
      queue,
      step,
      frames: createShuffleFrames(targetId),
      index: 0,
    });
  }

  function renderLudzikOutline() {
    return (
      <>
        <ellipse
          cx="210"
          cy="48"
          rx="38"
          ry="44"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <path
          d="M 196 38 L 200 44"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 220 38 L 224 44"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 196 60 Q 210 72 224 60"
          fill="none"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="196"
          y1="92"
          x2="196"
          y2="138"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <line
          x1="224"
          y1="92"
          x2="224"
          y2="138"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <rect
          x="158"
          y="138"
          width="104"
          height="108"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <rect
          x="14"
          y="150"
          width="144"
          height="30"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <rect
          x="262"
          y="150"
          width="144"
          height="30"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <rect
          x="166"
          y="246"
          width="42"
          height="118"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
        />
        <rect
          x="212"
          y="246"
          width="42"
          height="118"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
        />
      </>
    );
  }

  function handlePreset(preset: Preset) {
    setActivePreset(preset);
    setChecked(new Set(preset.itemIds));
  }

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startGame() {
    const selectedIds = clothingItems
      .filter((item) => checked.has(item.id))
      .map((item) => item.id);
    const queue = buildGameQueue(selectedIds);

    if (queue.length === 0) return;

    setChecked(new Set());
    startShuffle(queue, 0);
  }

  function confirmItem() {
    if (game.phase !== "playing") return;
    const { queue, step } = game;
    const nextChecked = new Set(checked);
    nextChecked.add(queue[step]);
    setChecked(nextChecked);
    const nextStep = step + 1;
    if (nextStep >= queue.length) {
      setGame({ phase: "done" });
    } else {
      startShuffle(queue, nextStep);
    }
  }

  function exitGame() {
    setGame({ phase: "setup" });
  }

  useEffect(() => {
    const snapshot: AppStateSnapshot = {
      activePreset,
      checked,
      game,
      mobileTab,
    };
    persistAppState(snapshot);
  }, [activePreset.id, checked, game, mobileTab]);

  useEffect(() => {
    if (game.phase !== "shuffling") return;

    const isLastFrame = game.index >= game.frames.length - 1;
    const delay = isLastFrame ? 360 : game.index < 10 ? 90 : 140;

    const timeoutId = window.setTimeout(() => {
      if (isLastFrame) {
        setGame({ phase: "playing", queue: game.queue, step: game.step });
        return;
      }

      setGame((current) => {
        if (current.phase !== "shuffling") return current;

        return {
          ...current,
          index: current.index + 1,
        };
      });
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [game]);

  const currentItemId =
    game.phase === "playing"
      ? game.queue[game.step]
      : game.phase === "shuffling"
        ? game.frames[game.index]
        : null;
  const currentItem = currentItemId
    ? (clothingItems.find((item) => item.id === currentItemId) ?? null)
    : null;
  const progressValue =
    game.phase === "playing" || game.phase === "shuffling" ? game.step + 1 : 0;
  const progressTotal =
    game.phase === "playing" || game.phase === "shuffling"
      ? game.queue.length
      : 0;
  const progressRadius = 24;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset =
    (game.phase === "playing" || game.phase === "shuffling") &&
    progressTotal > 0
      ? progressCircumference * (1 - progressValue / progressTotal)
      : progressCircumference;

  return (
    <div className="app">
      {(game.phase === "playing" || game.phase === "shuffling") && (
        <div className="game-progress-ring" aria-label="Postęp ubierania">
          <svg
            className="game-progress-svg"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <circle className="game-progress-track" cx="32" cy="32" r="24" />
            <circle
              className="game-progress-value"
              cx="32"
              cy="32"
              r="24"
              strokeDasharray={progressCircumference}
              strokeDashoffset={progressOffset}
            />
          </svg>
          <span className="game-progress-label">
            {progressValue}/{progressTotal}
          </span>
        </div>
      )}

      {game.phase === "setup" && (
        <div
          className="mobile-tabs"
          role="tablist"
          aria-label="Widoki aplikacji"
        >
          <button
            className={`mobile-tab${mobileTab === "preview" ? " active" : ""}`}
            onClick={() => setMobileTab("preview")}
            type="button"
          >
            Podgląd
          </button>
          <button
            className={`mobile-tab${mobileTab === "sidebar" ? " active" : ""}`}
            onClick={() => setMobileTab("sidebar")}
            type="button"
          >
            Ubrania
          </button>
        </div>
      )}

      <div
        className={`figure-area${game.phase !== "setup" ? " figure-area-game" : ""}${game.phase === "setup" && mobileTab !== "preview" ? " mobile-hidden" : ""}`}
      >
        {(game.phase === "playing" || game.phase === "shuffling") &&
          currentItem && (
            <div className="game-stage-panel">
              <div className="game-panel">
                <p className="game-prompt">
                  {game.phase === "shuffling"
                    ? "Losowanie ubrania..."
                    : "Załóż teraz:"}
                </p>
                <div
                  className={`cloth-preview-frame${game.phase === "shuffling" ? " is-shuffling" : ""}`}
                >
                  <svg
                    key={
                      game.phase === "shuffling"
                        ? `${currentItem.id}-${game.index}`
                        : currentItem.id
                    }
                    className={`cloth-preview${game.phase === "shuffling" ? " is-flying" : ""}`}
                    viewBox="0 0 420 390"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label={`Podgląd ubrania: ${currentItem.label}`}
                  >
                    {currentItem.svgLayer}
                  </svg>
                </div>
                <p className="game-item-name">
                  <span
                    key={
                      game.phase === "shuffling"
                        ? `${currentItem.id}-label-${game.index}`
                        : currentItem.id
                    }
                    className="game-item-name-text"
                  >
                    {currentItem.label}
                  </span>
                </p>
              </div>
            </div>
          )}

        {game.phase === "done" && (
          <div className="game-stage-panel">
            <div className="game-panel">
              <p className="game-done-emoji">🎉</p>
              <p className="game-done-text">Ubrano!</p>
              <p className="game-done-sub">
                Wszystkie ubrania są już na sobie.
              </p>
              <button className="start-btn" onClick={exitGame}>
                Zagraj ponownie
              </button>
            </div>
          </div>
        )}

        <svg
          className="gingerbread"
          viewBox="0 0 420 390"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Ludzik do ubierania"
        >
          {renderLudzikOutline()}

          {/* Clothing layers — head is drawn just before hands; lower layer stays closer to skin within each group. */}
          {clothingItems
            .filter((item) => checked.has(item.id))
            .sort((a, b) => {
              const renderPriority = (bodyPart: string) => {
                if (bodyPart === "hands") return 2;
                if (bodyPart === "head") return 1;
                return 0;
              };

              const priorityDiff =
                renderPriority(a.bodyPart) - renderPriority(b.bodyPart);
              if (priorityDiff !== 0) return priorityDiff;

              return a.layer - b.layer;
            })
            .map((item) => item.svgLayer)}
        </svg>

        {game.phase === "playing" && (
          <div className="game-actions">
            <button className="confirm-btn" onClick={confirmItem}>
              ✓ Mam na sobie!
            </button>
            <button className="exit-btn" onClick={exitGame}>
              Wróć
            </button>
          </div>
        )}
      </div>

      {game.phase === "setup" && (
        <aside
          className={`sidebar${mobileTab !== "sidebar" ? " mobile-hidden" : ""}`}
        >
          <h2>Ubierz mnie!</h2>

          <div className="sidebar-scroll">
            <div className="presets">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className={`preset-btn${activePreset.id === preset.id ? " active" : ""}`}
                  onClick={() => handlePreset(preset)}
                >
                  {preset.emoji} {preset.label}
                </button>
              ))}
            </div>

            <p className="sidebar-hint">Wybierz ubrania:</p>

            <ul className="clothes-list">
              {BODY_PARTS.map(({ id: partId, label: partLabel }) => {
                const partItems = clothingItems
                  .filter((item) => item.bodyPart === partId)
                  .sort((a, b) => a.layer - b.layer);
                if (partItems.length === 0) return null;
                return (
                  <li key={partId} className="clothes-group">
                    <span className="clothes-group-label">{partLabel}</span>
                    <ul className="clothes-group-list">
                      {partItems.map((item) => {
                        const isItemDisabled =
                          !checked.has(item.id) &&
                          clothingItems.some(
                            (other) =>
                              other.id !== item.id &&
                              other.bodyPart === item.bodyPart &&
                              other.layer === item.layer &&
                              checked.has(other.id),
                          );
                        return (
                          <li key={item.id}>
                            <label
                              className={`clothes-item${
                                isItemDisabled ? " is-disabled" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked.has(item.id)}
                                onChange={() => toggleItem(item.id)}
                                disabled={isItemDisabled}
                              />
                              {item.label}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="sidebar-footer">
            <button
              className="start-btn"
              onClick={startGame}
              disabled={checked.size === 0}
            >
              ▶ Zacznij ubieranie
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
