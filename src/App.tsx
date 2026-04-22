import {
  Children,
  isValidElement,
  type ReactNode,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { interpolate } from "flubber";
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
  | { phase: "playing"; queue: string[]; step: number }
  | { phase: "done" };

type MobileTab = "preview" | "sidebar";

interface InitialAppState {
  activePreset: Preset;
  checked: Set<string>;
  game: GameState;
  mobileTab: MobileTab;
}

interface PreviewMorphTransition {
  fromId: string;
  toId: string;
  key: number;
}

interface SvgPathDescriptor {
  d: string;
  props: Omit<SVGProps<SVGPathElement>, "d" | "children">;
}

const PREVIEW_MORPH_DURATION_MS = 760;

function collectSvgPathDescriptors(node: ReactNode): SvgPathDescriptor[] {
  const descriptors: SvgPathDescriptor[] = [];

  function walk(current: ReactNode) {
    if (!isValidElement(current)) return;

    const element = current as {
      type: unknown;
      props: SVGProps<SVGPathElement> & { children?: ReactNode };
    };

    if (element.type === "path") {
      const { d, children: _children, ...rest } = element.props;
      if (typeof d === "string") {
        descriptors.push({ d, props: rest });
      }
    }

    Children.forEach(element.props.children, walk);
  }

  walk(node);
  return descriptors;
}

const itemPathMap = new Map(
  clothingItems.map((item) => [
    item.id,
    collectSvgPathDescriptors(item.svgLayer),
  ]),
);

function App() {
  const [initialState] = useState<InitialAppState>(() => getInitialAppState());
  const [activePreset, setActivePreset] = useState<Preset>(
    initialState.activePreset,
  );
  const [checked, setChecked] = useState<Set<string>>(initialState.checked);
  const [game, setGame] = useState<GameState>(initialState.game);
  const [mobileTab, setMobileTab] = useState<MobileTab>(initialState.mobileTab);
  const [previewMorph, setPreviewMorph] =
    useState<PreviewMorphTransition | null>(null);
  const [morphPathDs, setMorphPathDs] = useState<string[] | null>(null);
  const previousPreviewItemIdRef = useRef<string | null>(null);
  const morphTimeoutIdRef = useRef<number | null>(null);
  const morphRafIdRef = useRef<number | null>(null);

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
    setGame({ phase: "playing", queue, step: 0 });
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
      setGame({ phase: "playing", queue, step: nextStep });
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

  const currentItemId = game.phase === "playing" ? game.queue[game.step] : null;
  const currentItem = currentItemId
    ? (clothingItems.find((item) => item.id === currentItemId) ?? null)
    : null;
  const progressValue = game.phase === "playing" ? game.step + 1 : 0;
  const progressTotal = game.phase === "playing" ? game.queue.length : 0;
  const progressRadius = 24;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset =
    game.phase === "playing" && progressTotal > 0
      ? progressCircumference * (1 - progressValue / progressTotal)
      : progressCircumference;

  useEffect(() => {
    if (morphTimeoutIdRef.current !== null) {
      window.clearTimeout(morphTimeoutIdRef.current);
      morphTimeoutIdRef.current = null;
    }

    if (game.phase !== "playing" || !currentItemId) {
      setPreviewMorph(null);
      previousPreviewItemIdRef.current = null;
      return;
    }

    const previousId = previousPreviewItemIdRef.current;
    if (previousId && previousId !== currentItemId) {
      const nextMorph: PreviewMorphTransition = {
        fromId: previousId,
        toId: currentItemId,
        key: Date.now(),
      };
      setPreviewMorph(nextMorph);
      morphTimeoutIdRef.current = window.setTimeout(() => {
        setPreviewMorph((current) =>
          current && current.key === nextMorph.key ? null : current,
        );
      }, PREVIEW_MORPH_DURATION_MS);
    } else {
      setPreviewMorph(null);
    }

    previousPreviewItemIdRef.current = currentItemId;
  }, [currentItemId, game.phase]);

  useEffect(() => {
    return () => {
      if (morphTimeoutIdRef.current !== null) {
        window.clearTimeout(morphTimeoutIdRef.current);
      }
      if (morphRafIdRef.current !== null) {
        window.cancelAnimationFrame(morphRafIdRef.current);
      }
    };
  }, []);

  const activePreviewMorph =
    previewMorph &&
    currentItem &&
    previewMorph.toId === currentItem.id &&
    previewMorph.fromId !== previewMorph.toId
      ? previewMorph
      : null;
  const morphFromItem = activePreviewMorph
    ? (clothingItems.find((item) => item.id === activePreviewMorph.fromId) ??
      null)
    : null;
  const isPreviewMorphing = Boolean(activePreviewMorph && morphFromItem);
  const morphFromPaths = activePreviewMorph
    ? (itemPathMap.get(activePreviewMorph.fromId) ?? [])
    : [];
  const morphToPaths = activePreviewMorph
    ? (itemPathMap.get(activePreviewMorph.toId) ?? [])
    : [];
  const canPathMorph =
    isPreviewMorphing && morphFromPaths.length > 0 && morphToPaths.length > 0;
  const shouldRenderPathMorph =
    canPathMorph && Boolean(activePreviewMorph) && Boolean(morphPathDs);

  useEffect(() => {
    if (morphRafIdRef.current !== null) {
      window.cancelAnimationFrame(morphRafIdRef.current);
      morphRafIdRef.current = null;
    }

    if (!canPathMorph || !activePreviewMorph) {
      setMorphPathDs(null);
      return;
    }

    const interpolators = morphToPaths.map((targetPath, index) =>
      interpolate(
        morphFromPaths[index % morphFromPaths.length].d,
        targetPath.d,
        {
          maxSegmentLength: 2,
        },
      ),
    );

    const startedAt = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / PREVIEW_MORPH_DURATION_MS);
      setMorphPathDs(interpolators.map((morph) => morph(progress)));

      if (progress < 1) {
        morphRafIdRef.current = window.requestAnimationFrame(animate);
      } else {
        morphRafIdRef.current = null;
      }
    };

    morphRafIdRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (morphRafIdRef.current !== null) {
        window.cancelAnimationFrame(morphRafIdRef.current);
        morphRafIdRef.current = null;
      }
    };
  }, [activePreviewMorph?.key, canPathMorph]);

  return (
    <div className="app">
      {game.phase === "playing" && (
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
        {game.phase === "playing" && currentItem && (
          <div className="game-stage-panel">
            <div className="game-panel">
              <p className="game-prompt">Załóż teraz:</p>
              <div
                className={`cloth-preview-frame${isPreviewMorphing ? " is-morphing" : ""}`}
              >
                <svg
                  className="cloth-preview"
                  viewBox="0 0 420 390"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label={`Podgląd ubrania: ${currentItem.label}`}
                >
                  {shouldRenderPathMorph &&
                  activePreviewMorph &&
                  morphPathDs ? (
                    <g key={`morph-${activePreviewMorph.key}`}>
                      {morphToPaths.map((targetPath, index) => (
                        <path
                          key={`morph-path-${activePreviewMorph.key}-${index}`}
                          {...targetPath.props}
                          d={morphPathDs[index] ?? targetPath.d}
                        />
                      ))}
                    </g>
                  ) : (
                    <g key={currentItem.id}>{currentItem.svgLayer}</g>
                  )}
                </svg>
              </div>
              <p className="game-item-name">
                <span key={currentItem.id} className="game-item-name-text">
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
