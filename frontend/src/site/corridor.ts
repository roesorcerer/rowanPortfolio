// The wireframe corridor behind the name on the landing page. It always walks
// forward, and leans toward the pointer.

interface CorridorOptions {
  vx: number;
  vy: number;
  ink: string;
  you: string;
  glow: boolean;
}

const hasDoor = (n: number) => ((n * 2654435761) >>> 0) % 5 === 0;

export function drawCorridor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  o: CorridorOptions
) {
  ctx.clearRect(0, 0, w, h);
  const cx = w * (0.5 + o.vx * 0.14);
  const cy = h * (0.5 + o.vy * 0.1);
  const W = w * 0.72;
  const H = h * 0.72;
  const phase = t * 0.24;
  const f = phase % 1;
  const base = Math.floor(phase);
  const N = 10;
  const ring = (i: number) => {
    const s = 1 / (1 + (i - f) * 0.62);
    return { hw: W * s, hh: H * s, a: Math.min(1, s * 1.5) };
  };
  const flick = 0.86 + 0.14 * Math.sin(t * 7.3) * Math.sin(t * 3.1);

  ctx.strokeStyle = o.ink;
  ctx.lineWidth = Math.max(1.5, w / 420);
  ctx.shadowColor = o.ink;
  ctx.shadowBlur = o.glow ? 8 : 0;
  ctx.globalAlpha = 0.9 * flick;

  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + sx * w * 1.4, cy + sy * h * 1.4);
    ctx.lineTo(cx + sx * W * 0.07, cy + sy * H * 0.07);
    ctx.stroke();
  });

  for (let i = N - 1; i >= 0; i--) {
    const a = ring(i);
    const b = ring(i + 1);
    ctx.globalAlpha = a.a * flick;
    ctx.strokeRect(cx - a.hw, cy - a.hh, a.hw * 2, a.hh * 2);
    [-1, 1].forEach((side) => {
      if (!hasDoor(base + i * (side + 3))) return;
      const x1 = cx + side * (a.hw + (b.hw - a.hw) * 0.28);
      const x2 = cx + side * (a.hw + (b.hw - a.hw) * 0.72);
      const h1 = a.hh + (b.hh - a.hh) * 0.28;
      const h2 = a.hh + (b.hh - a.hh) * 0.72;
      ctx.beginPath();
      ctx.moveTo(x1, cy + h1);
      ctx.lineTo(x1, cy - h1 * 0.5);
      ctx.lineTo(x2, cy - h2 * 0.5);
      ctx.lineTo(x2, cy + h2);
      ctx.stroke();
    });
  }

  ctx.globalAlpha = flick;
  ctx.shadowBlur = 0;
  ctx.fillStyle = o.you;
  const d = W * 0.035;
  ctx.fillRect(cx - d / 2, cy - d, d, d * 2);
  ctx.globalAlpha = 1;
}
