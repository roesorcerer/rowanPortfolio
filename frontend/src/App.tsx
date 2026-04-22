import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Header";
import Main from "./components/Main";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { usePageTracking } from "./hooks/usePageTracking";

export function sum(a: number, b: number): number {
  return a + b
}

function AppRoutes() {
  usePageTracking();
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
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
