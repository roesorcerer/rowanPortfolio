import {
  DIRS,
  DIR_NAMES,
  ENCOUNTERS,
  FLOORS,
  PLACES,
  ROLES,
  type Encounter,
  type Link,
  type RoleKey,
} from "./data";

// The rules of the game, with no React in them. Every move is a function from
// one state to the next, which is what lets logic.test.ts play the whole game.

export type Screen =
  | "class"
  | "quest"
  | "town"
  | "place"
  | "maze"
  | "encounter"
  | "victory"
  | "camp";

export interface GameState {
  screen: Screen;
  role: RoleKey | null;
  floor: number;
  x: number;
  y: number;
  dir: number;
  cleared: Record<string, boolean>;
  seen: Record<number, boolean>;
  visited: Record<string, boolean>;
  enc: string | null;
  round: number;
  msg: string;
  place: string | null;
  justArrived: boolean;
  fromStart: boolean;
  /** The floor whose title card is showing. */
  banner: number | null;
  anim: "" | "f" | "l" | "r";
  tick: number;
  /** The last sound asked for, as [frequency, seconds]. */
  sfx: [number, number] | null;
}

export interface Command {
  key?: string;
  label: string;
  primary?: boolean;
  run?: (state: GameState) => GameState;
  /** An outside link. */
  href?: string;
  /** A page on this site. */
  to?: string;
}

export interface Target {
  x: number;
  y: number;
  name: string;
  id?: string;
  stairs?: boolean;
}

type Point = { x: number; y: number };

export const TOTAL_CHAPTERS = Object.keys(ENCOUNTERS).length;

export function initialState(fromStart = false): GameState {
  return {
    screen: "class",
    role: null,
    floor: 0,
    x: 1,
    y: 1,
    dir: 1,
    cleared: {},
    seen: {},
    visited: {},
    enc: null,
    round: 0,
    msg: "",
    place: null,
    justArrived: false,
    fromStart,
    banner: null,
    anim: "",
    tick: 0,
    sfx: null,
  };
}

export function tileAt(floor: number, x: number, y: number): string {
  return FLOORS[floor].map[y]?.[x] ?? "#";
}

export function floorCells(floor: number) {
  return FLOORS[floor].map.flatMap((row, y) =>
    row.split("").map((c, x) => ({ c, x, y }))
  );
}

/** A floor's chapters, in the order the story tells them. */
export function chaptersOn(floor: number) {
  return floorCells(floor)
    .filter((tile) => ENCOUNTERS[`${floor}${tile.c}`])
    .sort((a, b) => a.c.localeCompare(b.c))
    .map((tile) => ({ id: `${floor}${tile.c}`, x: tile.x, y: tile.y }));
}

/** The shortest walk between two tiles, with the direction of each step. */
export function route(floor: number, from: Point, to: Point) {
  const key = (p: Point) => `${p.x},${p.y}`;
  const previous = new Map<string, { from: Point | null; via: number }>();
  previous.set(key(from), { from: null, via: -1 });
  const queue: Point[] = [from];

  while (queue.length > 0) {
    const at = queue.shift() as Point;
    if (at.x === to.x && at.y === to.y) break;
    DIRS.forEach(([dx, dy], via) => {
      const next = { x: at.x + dx, y: at.y + dy };
      if (tileAt(floor, next.x, next.y) !== "#" && !previous.has(key(next))) {
        previous.set(key(next), { from: at, via });
        queue.push(next);
      }
    });
  }

  const path: (Point & { via: number })[] = [];
  let step: Point | null = previous.has(key(to)) ? to : null;
  while (step) {
    const link = previous.get(key(step)) as { from: Point | null; via: number };
    path.unshift({ x: step.x, y: step.y, via: link.via });
    step = link.from;
  }
  return path;
}

function markVisited(s: GameState, floor: number, x: number, y: number) {
  return { ...s.visited, [`${floor}:${x},${y}`]: true };
}

export function enterFloor(s: GameState, floor: number): GameState {
  const start = floorCells(floor).find((tile) => tile.c === "<");
  const x = start?.x ?? 1;
  const y = start?.y ?? 1;
  const dir = [0, 1, 2, 3].find(
    (d) => tileAt(floor, x + DIRS[d][0], y + DIRS[d][1]) !== "#"
  ) as number;
  const first = !s.seen[floor];

  return {
    ...s,
    banner: first ? floor : null,
    screen: "maze",
    floor,
    x,
    y,
    dir,
    msg: "",
    visited: markVisited(s, floor, x, y),
    seen: { ...s.seen, [floor]: true },
    justArrived: first,
    sfx: [330, 0.09],
  };
}

