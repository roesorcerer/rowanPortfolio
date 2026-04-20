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
  it("renders the navigation with Rowan's name", () => {
    renderWithProviders();
    // The header shows "Rowan Stratton" on tablet/desktop breakpoints
    expect(screen.getByText("Rowan Stratton")).toBeInTheDocument();
  });

  it("renders the hero text", () => {
    renderWithProviders();
    expect(
      screen.getByText(/CS Master's student and explorer of HCI/i)
    ).toBeInTheDocument();
  });

  it("shows loading state while fetching projects", () => {
    renderWithProviders();
    expect(screen.getByText("Loading projects...")).toBeInTheDocument();
  });
});
