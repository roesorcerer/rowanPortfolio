import { useEffect, useRef } from "react";
import { drawCorridor } from "./corridor";
import { useTheme } from "./theme";

function HeroCorridor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const dark = theme === "dark";
    const styles = getComputedStyle(canvas);
    const ink = styles.getPropertyValue("--p").trim();
    const you = styles.getPropertyValue("--you").trim();
    const pointer = { x: 0, y: 0, vx: 0, vy: 0 };
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };

    const draw = (time: number) => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * scale);
      const h = Math.round(canvas.clientHeight * scale);
      if (w && h) {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        pointer.vx += (pointer.x - pointer.vx) * 0.06;
        pointer.vy += (pointer.y - pointer.vy) * 0.06;
        drawCorridor(ctx, w, h, calm ? 3.2 : time / 1000, {
          vx: pointer.vx,
          vy: pointer.vy,
          ink,
          you,
          glow: dark,
        });
      }
      if (!calm) frame = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="hero-view" aria-hidden="true" />;
}

export default HeroCorridor;
