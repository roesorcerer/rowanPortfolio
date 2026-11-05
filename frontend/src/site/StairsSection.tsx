import { useState } from "react";
import { Link } from "react-router-dom";
import { FLOORS, FLOOR_SUMMARY, GAME_NAME, PAWN } from "../game/data";
import { spritePath } from "./Sprite";

const stepHeight = (i: number) => 84 - i * 9.5;

const titleCase = (text: string) =>
  text.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

function StairsSection() {
  const [stair, setStair] = useState(0);
  const floor = FLOORS[stair];

  return (
    <section id="story" className="sec" aria-labelledby="story-h">
      <h2 id="story-h" className="d strip">
        The long way down
      </h2>
      <div className="sec-body">
        <p className="lead">
          My path to software was not a straight line. Pick a floor to read that chapter, or
          play {titleCase(GAME_NAME)} from the beginning.
        </p>
        <div className="stairs">
          {FLOORS.map((item, i) => (
            <button
              key={item.name}
              className={i === stair ? "stair on" : "stair"}
              type="button"
              aria-pressed={i === stair}
              aria-label={`Floor ${i + 1}: ${item.name.slice(5)}`}
              style={{ height: `${stepHeight(i)}%` }}
              onMouseEnter={() => setStair(i)}
              onFocus={() => setStair(i)}
              onClick={() => setStair(i)}
            >
              B{i + 1}
            </button>
          ))}
          <svg
            className="pawn"
            viewBox="0 0 7 7"
            shapeRendering="crispEdges"
            aria-hidden="true"
            style={{ left: `${((stair + 0.5) / 8) * 100}%`, bottom: `${stepHeight(stair)}%` }}
          >
            <path d={spritePath(PAWN, "#")} fill="var(--you)" />
          </svg>
        </div>
        <div className="stair-detail" aria-live="polite">
          <div className="stair-copy">
            <h3 className="d stair-name">{floor.name.slice(5)}</h3>
            <p className="stair-when">{floor.when}</p>
            <p>{FLOOR_SUMMARY[stair]}</p>
          </div>
          <div className="actions">
            <Link className="cmd primary" to="/play?from=start">
              Play from the beginning
            </Link>
            <Link className="cmd" to={`/play?floor=${stair}`}>
              Go to B{stair + 1}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StairsSection;
