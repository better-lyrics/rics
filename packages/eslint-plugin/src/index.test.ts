import { describe, it, expect } from "vitest";
import plugin, { configs, parser, rules } from "./index";

describe("eslint-plugin-rics", () => {
  describe("plugin structure", () => {
    it("should export plugin with meta", () => {
      expect(plugin.meta.name).toBe("eslint-plugin-rics");
    });

    it("should export configs", () => {
      expect(configs).toHaveProperty("recommended");
      expect(configs.recommended.files).toContain("**/*.rics");
    });

    it("should export parser", () => {
      expect(parser).toHaveProperty("parseForESLint");
    });

    it("should export rules", () => {
      expect(rules).toHaveProperty("no-compile-errors");
      expect(rules).toHaveProperty("no-compile-warnings");
      expect(rules).toHaveProperty("max-nesting-depth");
    });
  });

  describe("parser", () => {
    it("should parse code and return AST structure", () => {
      const code = ".test { color: red; }";
      const result = parser.parseForESLint(code);

      expect(result.ast.type).toBe("Program");
      expect(result.ast.body).toEqual([]);
      expect(result.services.ricsSource).toBe(code);
    });

    it("should set correct range", () => {
      const code = ".test { color: red; }";
      const result = parser.parseForESLint(code);

      expect(result.ast.range).toEqual([0, code.length]);
    });
  });

  describe("rules", () => {
    describe("no-compile-errors", () => {
      it("should have correct meta", () => {
        expect(rules["no-compile-errors"].meta?.type).toBe("problem");
        expect(rules["no-compile-errors"].meta?.messages).toHaveProperty("compileError");
      });
    });

    describe("no-compile-warnings", () => {
      it("should have correct meta", () => {
        expect(rules["no-compile-warnings"].meta?.type).toBe("suggestion");
        expect(rules["no-compile-warnings"].meta?.messages).toHaveProperty("compileWarning");
      });
    });

    describe("max-nesting-depth", () => {
      it("should have correct meta", () => {
        expect(rules["max-nesting-depth"].meta?.type).toBe("suggestion");
        expect(rules["max-nesting-depth"].meta?.messages).toHaveProperty("tooDeep");
      });

      it("should have schema for max option", () => {
        const schema = rules["max-nesting-depth"].meta?.schema;
        expect(schema).toBeDefined();
        expect(Array.isArray(schema)).toBe(true);
      });
    });
  });

  describe("recommended config", () => {
    it("should include rics parser", () => {
      expect(configs.recommended.languageOptions?.parser).toBe(parser);
    });

    it("should enable no-compile-errors as error", () => {
      expect(configs.recommended.rules?.["rics/no-compile-errors"]).toBe("error");
    });

    it("should enable no-compile-warnings as warn", () => {
      expect(configs.recommended.rules?.["rics/no-compile-warnings"]).toBe("warn");
    });
  });
});
