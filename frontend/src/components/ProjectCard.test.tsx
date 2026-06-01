import { render, screen } from "@testing-library/react";
import ProjectCard from "./ProjectCard";
import type { Project } from "../types";

const mockProject: Project = {
  _id: "abc123",
  title: "Test Project",
  category: "Web App",
  description: "A test project",
  image: "/assets/test.png",
  technologies: ["React", "Node.js"],
  order: 1,
  projectType: "featured",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ProjectCard", () => {
  it("renders project title and category", () => {
    render(<ProjectCard project={mockProject} index={0} />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Web App")).toBeInTheDocument();
  });

  it("renders the project image", () => {
    render(<ProjectCard project={mockProject} index={0} />);

    const img = screen.getByAltText("Test Project");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/assets/test.png");
  });

  it("renders an Explore trigger", () => {
    render(<ProjectCard project={mockProject} index={0} />);

    const trigger = screen.getByRole("button", { name: "Explore Test Project" });
    expect(trigger).toBeInTheDocument();
  });

  it("renders the demo link when project.link is available", () => {
    const projectWithLink = {
      ...mockProject,
      link: "https://example.com",
    };

    render(<ProjectCard project={projectWithLink} index={0} />);

    const demoLink = screen.getByLabelText("Open Test Project live demo");
    expect(demoLink).toHaveAttribute("href", "https://example.com");
  });
});
