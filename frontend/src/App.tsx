import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Navigation from "./components/Header";
import Main from "./components/Main";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProjectsTab from "./components/admin/ProjectsTab";
import AnalyticsTab from "./components/admin/AnalyticsTab";
import MessagesTab from "./components/admin/MessagesTab";
import RequireAdmin from "./components/admin/RequireAdmin";
import Resume from "./components/Resume";
import { AnalyticsProvider, fetchAnalyticsAdapter } from "./analytics";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navigation />
            <Main />
          </>
        }
      />
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
