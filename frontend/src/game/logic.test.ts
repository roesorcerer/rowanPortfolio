import { beforeEach, describe, expect, it } from "vitest";
import { ENCOUNTERS, FLOORS } from "./data";
import {
  TOTAL_CHAPTERS,
  chaptersOn,
  commandsFor,
  enterFloor,
  fight,
  floorCells,
  guide,
  initialState,
  loadGame,
  move,
  route,
  saveGame,
  type GameState,
} from "./logic";

function press(state: GameState, key: string) {
  const command = commandsFor(state).find((item) => item.key === key);
  if (!command?.run) throw new Error(`No ${key} on the ${state.screen} screen`);
  return command.run(state);
}

describe("the maps", () => {
  it("connects every chapter and both stairs on every floor", () => {
    FLOORS.forEach((_, floor) => {
      const start = floorCells(floor).find((tile) => tile.c === "<");
      const stops = [
        ...chaptersOn(floor),
        ...floorCells(floor).filter((tile) => tile.c === ">"),
      ];
      stops.forEach((stop) => {
        expect(route(floor, start as { x: number; y: number }, stop).length).toBeGreaterThan(0);
      });
    });
  });

  it("gives every chapter a place on a map", () => {
    const placed = FLOORS.flatMap((_, floor) => chaptersOn(floor).map((c) => c.id));
    expect(placed.sort()).toEqual(Object.keys(ENCOUNTERS).sort());
  });
});

describe("playing", () => {
  it("reaches the end by pressing Next alone", () => {
    let state = press(initialState(), "t");
    expect(state.screen).toBe("quest");
    state = enterFloor(state, 0);

    for (let i = 0; i < 500; i++) {
      if (state.screen === "encounter") state = press(state, "f");
      else if (state.screen === "victory") state = press(state, "c");
      else if (commandsFor(state).some((c) => c.key === "n")) state = guide(state);
      else break;
    }

    expect(Object.keys(state.cleared)).toHaveLength(TOTAL_CHAPTERS);
    expect(state.floor).toBe(FLOORS.length - 1);
    expect(commandsFor(state)[0].label).toBe("T)OWN: THE END FOR NOW");
  });

  it("stops at a wall and says so", () => {
    let state = enterFloor(initialState(), 0);
    state = { ...state, dir: 0 };
    expect(move(state).msg).toBe("OUCH! A WALL.");
    expect(move(state).y).toBe(state.y);
  });

  it("tells the story of an encounter a round at a time", () => {
    let state = guide(enterFloor(initialState(), 0));
    expect(state.screen).toBe("encounter");
    const rounds = ENCOUNTERS[state.enc as string].rounds.length;
    for (let i = 0; i <= rounds; i++) state = fight(state);
    expect(state.screen).toBe("victory");
  });

  it("goes straight to floor one when started from the beginning", () => {
    const state = press(initialState(true), "d");
    expect(state.screen).toBe("maze");
    expect(state.floor).toBe(0);
    expect(state.role).toBe("dev");
  });

  it("offers a case study link when one exists", () => {
    const state = { ...initialState(), screen: "victory" as const, enc: "6d" };
    const commands = commandsFor(state, (encounter) =>
      encounter.study?.test("The Archive - Stories to explore stress") ? "/projects/x" : undefined
    );
    expect(commands.find((c) => c.to === "/projects/x")).toBeTruthy();
  });
});

describe("saving", () => {
  beforeEach(() => window.localStorage.clear());

  it("picks up where the player left off", () => {
    const state = guide(enterFloor(initialState(), 2));
    saveGame(state);
    const loaded = loadGame();
    expect(loaded?.floor).toBe(2);
    expect(loaded?.screen).toBe("maze");
    expect(loaded?.x).toBe(state.x);
  });

  it("ignores a save that no longer fits the map", () => {
    window.localStorage.setItem("portfolio-game-save", JSON.stringify({ floor: 99 }));
    expect(loadGame()).toBeNull();
    window.localStorage.setItem("portfolio-game-save", "not json");
    expect(loadGame()).toBeNull();
  });
});
