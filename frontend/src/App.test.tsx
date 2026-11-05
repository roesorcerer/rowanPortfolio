import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

describe("App", () => {
  beforeEach(() => window.history.pushState({}, "", "/"));

  it("renders the landing page with Rowan's name", () => {
    renderWithProviders();
    expect(screen.getByRole("heading", { level: 1, name: /rowan\s*stratton/i })).toBeInTheDocument();
  });

  it("offers the game, the resume and the contact form", () => {
    renderWithProviders();
    expect(screen.getByRole("link", { name: "Play my story" })).toHaveAttribute("href", "/play");
    expect(screen.getByRole("link", { name: "View resume" })).toHaveAttribute("href", "/resume");
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
  });

  it("shows loading state while fetching projects", () => {
    renderWithProviders();
    expect(screen.getByText("Loading projects...")).toBeInTheDocument();
  });

  it("no longer hides an admin link behind the headshot", () => {
    renderWithProviders();
    expect(screen.queryByRole("link", { name: "Admin login" })).not.toBeInTheDocument();
  });

  it("shows a page for an address that doesn't exist", () => {
    window.history.pushState({}, "", "/no-such-page");
    renderWithProviders();
    expect(screen.getByRole("heading", { name: "A wall" })).toBeInTheDocument();
  });
});
