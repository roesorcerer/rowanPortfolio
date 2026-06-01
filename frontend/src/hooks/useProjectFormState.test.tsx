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
  category: "Web",
  description: "A description",
  image: "/x.png",
  link: "https://demo.example.com",
  githubLink: "https://github.com/x/y",
  developmentTime: "3 weeks",
  technologies: ["React", "Node.js", "MongoDB"],
  order: 2,
  featured: true,
  projectType: "featured",
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
      developmentTime: undefined,
    };
    const form = fromProject(sparse);
    expect(form.link).toBe("");
    expect(form.githubLink).toBe("");
    expect(form.developmentTime).toBe("");
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
      developmentTime: "",
    });
    expect(payload.link).toBeUndefined();
    expect(payload.githubLink).toBeUndefined();
    expect(payload.developmentTime).toBeUndefined();
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
    expect(result.current.form.category).toBe("Web");
  });

  it("payload reflects the current form state", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    act(() => result.current.setField("link", ""));
    act(() => result.current.setField("technologies", "Vue, Pinia"));
    expect(result.current.payload.link).toBeUndefined();
    expect(result.current.payload.technologies).toEqual(["Vue", "Pinia"]);
  });
});
