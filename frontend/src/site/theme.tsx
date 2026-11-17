import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { endHydration, isHydrating } from "../lib/hydration";

// Light and dark for the public pages. The admin and the resume stay as they
// are: the theme only exists while a page inside SiteShell is mounted, because
// the tokens in site.css hang off <html data-theme>.

export type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

function storedTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});

// The visitor's choice lives in localStorage, which the prerender step can't
// read, so a prerendered page is always built dark. Reading storage in the
// first render would make the browser's markup disagree with the HTML it is
// hydrating, so while hydrating the theme starts as the server's (dark) and
// switches after mount.
//
// That switch has to be a transition. As a plain update it lands on the
// Suspense boundary around the page content while it is still hydrating,
// and React discards the server HTML inside it (error #421, seen in Chrome:
// headless Chrome prefers light). A transition waits for hydration to
// finish. A page rendered only in the browser, such as the game, reads the
// stored theme in its first render and never switches.
//
// The inline script in index.html has already set <html data-theme>, which
// is what the colours hang off, so the palette is right from the first
// paint either way; only the corridor art and the toggle's label catch up.
const SERVER_THEME: Theme = "dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [hydrated] = useState(isHydrating);
  const [theme, setTheme] = useState<Theme>(() =>
    hydrated ? SERVER_THEME : storedTheme()
  );

  useEffect(() => {
    if (!hydrated) return;
    endHydration();
    const stored = storedTheme();
    if (stored !== SERVER_THEME) startTransition(() => setTheme(stored));
  }, [hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    return () => {
      delete root.dataset.theme;
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The choice just won't be remembered.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="cmd"
      type="button"
      aria-pressed={theme === "light"}
      onClick={toggleTheme}
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}
