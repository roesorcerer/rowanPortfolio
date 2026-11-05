import { DIRS, ENCOUNTERS, FLOORS, PLACES, ROLES } from "./data";
import { ahead, chaptersOn, directionName, floorCells, tileAt, type GameState } from "./logic";

// What each screen shows, worked out from the state. Game.tsx only draws it.

export interface View {
  heading: string;
  lines: string[];
  sprite: string;
  boxTitle: string;
  boxRight: string;
  showBox: boolean;
  showWire: boolean;
  campMap: string;
}

function wall(floor: number, x: number, y: number) {
  return tileAt(floor, x, y) === "#";
}

/** The first-person corridor, as one SVG path. */
export function wirePath(s: GameState) {
  const S = 300;
  const I = [0, 56, 100, 130, 150];
  const fw = DIRS[s.dir];
  const rt = DIRS[(s.dir + 1) % 4];
  const isWall = (ahead: number, side: number) =>
    wall(s.floor, s.x + fw[0] * ahead + rt[0] * side, s.y + fw[1] * ahead + rt[1] * side);

  let p = "";
  for (let i = 0; i < 4; i++) {
    const L = I[i];
    const N = I[i + 1];
    const R = S - L;
    const Q = S - N;
    p += isWall(i, -1)
      ? `M${L} ${L}L${N} ${N}M${L} ${R}L${N} ${Q}`
      : `M${L} ${N}H${N}M${L} ${Q}H${N}M${L} ${N}V${Q}`;
    p += `M${N} ${N}V${Q}`;
    p += isWall(i, 1)
      ? `M${R} ${L}L${Q} ${N}M${R} ${R}L${Q} ${Q}`
      : `M${R} ${N}H${Q}M${R} ${Q}H${Q}M${R} ${N}V${Q}`;
    p += `M${Q} ${N}V${Q}`;
    if (isWall(i + 1, 0)) {
      p += `M${N} ${N}H${Q}M${N} ${Q}H${Q}`;
      break;
    }
  }
  return p;
}

/** The diamond on the floor when something is coming up. */
export function aheadMark(s: GameState) {
  const next = ahead(s);
  if (!next) return "";
  const size = [0, 16, 10, 6][next.i];
  const ground = [0, 212, 186, 168][next.i];
  return `M150 ${ground - size}l${size} ${size}l${-size} ${size}l${-size} ${-size}z`;
}

function campMap(s: GameState) {
  const seenNear = (x: number, y: number) =>
    Object.keys(s.visited).some((key) => {
      const match = key.match(/^(\d+):(\d+),(\d+)$/);
      return (
        match &&
        Number(match[1]) === s.floor &&
        Math.abs(Number(match[2]) - x) <= 1 &&
        Math.abs(Number(match[3]) - y) <= 1
      );
    });

  return FLOORS[s.floor].map
    .map((row, y) =>
      row
        .split("")
        .map((c, x) => {
          if (x === s.x && y === s.y) return "@";
          if (c === "#") return seenNear(x, y) ? "#" : " ";
          if (!s.visited[`${s.floor}:${x},${y}`]) return " ";
          return c === ">" || c === "<" ? c : ".";
        })
        .join(" ")
    )
    .join("\n");
}

function mazeLines(s: GameState) {
  const floor = FLOORS[s.floor];
  const tile = tileAt(s.floor, s.x, s.y);
  const next = ahead(s);
  const lines: string[] = [];

  if (s.justArrived) lines.push(floor.story);
  if (s.msg) lines.push(s.msg);
  if (tile === ">") lines.push("You are on the stairs. Down is the next chapter.");
  if (tile === "<") {
    lines.push(
      s.floor === 0
        ? "You are on the stairs. Up is the town."
        : "You are on the stairs. Up is the earlier chapter."
    );
  }
  if (next) lines.push(next.text);
  if (lines.length === 0) lines.push("Press N to go to the next thing to see.");
  return lines;
}

