import {
  Children,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  type SVGProps,
  useEffect,
  useLayoutEffect,
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

const MORPH_PARTICLE_WAVE_SIZE = 50;
const MORPH_PARTICLE_MAX_DELAY_MS = 80;
const MORPH_PARTICLE_MIN_DURATION_MS = 900;
const MORPH_PARTICLE_MAX_DURATION_MS = 1500;
const MORPH_PARTICLE_START_RADIUS_MIN = 24;
const MORPH_PARTICLE_START_RADIUS_MAX = 58;
const MORPH_PARTICLE_TRAVEL_EXTRA_MIN = 70;
const MORPH_PARTICLE_TRAVEL_EXTRA_MAX = 132;
const MORPH_PARTICLE_CLEAR_DELAY_MS =
  MORPH_PARTICLE_MAX_DELAY_MS + MORPH_PARTICLE_MAX_DURATION_MS + 140;

interface MorphParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
}

interface MorphParticleWave {
  id: number;
  particles: MorphParticle[];
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMorphParticles(seed: number, count: number): MorphParticle[] {
  const random = createSeededRandom(seed);

  return Array.from({ length: count }, (_, id) => {
    const angle = random() * Math.PI * 2;
    const startRadius =
      MORPH_PARTICLE_START_RADIUS_MIN +
      random() *
        (MORPH_PARTICLE_START_RADIUS_MAX - MORPH_PARTICLE_START_RADIUS_MIN);
    const endRadius =
      startRadius +
      MORPH_PARTICLE_TRAVEL_EXTRA_MIN +
      random() *
        (MORPH_PARTICLE_TRAVEL_EXTRA_MAX - MORPH_PARTICLE_TRAVEL_EXTRA_MIN);

    return {
      id,
      startX: Math.cos(angle) * startRadius,
      startY: Math.sin(angle) * startRadius,
      endX: Math.cos(angle) * endRadius,
      endY: Math.sin(angle) * endRadius,
      size: 5 + random() * 8,
      rotate: -220 + random() * 440,
      delay: random() * MORPH_PARTICLE_MAX_DELAY_MS,
      duration:
        MORPH_PARTICLE_MIN_DURATION_MS +
        random() *
          (MORPH_PARTICLE_MAX_DURATION_MS - MORPH_PARTICLE_MIN_DURATION_MS),
    };
  });
}

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
  const [particleEmitterKey, setParticleEmitterKey] = useState<number | null>(
    null,
  );
  const [morphPathDs, setMorphPathDs] = useState<string[] | null>(null);
  const [morphParticleWaves, setMorphParticleWaves] = useState<
    MorphParticleWave[]
  >([]);
  const previousPreviewItemIdRef = useRef<string | null>(null);
  const morphTimeoutIdRef = useRef<number | null>(null);
  const morphRafIdRef = useRef<number | null>(null);
  const morphParticleCleanupTimeoutIdRef = useRef<number | null>(null);
  const morphParticleWaveIdRef = useRef(0);

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

  useLayoutEffect(() => {
    if (morphTimeoutIdRef.current !== null) {
      window.clearTimeout(morphTimeoutIdRef.current);
      morphTimeoutIdRef.current = null;
    }

    if (game.phase !== "playing" || !currentItemId) {
      setPreviewMorph(null);
      setParticleEmitterKey(null);
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
      setParticleEmitterKey(nextMorph.key);
      morphTimeoutIdRef.current = window.setTimeout(() => {
        setPreviewMorph((current) =>
          current && current.key === nextMorph.key ? null : current,
        );
      }, 1000);
    } else {
      setPreviewMorph(null);
      setParticleEmitterKey(null);
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
      if (morphParticleCleanupTimeoutIdRef.current !== null) {
        window.clearTimeout(morphParticleCleanupTimeoutIdRef.current);
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
  const shouldRenderPathMorph = canPathMorph && Boolean(activePreviewMorph);
  useEffect(() => {
    if (morphParticleCleanupTimeoutIdRef.current !== null) {
      window.clearTimeout(morphParticleCleanupTimeoutIdRef.current);
      morphParticleCleanupTimeoutIdRef.current = null;
    }

    if (particleEmitterKey === null) {
      morphParticleCleanupTimeoutIdRef.current = window.setTimeout(() => {
        setMorphParticleWaves([]);
      }, MORPH_PARTICLE_CLEAR_DELAY_MS);
      return;
    }

    setMorphParticleWaves([]);

    const spawnWave = () => {
      const waveId = ++morphParticleWaveIdRef.current;
      const particles = buildMorphParticles(
        particleEmitterKey + waveId * 7919,
        MORPH_PARTICLE_WAVE_SIZE,
      );

      setMorphParticleWaves([{ id: waveId, particles }]);
    };

    spawnWave();
    return;
  }, [particleEmitterKey]);

  useLayoutEffect(() => {
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
    setMorphPathDs(interpolators.map((morph) => morph(0)));

    const startedAt = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / 1000);
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
              {morphParticleWaves.length > 0 && (
                <div className="morph-particles" aria-hidden="true">
                  {morphParticleWaves.map((wave) =>
                    wave.particles.map((particle) => (
                      <span
                        key={`${particleEmitterKey}-${wave.id}-${particle.id}`}
                        className="morph-particle"
                        style={
                          {
                            "--particle-start-x": `${particle.startX}px`,
                            "--particle-start-y": `${particle.startY}px`,
                            "--particle-end-x": `${particle.endX}px`,
                            "--particle-end-y": `${particle.endY}px`,
                            "--particle-size": `${particle.size}px`,
                            "--particle-rot": `${particle.rotate}deg`,
                            "--particle-delay": `${particle.delay}ms`,
                            "--particle-duration": `${particle.duration}ms`,
                          } as CSSProperties
                        }
                      />
                    )),
                  )}
                </div>
              )}
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
                  morphFromPaths.length > 0 ? (
                    <g key={`morph-${activePreviewMorph.key}`}>
                      {morphToPaths.map((targetPath, index) => (
                        <path
                          key={`morph-path-${activePreviewMorph.key}-${index}`}
                          {...targetPath.props}
                          d={
                            morphPathDs?.[index] ??
                            morphFromPaths[index % morphFromPaths.length]?.d ??
                            targetPath.d
                          }
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
