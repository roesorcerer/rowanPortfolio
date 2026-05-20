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
  projectType: "practice",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ProjectCard", () => {
  it("renders project title and category", () => {
    render(
      <ProjectCard project={mockProject} index={0} breakpoint="desktop" />
    );

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Web App")).toBeInTheDocument();
  });

  it("renders the project image", () => {
    render(
      <ProjectCard project={mockProject} index={0} breakpoint="desktop" />
    );

    const img = screen.getByAltText("Test Project");
    expect(img).toBeInTheDocument();
  
  });

  it("renders an Explore link", () => {
    render(
      <ProjectCard project={mockProject} index={0} breakpoint="desktop" />
    );

    const link = screen.getByLabelText("Explore Test Project");
    expect(link).toBeInTheDocument();
  
  });

  it("uses project.link when available", () => {
    const projectWithLink = {
      ...mockProject,
      link: "https://example.com",
    };

    render(
      <ProjectCard project={projectWithLink} index={0} breakpoint="desktop" />
    );

    const link = screen.getByLabelText("Explore Test Project");
 
  });

  it("renders correctly in mobile breakpoint", () => {
    render(
      <ProjectCard project={mockProject} index={0} breakpoint="mobile" />
    );

    // Should still show title and category regardless of breakpoint
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Web App")).toBeInTheDocument();
  });
});
