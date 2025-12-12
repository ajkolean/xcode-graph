import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Graph } from "./tuist-graph.schema.generated";

// Path to the fixture (copied from Swift test resources)
const FIXTURE_PATH = resolve(__dirname, "../fixtures/tuist-graph.json");

describe("tuist-graph.schema.generated types match Swift Codable JSON", () => {
  it("should parse the same graph.json that Swift decodes", () => {
    const json = readFileSync(FIXTURE_PATH, "utf-8");
    const graph: Graph = JSON.parse(json);

    // Same assertions as Swift tests
    expect(graph.name).toBeTruthy();
    expect(graph.dependencies.length).toBeGreaterThan(0);
  });

  it("should have expected structure matching XcodeGraph types", () => {
    const json = readFileSync(FIXTURE_PATH, "utf-8");
    const graph: Graph = JSON.parse(json);

    console.log("Graph name:", graph.name);
    console.log("Dependencies count (flat array):", graph.dependencies.length);
    console.log("Projects count (flat array):", graph.projects.length);

    // Dependencies is flat alternating: [key, value, key, value, ...]
    // Count by checking every other element (keys)
    let targetCount = 0;
    let packageCount = 0;
    let otherCount = 0;

    for (let i = 0; i < graph.dependencies.length; i += 2) {
      const source = graph.dependencies[i];
      if (typeof source === "object" && "target" in source) {
        targetCount++;
      } else if (typeof source === "object" && "packageProduct" in source) {
        packageCount++;
      } else if (typeof source === "object") {
        otherCount++;
      }
    }

    console.log("Target dependencies:", targetCount);
    console.log("Package dependencies:", packageCount);
    console.log("Other dependencies:", otherCount);

    expect(targetCount + packageCount).toBeGreaterThan(0);
  });

  it("should have properly typed projects array", () => {
    const json = readFileSync(FIXTURE_PATH, "utf-8");
    const graph: Graph = JSON.parse(json);

    expect(graph.projects.length).toBeGreaterThan(0);

    // projects is flat alternating: [path, Project, path, Project, ...]
    const path = graph.projects[0];
    const firstProject = graph.projects[1];

    expect(typeof path).toBe("string");
    expect(typeof firstProject).toBe("object");
    expect(firstProject).toBeDefined();
    if (
      typeof firstProject === "object" &&
      firstProject !== null &&
      "name" in firstProject
    ) {
      expect(typeof firstProject.name).toBe("string");
      expect(typeof firstProject.path).toBe("string");
      expect(firstProject.targets).toBeDefined();
    }
  });

  it("should have properly typed targets within projects", () => {
    const json = readFileSync(FIXTURE_PATH, "utf-8");
    const graph: Graph = JSON.parse(json);

    // Find a project with targets (every other element is a Project)
    for (let i = 1; i < graph.projects.length; i += 2) {
      const project = graph.projects[i];
      if (
        typeof project === "object" &&
        project !== null &&
        "targets" in project
      ) {
        // targets is { [key: string]: Target } because key is String
        const targetNames = Object.keys(project.targets);
        if (targetNames.length > 0) {
          const targetName = targetNames[0]!;
          const target = project.targets[targetName]!;

          expect(typeof targetName).toBe("string");
          expect(typeof target.name).toBe("string");
          expect(typeof target.bundleId).toBe("string");
          expect(target.product).toBeDefined();
          expect(target.destinations).toBeDefined();

          console.log(
            "Sample target:",
            target.name,
            "- Product:",
            target.product,
          );
          return;
        }
      }
    }
  });
});
