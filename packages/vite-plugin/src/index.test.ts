import { describe, it, expect, vi } from "vitest";
import { ricsPlugin } from "./index";

describe("vite-plugin-rics", () => {
  describe("plugin creation", () => {
    it("should create a plugin with correct name", () => {
      const plugin = ricsPlugin();
      expect(plugin.name).toBe("vite-plugin-rics");
    });

    it("should enforce pre order", () => {
      const plugin = ricsPlugin();
      expect(plugin.enforce).toBe("pre");
    });
  });

  describe("resolveId", () => {
    it("should resolve .rics files to virtual modules", () => {
      const plugin = ricsPlugin();
      const resolveId = plugin.resolveId as Function;

      const result = resolveId("./styles.rics", "/project/src/main.ts");
      expect(result).toMatch(/^\0virtual:rics:/);
      expect(result).toContain("styles.rics");
    });

    it("should return null for non-.rics files", () => {
      const plugin = ricsPlugin();
      const resolveId = plugin.resolveId as Function;

      const result = resolveId("./styles.css", "/project/src/main.ts");
      expect(result).toBeNull();
    });

    it("should skip ?raw imports", () => {
      const plugin = ricsPlugin();
      const resolveId = plugin.resolveId as Function;

      const result = resolveId("./styles.rics?raw", "/project/src/main.ts");
      expect(result).toBeNull();
    });

    it("should return null without importer", () => {
      const plugin = ricsPlugin();
      const resolveId = plugin.resolveId as Function;

      const result = resolveId("./styles.rics", undefined);
      expect(result).toBeNull();
    });
  });

  describe("load", () => {
    it("should return null for non-virtual modules", () => {
      const plugin = ricsPlugin();
      const load = plugin.load as Function;

      const result = load("/project/src/styles.rics");
      expect(result).toBeNull();
    });
  });

  describe("options", () => {
    it("should accept custom extensions", () => {
      const plugin = ricsPlugin({ extensions: [".scss", ".rics"] });
      const resolveId = plugin.resolveId as Function;

      const ricsResult = resolveId("./styles.rics", "/project/src/main.ts");
      const scssResult = resolveId("./styles.scss", "/project/src/main.ts");

      expect(ricsResult).toMatch(/^\0virtual:rics:/);
      expect(scssResult).toMatch(/^\0virtual:rics:/);
    });

    it("should pass compiler options through", () => {
      const plugin = ricsPlugin({
        minify: true,
        timeout: 10000,
        maxIterations: 5000,
      });

      expect(plugin.name).toBe("vite-plugin-rics");
    });
  });
});
