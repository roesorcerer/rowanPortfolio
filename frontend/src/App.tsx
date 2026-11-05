import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import LoadingPulse from "./components/LoadingPulse";
import ProjectPage from "./components/ProjectPage";
import { AnalyticsProvider, fetchAnalyticsAdapter } from "./analytics";
import Landing from "./site/Landing";
import NotFoundPage from "./site/NotFoundPage";
import SiteShell from "./site/SiteShell";

// Split off so a visitor reading the landing page doesn't download the admin,
// the resume or the game until they go there.
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const ProjectsTab = lazy(() => import("./components/admin/ProjectsTab"));
const AnalyticsTab = lazy(() => import("./components/admin/AnalyticsTab"));
const MessagesTab = lazy(() => import("./components/admin/MessagesTab"));
const RequireAdmin = lazy(() => import("./components/admin/RequireAdmin"));
const Resume = lazy(() => import("./components/Resume"));
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

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider adapter={fetchAnalyticsAdapter}>
        <AppRoutes />
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