export function viewOf(s: GameState): View {
  const floor = FLOORS[s.floor];
  const role = ROLES[s.role ?? "trav"];
  const encounter = s.enc ? ENCOUNTERS[s.enc] : null;
  const base: View = {
    heading: "",
    lines: [],
    sprite: "",
    boxTitle: "",
    boxRight: "",
    showBox: true,
    showWire: false,
    campMap: "",
  };

  switch (s.screen) {
    case "class":
      return {
        ...base,
        heading: "WHO IS JOINING THE PARTY?",
        boxTitle: "CHARACTER SELECT",
        sprite: "chest",
        lines: [
          "Pick a class. I will show you what you came for.",
          ...Object.values(ROLES).map((item) => `${item.cls}: ${item.pitch}`),
        ],
      };

    case "quest":
      return {
        ...base,
        heading: `YOUR QUEST, ${role.cls}`,
        boxTitle: "QUEST LOG",
        sprite: "tome",
        lines: role.quest,
      };

    case "town":
      return {
        ...base,
        heading: "COLERAINE, MN",
        boxTitle: "TOWN",
        sprite: "town",
        lines: ["This is home now. Where to?", "The Edge of Town leads down to the stairs."],
      };

    case "place": {
      const place = PLACES[s.place ?? ""];
      return {
        ...base,
        boxTitle: "TOWN",
        sprite: "town",
        heading: place?.heading ?? "THE GUILD HALL",
        lines: place?.lines ?? [
          "Name: Rowan Stratton",
          "Home: Coleraine, Minnesota",
          "Education: MS Computer Science, May 2026. BS Computer Science, October 2023.",
          role.guild,
        ],
      };
    }

    case "encounter": {
      const current = encounter as NonNullable<typeof encounter>;
      return {
        ...base,
        heading: `AN ENCOUNTER! ${current.name}`,
        boxTitle: floor.name,
        sprite: current.art,
        lines:
          s.round < 0
            ? ["It blocks the way.", "Face it to see what happened."]
            : current.rounds.slice(0, s.round + 1),
      };
    }

    case "victory": {
      const current = encounter as NonNullable<typeof encounter>;
      const note = s.role ? current.notes?.[s.role] : undefined;
      return {
        ...base,
        heading: current.lost
          ? "THE PARTY RETREATS"
          : current.win
            ? "VICTORY!"
            : current.end
              ? "TO BE CONTINUED"
              : "CHAPTER FOUND",
        boxTitle: floor.name,
        sprite: current.lost ? "storm" : current.end ? "void" : "chest",
        lines: [
          ...current.rounds,
          current.result,
          ...(note ? [`For the ${role.cls.toLowerCase()}: ${note}`] : []),
        ],
      };
    }

    case "camp":
      return {
        ...base,
        heading: "CAMP",
        boxTitle: floor.name,
        campMap: campMap(s),
        lines: [
          "The party rests. @ marks where you are.",
          `Facing ${directionName(s.dir).toLowerCase()}. ${floor.when}.`,
          "You can jump to any floor.",
        ],
      };

    default:
      return {
        ...base,
        heading: floor.name,
        boxTitle: floor.when,
        boxRight: directionName(s.dir),
        showWire: true,
        lines: mazeLines(s),
      };
  }
}

/** The overhead map, as a set of SVG paths. */
export function mapPaths(s: GameState) {
  const S = 24;
  const cells = floorCells(s.floor);
  const chapters = chaptersOn(s.floor);
  const done = chapters.every((chapter) => s.cleared[chapter.id]);
  const cell = (x: number, y: number) => `M${x * S} ${y * S}h${S}v${S}h${-S}z`;
  const gem = (x: number, y: number, r: number) =>
    `M${x * S + 12} ${y * S + 12 - r}l${r} ${r}l${-r} ${r}l${-r} ${-r}z`;
  const box = (x: number, y: number) => `M${x * S + 5} ${y * S + 5}h14v14h-14z`;
  const stairs = cells.filter((tile) => tile.c === "<" || tile.c === ">");
  const tip = [
    [12, 3, 21, 21, 3, 21],
    [21, 12, 3, 21, 3, 3],
    [12, 21, 3, 3, 21, 3],
    [3, 12, 21, 3, 21, 21],
  ][s.dir];

  return {
    size: FLOORS[s.floor].map.length * S,
    walls: cells.filter((tile) => tile.c === "#").map((tile) => cell(tile.x, tile.y)).join(""),
    todo: chapters.filter((c) => !s.cleared[c.id]).map((c) => gem(c.x, c.y, 8)).join(""),
    found: chapters.filter((c) => s.cleared[c.id]).map((c) => gem(c.x, c.y, 4)).join(""),
    stairs: stairs.map((tile) => box(tile.x, tile.y)).join(""),
    stairsReady: done
      ? stairs.filter((tile) => tile.c === ">").map((tile) => box(tile.x, tile.y)).join("")
      : "",
    you: `M${s.x * S + tip[0]} ${s.y * S + tip[1]}L${s.x * S + tip[2]} ${s.y * S + tip[3]}L${s.x * S + tip[4]} ${s.y * S + tip[5]}z`,
    left: chapters.filter((c) => !s.cleared[c.id]).length,
  };
}

/** The night sky over Coleraine: trees, a church, and the stars in two sets. */
export function townScene() {
  let d = "M0 150H320";
  let a = "";
  let b = "";
  [[18, 40], [46, 56], [76, 36], [104, 50], [196, 34], [226, 52], [262, 42], [296, 58]].forEach(
    ([x, height]) => {
      const top = 150 - height;
      d += `M${x} ${top}l-14 ${height * 0.45}h7l-11 ${height * 0.55}h36l-11 ${-height * 0.55}h7z`;
    }
  );
  d += "M130 150V98l10 -10l10 10V150M122 98h36M136 118h8v10h-8z";
  [[24, 170, 60], [110, 180, 80], [40, 190, 44], [210, 172, 70], [250, 188, 50]].forEach(
    ([x, y, width]) => {
      d += `M${x} ${y}h${width}`;
    }
  );
  [[20, 20], [62, 12], [96, 34], [140, 16], [182, 30], [214, 12], [290, 22], [304, 54], [38, 60]].forEach(
    ([x, y], i) => {
      const star = `M${x} ${y}h3v3h-3z`;
      if (i % 2) a += star;
      else b += star;
    }
  );
  return { d, a, b };
}
