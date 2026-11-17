import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import LoadingPulse from "./components/LoadingPulse";
import ProjectPage from "./components/ProjectPage";
import Resume from "./components/Resume";
import { AnalyticsProvider, fetchAnalyticsAdapter } from "./analytics";
import Landing from "./site/Landing";
import NotFoundPage from "./site/NotFoundPage";
import SiteShell from "./site/SiteShell";

// Split off so a visitor reading the landing page doesn't download the admin
// or the game until they go there.
//
// The resume used to be split off too. Now that it is prerendered (see
// src/entry-server.tsx), a lazy resume costs more than it saves: its 2.5 kB
// gzipped chunk has to arrive before the prerendered page can hydrate, and
// the server render has to suspend for it. Every prerendered page (the
// landing page, the resume, permalinks, the 404) is eager for that reason;
// only routes served as the empty shell (app.html) are lazy.
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const ProjectsTab = lazy(() => import("./components/admin/ProjectsTab"));
const AnalyticsTab = lazy(() => import("./components/admin/AnalyticsTab"));
const MessagesTab = lazy(() => import("./components/admin/MessagesTab"));
const RequireAdmin = lazy(() => import("./components/admin/RequireAdmin"));
const Game = lazy(() => import("./game/Game"));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPulse />}>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/play" element={<Game />} />
          {/* The permalink a resume links to. Slug-based so the URL reads as the
              project's name, and stable across renames. */}
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminDashboard />}>
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="projects" element={<ProjectsTab />} />
            <Route path="analytics" element={<AnalyticsTab />} />
            <Route path="messages" element={<MessagesTab />} />
          </Route>
        </Route>
        <Route path="/resume" element={<Resume />} />
      </Routes>
    </Suspense>
  );
}

/**
 * The whole site without a router, so each environment supplies its own:
 * the browser a BrowserRouter (App, below), the prerender step a
 * StaticRouter at a fixed URL (src/entry-server.tsx). Both must render the
 * same tree for hydration to adopt the prerendered HTML.
 */
export function Site() {
  return (
    <AnalyticsProvider adapter={fetchAnalyticsAdapter}>
      <AppRoutes />
    </AnalyticsProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Site />
    </BrowserRouter>
  );
}

export default App;
