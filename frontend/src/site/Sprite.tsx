import { SPRITES } from "../game/data";

export function spritePath(rows: string[], ch: string) {
  let d = "";
  rows.forEach((row, y) =>
    row.split("").forEach((c, x) => {
      if (c === ch) d += `M${x} ${y}h1v1h-1z`;
    })
  );
  return d;
}

function Sprite({ name, className }: { name: string; className?: string }) {
  const rows = SPRITES[name] ?? [];
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={spritePath(rows, "#")} fill="var(--p)" />
      <path d={spritePath(rows, "+")} fill="var(--you)" />
    </svg>
  );
}

export default Sprite;
