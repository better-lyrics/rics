import { describe, it, expect } from "vitest";
import { EditorState } from "@codemirror/state";
import { ricsLanguage, ricsHighlighting } from "./language";
import { ricsLinter } from "./linter";

describe("codemirror-lang-rics", () => {
  describe("ricsLanguage", () => {
    it("should return an extension", () => {
      const ext = ricsLanguage();
      expect(ext).toBeDefined();
    });

    it("should provide commentTokens for line and block comments", () => {
      const state = EditorState.create({
        doc: "$color: red;",
        extensions: [ricsLanguage()],
      });

      const commentTokens = state.languageDataAt<{
        line?: string;
        block?: { open: string; close: string };
      }>("commentTokens", 0);

      expect(commentTokens).toHaveLength(1);
      expect(commentTokens[0].line).toBe("//");
      expect(commentTokens[0].block).toEqual({ open: "/*", close: "*/" });
    });
  });

  describe("ricsHighlighting", () => {
    it("should be an alias for ricsLanguage", () => {
      const ext = ricsHighlighting();
      expect(ext).toBeDefined();
    });
  });

  describe("ricsLinter", () => {
    it("should return a linter extension", () => {
      const ext = ricsLinter();
      expect(ext).toBeDefined();
    });

    it("should accept delay option", () => {
      const ext = ricsLinter({ delay: 500 });
      expect(ext).toBeDefined();
    });

    it("should accept compiler options", () => {
      const ext = ricsLinter({
        delay: 300,
        timeout: 5000,
        maxIterations: 10000,
      });
      expect(ext).toBeDefined();
    });
  });
});
