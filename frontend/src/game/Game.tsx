import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { hasCaseStudy, projectPath } from "../lib/projectLinks";
import Sprite from "../site/Sprite";
import { ThemeToggle } from "../site/theme";
import { ENCOUNTERS, FLOORS, GAME_NAME, ROLES, type Encounter } from "./data";
import {
  TOTAL_CHAPTERS,
  chaptersOn,
  clearSave,
  commandsFor,
  enterFloor,
  initialState,
  loadGame,
  saveGame,
  type Command,
  type GameState,
} from "./logic";
import { aheadMark, mapPaths, townScene, viewOf, wirePath } from "./view";
import "./game.css";

/** /play resumes, ?from=start starts over, ?floor=2 walks straight to a floor. */
function startingState(params: URLSearchParams): GameState {
  const floor = Number(params.get("floor"));
  if (params.has("floor") && FLOORS[floor]) {
    return enterFloor(loadGame() ?? initialState(), floor);
  }
  if (params.get("from") === "start") {
    clearSave();
    return initialState(true);
  }
  return loadGame() ?? initialState();
}

function useBlip(enabled: boolean, sfx: GameState["sfx"]) {
  const context = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled || !sfx) return;
    context.current ??= new AudioContext();
    const audio = context.current;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = sfx[0];
    gain.gain.value = 0.03;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + sfx[1]);
  }, [enabled, sfx]);
}

function Corridor({ state }: { state: GameState }) {
  const direction = state.dir === 0 ? "north" : state.dir === 1 ? "east" : state.dir === 2 ? "south" : "west";
  const map = mapPaths(state);
  const step = state.anim ? `a-${state.anim}${state.tick % 2}` : "";

  return (
    <div className="wire-wrap">
      <div className="view-clip">
        <svg
          viewBox="0 0 300 300"
          role="img"
          aria-label={`Wireframe corridor view, facing ${direction}`}
          className={`view-svg ${step}`}
        >
          <path d="M1 1H299V299H1Z" fill="none" stroke="var(--p)" strokeWidth="1.5" />
          <path d={wirePath(state)} fill="none" stroke="var(--p)" strokeWidth="2" />
          <path d={aheadMark(state)} fill="var(--you)" />
        </svg>
      </div>
      <div className="map-wrap">
        <svg
          viewBox={`0 0 ${map.size} ${map.size}`}
          role="img"
          aria-label={`Floor map. ${map.left} left to see.`}
          className="map-svg"
        >
          <path d={map.walls} fill="var(--p)" fillOpacity="0.3" />
          <path d={map.found} fill="var(--p)" fillOpacity="0.55" />
          <path d={map.stairs} fill="none" stroke="var(--p)" strokeWidth="2" />
          <path d={map.stairsReady} fill="var(--p)" />
          <path d={map.todo} fill="var(--todo)" />
          <path d={map.you} fill="var(--you)" />
        </svg>
        <p className="map-key">
          Arrow: you. Large diamond: something to see. Square: stairs. Filled square: this floor
          is done.
        </p>
      </div>
    </div>
  );
}

