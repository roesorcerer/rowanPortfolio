import { render, screen } from "@testing-library/react";
import ProjectLinks from "./ProjectLinks";
import type { Project } from "../../types";

const project: Project = {
  _id: "p1",
  slug: "cup",
  title: "Fill the Cup",
  category: [],
  description: "A game.",
  image: "/assets/cup.png",
  links: [],
  media: [],
  collaborators: [],
  details: [],
  order: 0,
  featured: false,
  projectType: "gameDev",
  status: "published",
  createdAt: "",
  updatedAt: "",
};

// The GitHub mark is an <svg> inside the link; whether it's there is what
// a visitor sees.
const hasMark = (name: string) =>
  screen.getByRole("link", { name }).querySelector("svg") !== null;

describe("ProjectLinks", () => {
  it("marks a link to github.com with the GitHub logo", () => {
    render(
      <ProjectLinks
        project={{
          ...project,
          links: [{ kind: "source", url: "https://github.com/x/cup" }],
        }}
      />
    );
    expect(hasMark("View source")).toBe(true);
  });

  // A source link is a role, not a host.
  it("gives a source link hosted elsewhere no GitHub logo", () => {
    render(
      <ProjectLinks
        project={{
          ...project,
          links: [{ kind: "source", url: "https://gitlab.com/x/cup" }],
        }}
      />
    );
    expect(hasMark("View source")).toBe(false);
  });
});