export function move(s: GameState): GameState {
  const nx = s.x + DIRS[s.dir][0];
  const ny = s.y + DIRS[s.dir][1];
  const tile = tileAt(s.floor, nx, ny);

  if (tile === "#") {
    return { ...s, msg: "OUCH! A WALL.", justArrived: false, sfx: [90, 0.12] };
  }

  const id = `${s.floor}${tile}`;
  const visited = markVisited(s, s.floor, nx, ny);
  if (ENCOUNTERS[id] && !s.cleared[id]) {
    return { ...s, x: nx, y: ny, screen: "encounter", enc: id, round: -1, msg: "", visited };
  }
  return {
    ...s,
    x: nx,
    y: ny,
    msg: "",
    justArrived: false,
    anim: "f",
    tick: s.tick + 1,
    visited,
    sfx: [180, 0.03],
  };
}

export function turn(s: GameState, by: number): GameState {
  return {
    ...s,
    dir: (s.dir + by + 4) % 4,
    msg: "",
    justArrived: false,
    anim: by > 0 ? "r" : "l",
    tick: s.tick + 1,
  };
}

/** What the Next command walks to: the next unseen chapter, then the stairs. */
export function nextTarget(s: GameState): Target | null {
  const left = chaptersOn(s.floor).find((chapter) => !s.cleared[chapter.id]);
  if (left) return { x: left.x, y: left.y, id: left.id, name: ENCOUNTERS[left.id].name };
  const down = floorCells(s.floor).find((tile) => tile.c === ">");
  return down ? { x: down.x, y: down.y, stairs: true, name: "STAIRS DOWN" } : null;
}

export function guide(s: GameState): GameState {
  const target = nextTarget(s);
  if (!target) return s;
  if (target.stairs && s.x === target.x && s.y === target.y) {
    return enterFloor(s, s.floor + 1);
  }

  const path = route(s.floor, { x: s.x, y: s.y }, target);
  if (path.length < 2) return s;

  const visited = { ...s.visited };
  path.forEach((p) => {
    visited[`${s.floor}:${p.x},${p.y}`] = true;
  });
  const dir = path[path.length - 1].via;
  const moved = { ...s, x: target.x, y: target.y, dir, visited, msg: "" };

  if (target.stairs) return { ...moved, justArrived: false };
  return { ...moved, screen: "encounter", enc: target.id as string, round: -1 };
}

export function ahead(s: GameState): { i: number; text: string } | null {
  const [dx, dy] = DIRS[s.dir];
  for (let i = 1; i <= 3; i++) {
    const tile = tileAt(s.floor, s.x + dx * i, s.y + dy * i);
    if (tile === "#") return null;
    if (tile === ">" || tile === "<") return { i, text: "Stairs ahead." };
    const id = `${s.floor}${tile}`;
    if (ENCOUNTERS[id] && !s.cleared[id]) return { i, text: "Something is ahead." };
  }
  return null;
}

export function fight(s: GameState): GameState {
  const encounter = ENCOUNTERS[s.enc as string];
  if (s.round + 1 < encounter.rounds.length) {
    return { ...s, round: s.round + 1, sfx: [240, 0.05] };
  }
  return {
    ...s,
    screen: "victory",
    cleared: { ...s.cleared, [s.enc as string]: true },
    sfx: encounter.lost ? [120, 0.14] : [520, 0.14],
  };
}

const go = (screen: Screen, extra: Partial<GameState> = {}) => (s: GameState): GameState => ({
  ...s,
  screen,
  msg: "",
  ...extra,
});

function button(key: string, label: string, run: Command["run"], primary = false): Command {
  return { key, label, run, primary };
}

const linkCommand = ([label, href]: Link): Command =>
  href.startsWith("/") ? { label: `${label} >`, to: href } : { label: `${label} >`, href };

