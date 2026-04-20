import { useEffect, useState } from "react";

const MAX_WIDTH_MOBILE = 767;
const MAX_WIDTH_TABLET = 1023;

type Breakpoint = "mobile" | "tablet" | "desktop";

function getBreakpoint(width: number): Breakpoint {
  if (width <= MAX_WIDTH_MOBILE) return "mobile";
  if (width <= MAX_WIDTH_TABLET) return "tablet";
  return "desktop";
}

// Returns the current viewport width and a named breakpoint.
// Updates on window resize with a debounce to avoid excessive re-renders.
function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    getBreakpoint(window.innerWidth)
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handler = () => {
      clearTimeout(timeoutId);
      // 150ms debounce — fires once after the user stops resizing,
      // not on every pixel change.
      timeoutId = setTimeout(() => {
        const w = window.innerWidth;
        setWidth(w);
        setBreakpoint(getBreakpoint(w));
      }, 150);
    };

    window.addEventListener("resize", handler);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return { width, breakpoint };
}

export default useBreakpoint;
