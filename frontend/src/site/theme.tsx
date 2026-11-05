import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// Light and dark for the public pages. The admin and the resume stay as they
// are: the theme only exists while a page inside SiteShell is mounted, because
// the tokens in site.css hang off <html data-theme>.

export type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

function initialTheme(): Theme {
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

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
