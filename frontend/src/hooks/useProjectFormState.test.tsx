import { act, renderHook } from "@testing-library/react";
import {
  EMPTY_FORM,
  fromProject,
  toPayload,
  useProjectFormState,
} from "./useProjectFormState";
import type { Project } from "../types";

const project: Project = {
  _id: "p1",
  title: "Hello",
  category: ["Web", "Mobile"],
  description: "A description",
  image: "/x.png",
  media: [
    {
      type: "image",
      src: "/assets/one.png",
      alt: "Main shot",
    },
    {
      type: "video",
      src: "https://example.com/demo.mp4",
      poster: "/assets/poster.png",
    },
  ],
  link: "https://demo.example.com",
  githubLink: "https://github.com/x/y",
  relatedResearchLink: "https://doi.org/example",
  developmentTime: "3 weeks",
  collaborators: [
    {
      name: "Rowan",
      role: "Developer",
      socialLink: "https://linkedin.com/in/rowan",
      socialLabel: "LinkedIn",
    },
  ],
  technologies: ["React", "Node.js", "MongoDB"],
  order: 2,
  featured: true,
  projectType: "product",
  status: "published",
  createdAt: "",
  updatedAt: "",
};

describe("fromProject / toPayload", () => {
  it("fromProject joins technologies as a CSV string", () => {
    const form = fromProject(project);
    expect(form.technologies).toBe("React, Node.js, MongoDB");
  });

  it("fromProject coerces missing optionals to empty strings", () => {
    const sparse: Project = {
      ...project,
      link: undefined,
      githubLink: undefined,
      relatedResearchLink: undefined,
      developmentTime: undefined,
      media: undefined,
      collaborators: undefined,
    };
    const form = fromProject(sparse);
    expect(form.link).toBe("");
    expect(form.githubLink).toBe("");
    expect(form.relatedResearchLink).toBe("");
    expect(form.developmentTime).toBe("");
    expect(form.media).toEqual([]);
    expect(form.collaborators).toEqual([]);
  });

  it("toPayload splits the CSV, trims, and drops empties", () => {
    const payload = toPayload({
      ...EMPTY_FORM,
      technologies: "React,  Node.js , , MongoDB",
    });
    expect(payload.technologies).toEqual(["React", "Node.js", "MongoDB"]);
  });

  it("toPayload converts empty optional strings to undefined", () => {
    const payload = toPayload({
      ...EMPTY_FORM,
      link: "",
      githubLink: "",
      relatedResearchLink: "",
      developmentTime: "",
    });
    expect(payload.link).toBeUndefined();
    expect(payload.githubLink).toBeUndefined();
    expect(payload.relatedResearchLink).toBeUndefined();
    expect(payload.developmentTime).toBeUndefined();
  });

  it("toPayload keeps valid media and collaborators and drops incomplete rows", () => {
    const payload = toPayload({
      ...EMPTY_FORM,
      media: [
        { type: "image", src: " /shot.png ", alt: " Shot ", poster: "", caption: "" },
        { type: "video", src: "", alt: "", poster: "", caption: "" },
      ],
      collaborators: [
        {
          name: " Rowan ",
          role: " Dev ",
          socialLink: " https://linkedin.com/in/rowan ",
          socialLabel: " LinkedIn ",
        },
        { name: "", role: "", socialLink: "", socialLabel: "" },
      ],
    });

    expect(payload.media).toEqual([
      { type: "image", src: "/shot.png", alt: "Shot", poster: undefined, caption: undefined },
    ]);
    expect(payload.collaborators).toEqual([
      {
        name: "Rowan",
        role: "Dev",
        socialLink: "https://linkedin.com/in/rowan",
        socialLabel: "LinkedIn",
      },
    ]);
  });
});

describe("useProjectFormState", () => {
  it("starts empty when no initial project", () => {
    const { result } = renderHook(() => useProjectFormState(null));
    expect(result.current.form).toEqual(EMPTY_FORM);
  });

  it("starts populated from the initial project", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    expect(result.current.form.title).toBe("Hello");
    expect(result.current.form.technologies).toBe("React, Node.js, MongoDB");
  });

  it("setField updates one field without clobbering the rest", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    act(() => result.current.setField("title", "Renamed"));
    expect(result.current.form.title).toBe("Renamed");
    expect(result.current.form.category).toEqual(["Web", "Mobile"]);
  });

  it("payload reflects the current form state", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    act(() => result.current.setField("link", ""));
    act(() => result.current.setField("technologies", "Vue, Pinia"));
    expect(result.current.payload.link).toBeUndefined();
    expect(result.current.payload.technologies).toEqual(["Vue", "Pinia"]);
  });
});