function Scene({ state, sprite, campMap }: { state: GameState; sprite: string; campMap: string }) {
  const scene = useMemo(townScene, []);
  const fighting = state.screen === "encounter" && state.round >= 0;
  const encounter = state.enc ? ENCOUNTERS[state.enc] : null;
  const sparks = state.screen === "victory" && !encounter?.lost;

  return (
    <div className="art-box">
      {campMap && (
        <pre className="d camp-map" aria-hidden="true">
          {campMap}
        </pre>
      )}
      {sprite === "town" ? (
        <svg className="town" viewBox="0 0 320 200" aria-hidden="true">
          <path className="star-a" d={scene.a} fill="var(--p)" />
          <path className="star-b" d={scene.b} fill="var(--p)" />
          <circle cx="252" cy="44" r="16" fill="var(--you)" />
          <path d={scene.d} fill="none" stroke="var(--p)" strokeWidth="2" />
        </svg>
      ) : (
        sprite && (
          <Sprite name={sprite} className={fighting ? `sprite hit${state.round % 2}` : "sprite"} />
        )
      )}
      {sparks && (
        <div className="sparks">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}

function CommandButton({ command, onRun }: { command: Command; onRun: (c: Command) => void }) {
  if (command.href) {
    return (
      <a className="cmd" href={command.href} target="_blank" rel="noopener noreferrer">
        {command.label}
      </a>
    );
  }
  if (command.to && !command.key) {
    return (
      <Link className="cmd" to={command.to}>
        {command.label}
      </Link>
    );
  }
  return (
    <button
      className={command.primary ? "cmd primary" : "cmd"}
      type="button"
      onClick={() => onRun(command)}
    >
      {command.label}
    </button>
  );
}

function Game() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<GameState>(() => startingState(params));
  const [sound, setSound] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: projects } = useProjects();

  useBlip(sound, state.sfx);

  // The address only says where to start. Left in place, a refresh would start
  // over instead of resuming.
  useEffect(() => {
    if ([...params.keys()].length > 0) navigate("/play", { replace: true });
  }, [navigate, params]);

  useEffect(() => {
    document.title = `${GAME_NAME} | Rowan Stratton`;
  }, []);

  useEffect(() => saveGame(state), [state]);

  // Commands disappear between screens, which would drop keyboard focus.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, [state.screen]);

  useEffect(() => {
    if (state.banner === null) return;
    const timer = window.setTimeout(
      () => setState((current) => ({ ...current, banner: null })),
      1700
    );
    return () => window.clearTimeout(timer);
  }, [state.banner]);

  const studyPath = useCallback(
    (encounter: Encounter) => {
      const project = projects?.find(
        (item) => encounter.study?.test(item.title) && hasCaseStudy(item.caseStudy)
      );
      return project ? projectPath(project) : undefined;
    },
    [projects]
  );

  const commands = commandsFor(state, studyPath);

  const runCommand = useCallback(
    (command: Command) => {
      if (command.run) setState(command.run);
      else if (command.to) navigate(command.to);
    },
    [navigate]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (/^(INPUT|TEXTAREA)$/.test((event.target as HTMLElement).tagName)) return;
      const arrows: Record<string, string> = {
        ArrowUp: "f",
        ArrowLeft: "l",
        ArrowRight: "r",
        ArrowDown: "b",
      };
      const key =
        state.screen === "maze" && arrows[event.key] ? arrows[event.key] : event.key.toLowerCase();
      const command = commands.find((item) => item.key === key);
      if (command) {
        event.preventDefault();
        runCommand(command);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commands, runCommand, state.screen]);

  const view = viewOf(state);
  const floor = FLOORS[state.floor];
  const role = ROLES[state.role ?? "trav"];
  const chapters = chaptersOn(state.floor);
  const seenHere = chapters.filter((chapter) => state.cleared[chapter.id]).length;
  const inMaze = state.seen[state.floor];
  const banner = state.banner === null ? null : FLOORS[state.banner];

  return (
    <div className="game" ref={rootRef} tabIndex={-1}>
      {banner && (
        <button
          className="banner"
          type="button"
          onClick={() => setState((current) => ({ ...current, banner: null }))}
        >
          <span>
            Floor {(state.banner as number) + 1}. {banner.when}
          </span>
          <b>{banner.name.slice(5)}</b>
          <span>My class: {banner.rowan}</span>
        </button>
      )}

      <div className="game-bar">
        <p className="d game-title">{GAME_NAME}</p>
        <div className="game-tools">
          <span className="d game-score">
            CHAPTERS {Object.keys(state.cleared).length}/{TOTAL_CHAPTERS}
          </span>
          <Link className="cmd" to="/">
            SKIP GAME
          </Link>
          <button
            className="cmd"
            type="button"
            aria-pressed={sound}
            onClick={() => setSound((on) => !on)}
          >
            {sound ? "SOUND ON" : "SOUND OFF"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="game-screen">
        {view.showBox && (
          <section className="panel game-box" aria-label={view.showWire ? "Dungeon view" : "Scene"}>
            <div className="box-title">
              <span>{view.boxTitle}</span>
              <span>{view.boxRight}</span>
            </div>
            {view.showWire ? (
              <Corridor state={state} />
            ) : (
              <Scene state={state} sprite={view.sprite} campMap={view.campMap} />
            )}
          </section>
        )}

        <section className="panel game-log">
          <h1 className="d game-heading">{view.heading}</h1>

          {view.showWire && (
            <div className="goals">
              <p>
                THIS FLOOR: {seenHere} OF {chapters.length} SEEN
                {seenHere === chapters.length ? ". CLEARED!" : ""}
              </p>
              {chapters.map((chapter) => (
                <p key={chapter.id}>
                  {state.cleared[chapter.id] ? "[X]" : "[ ]"} {ENCOUNTERS[chapter.id].name}
                </p>
              ))}
            </div>
          )}

          <div className="game-text" aria-live="polite">
            {view.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="game-commands">
            {commands.map((command) => (
              <CommandButton key={command.label} command={command} onRun={runCommand} />
            ))}
          </div>
        </section>
      </div>

      <div className="panel roster-box">
        <div className="d roster" role="table" aria-label="Party roster">
          <div className="roster-row" role="row">
            <span role="columnheader">#</span>
            <span role="columnheader">CHARACTER</span>
            <span role="columnheader">CLASS</span>
            <span role="columnheader">LV</span>
            <span role="columnheader">STATUS</span>
          </div>
          <div className="roster-row" role="row">
            <span role="cell">1</span>
            <span role="cell">ROWAN STRATTON</span>
            <span role="cell">{inMaze ? floor.rowan : "ENGINEER, RESEARCHER"}</span>
            <span role="cell">{inMaze ? state.floor + 1 : 7}</span>
            <span role="cell">{inMaze ? floor.status : "OK"}</span>
          </div>
          <div className="roster-row" role="row">
            <span role="cell">2</span>
            <span role="cell">{state.role ? "YOU" : ". . . . . . ."}</span>
            <span role="cell">{state.role ? role.cls : "OPEN"}</span>
            <span role="cell">{state.role ? 1 : "-"}</span>
            <span role="cell">{state.role ? "OK" : "OPEN"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
