import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import RequireAdmin from "./RequireAdmin";

// Renders a small routes tree with RequireAdmin wrapping a "secret"
// subroute and a fake login route, then asserts what the user sees
// based on whether a token is present in localStorage.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<RequireAdmin />}>
          <Route path="projects" element={<div>Secret content</div>} />
        </Route>
        <Route path="/admin/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequireAdmin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects to /admin/login when no token is present", () => {
    renderAt("/admin/projects");
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the protected outlet when a token is present", () => {
    localStorage.setItem("token", "fake-token");
    renderAt("/admin/projects");
    expect(screen.getByText("Secret content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});
