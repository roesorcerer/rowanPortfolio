import { Suspense, type MouseEvent } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider, ThemeToggle, useTheme } from "./theme";
import "./site.css";

const NAV = [
  { label: "About", to: "/#about" },
  { label: "Work", to: "/#work" },
  { label: "Story", to: "/#story" },
  { label: "Contact", to: "/#contact" },
  { label: "Resume", to: "/resume" },
];

function TopBar() {
  return (
    <header className="topbar">
      <Link to="/" className="d topbar-name">
        Rowan Stratton
      </Link>
      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <Link key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}

function trackPointer(event: MouseEvent<HTMLDivElement>) {
  const root = event.currentTarget;
  root.style.setProperty("--mx", `${event.clientX}px`);
  root.style.setProperty("--my", `${event.clientY}px`);
}

function Frame() {
  const { theme } = useTheme();
  const { pathname } = useLocation();
  const reading = pathname.startsWith("/projects/");
  const inGame = pathname === "/play";

  return (
    <div
      className={`site ${theme === "light" ? "paper" : "crt"} ${reading ? "reading" : ""}`}
      onMouseMove={reading ? undefined : trackPointer}
    >
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="torch" aria-hidden="true" />
      <div className="scan" aria-hidden="true" />
      <div className="site-page">
        {!inGame && <TopBar />}
        <main id="content" tabIndex={-1}>
          <Suspense fallback={<p className="doc-status">Loading...</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/** Everything a visitor sees: the landing page, the game and the case studies. */
function SiteShell() {
  return (
    <ThemeProvider>
      <Frame />
    </ThemeProvider>
  );
}

export default SiteShell;
