import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RequireAdmin from "./RequireAdmin";
import * as authApi from "../../api/auth";

// Renders a small routes tree with RequireAdmin wrapping a "secret"
// subroute and a fake login route, then asserts what the user sees based
// on what the server says about the session. The session is an HttpOnly
// cookie, so asking /api/auth/me (getSession) is the only way to know.
function renderAt(path: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin" element={<RequireAdmin />}>
            <Route path="projects" element={<div>Secret content</div>} />
          </Route>
          <Route path="/admin/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("RequireAdmin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to /admin/login when there is no session", async () => {
    vi.spyOn(authApi, "getSession").mockResolvedValue(null);
    renderAt("/admin/projects");
    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the protected outlet when the session is valid", async () => {
    vi.spyOn(authApi, "getSession").mockResolvedValue({
      _id: "a1",
      email: "admin@example.com",
      name: "Admin",
    });
    renderAt("/admin/projects");
    expect(await screen.findByText("Secret content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  // Neither screen until the server answers, so a signed-in admin never
  // sees the login page flash on reload.
  it("shows neither screen while the session is being checked", () => {
    vi.spyOn(authApi, "getSession").mockReturnValue(new Promise(() => {}));
    renderAt("/admin/projects");
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });
});