/** Every command on the current screen. `studyPath` finds a case study's page. */
export function commandsFor(
  s: GameState,
  studyPath: (encounter: Encounter) => string | undefined = () => undefined
): Command[] {
  const toTown = go("town");
  const role = ROLES[s.role ?? "trav"];

  switch (s.screen) {
    case "class":
      return [
        ...(Object.keys(ROLES) as RoleKey[]).map((key) =>
          button(ROLES[key].key, ROLES[key].label, (state) =>
            state.fromStart
              ? enterFloor({ ...state, role: key, fromStart: false }, 0)
              : go("quest", { role: key })(state)
          )
        ),
        { key: "b", label: "B)ACK", to: "/" },
      ];

    case "quest": {
      const commands = [button("t", "T)O TOWN", toTown)];
      if (role.jump > 0) {
        commands.push(
          button("j", `J)UMP TO B${role.jump + 1}F`, (state) => enterFloor(state, role.jump))
        );
      }
      commands.push(button("b", "B)EGIN AT B1F", (state) => enterFloor(state, 0)));
      return commands;
    }

    case "town":
      return [
        button("g", "G)UILD HALL", go("place", { place: "guild" })),
        button("s", "S)MITHY", go("place", { place: "shop" })),
        button("l", "L)IBRARY", go("place", { place: "library" })),
        button("i", "I)NN", go("place", { place: "inn" })),
        button("e", "E)DGE OF TOWN", (state) =>
          enterFloor(state, state.seen[state.floor] ? state.floor : 0)
        ),
        button("q", "Q)UEST", go("quest")),
      ];

    case "place":
      return [
        button("l", "L)EAVE", toTown),
        ...(PLACES[s.place ?? ""]?.links ?? []).map(linkCommand),
      ];

    case "encounter":
      return [
        button("f", "F)ACE IT", fight),
        button("r", "R)UN", go("maze", { msg: "You back away. It will wait.", enc: null })),
      ];

    case "victory": {
      const encounter = ENCOUNTERS[s.enc as string];
      const study = studyPath(encounter);
      return [
        button("c", "C)ONTINUE", (state) =>
          go("maze", {
            enc: null,
            justArrived: false,
            msg: chaptersOn(state.floor).every((chapter) => state.cleared[chapter.id])
              ? "Floor cleared. You have seen everything here."
              : "",
          })(state)
        ),
        ...(study ? [{ label: "CASE STUDY >", to: study }] : []),
        ...encounter.links.map(linkCommand),
      ];
    }

    case "camp":
      return [
        button("r", "R)ETURN", go("maze")),
        button("t", "T)OWN", toTown),
        button("w", "W)HO AM I?", go("class")),
        ...FLOORS.map((_, i) =>
          button(String(i + 1), `${i + 1}) B${i + 1}F`, (state) => enterFloor(state, i))
        ),
      ];

    default:
      return mazeCommands(s, toTown);
  }
}

function mazeCommands(s: GameState, toTown: NonNullable<Command["run"]>): Command[] {
  const tile = tileAt(s.floor, s.x, s.y);
  const target = nextTarget(s);
  const onStairs = target?.stairs && s.x === target.x && s.y === target.y;
  const commands: Command[] = [];

  if (target) {
    const label = onStairs
      ? `N)EXT: B${s.floor + 2}F ${FLOORS[s.floor + 1].name.slice(5)}`
      : `N)EXT: ${target.name}`;
    commands.push(button("n", label, guide, true));
  } else {
    commands.push(button("t", "T)OWN: THE END FOR NOW", toTown, true));
  }

  commands.push(
    button("f", "F)ORWARD", move),
    button("l", "L)EFT", (state) => turn(state, -1)),
    button("r", "R)IGHT", (state) => turn(state, 1)),
    button("b", "B)ACK", (state) => turn(state, 2)),
    button("c", "C)AMP", go("camp"))
  );
  if (tile === ">") {
    commands.push(
      button("d", "D)OWN: NEXT CHAPTER", (state) => enterFloor(state, state.floor + 1))
    );
  }
  if (tile === "<") {
    commands.push(
      s.floor === 0
        ? button("u", "U)P: BACK TO TOWN", toTown)
        : button("u", "U)P: EARLIER CHAPTER", (state) => enterFloor(state, state.floor - 1))
    );
  }
  return commands;
}

export const directionName = (dir: number) => DIR_NAMES[dir];

// ---- Saving ----------------------------------------------------------------
// A visitor who leaves to read a case study should come back to the same spot.

const SAVE_KEY = "portfolio-game-save";

export function saveGame(s: GameState) {
  if (s.screen === "class") return;
  const { role, floor, x, y, dir, cleared, seen, visited } = s;
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ role, floor, x, y, dir, cleared, seen, visited })
    );
  } catch {
    // Without storage the game still plays. It just won't remember.
  }
}

export function clearSave() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<GameState>;
    const onMap =
      typeof saved.floor === "number" &&
      Boolean(FLOORS[saved.floor]) &&
      tileAt(saved.floor, saved.x ?? -1, saved.y ?? -1) !== "#";
    if (!onMap) return null;
    return { ...initialState(), ...saved, screen: "maze", msg: "Welcome back." };
  } catch {
    return null;
  }
}
