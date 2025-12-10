import { describe, it, expect } from "vitest";
import plugin, { languages, parsers, printers } from "./index";

describe("prettier-plugin-rics", () => {
  describe("plugin structure", () => {
    it("should export languages", () => {
      expect(languages).toHaveLength(1);
      expect(languages[0].name).toBe("rics");
      expect(languages[0].extensions).toContain(".rics");
    });

    it("should export parsers", () => {
      expect(parsers).toHaveProperty("rics");
      expect(parsers.rics.astFormat).toBe("rics-ast");
    });

    it("should export printers", () => {
      expect(printers).toHaveProperty("rics-ast");
    });

    it("should export complete plugin", () => {
      expect(plugin).toHaveProperty("languages");
      expect(plugin).toHaveProperty("parsers");
      expect(plugin).toHaveProperty("printers");
    });
  });

  describe("parser", () => {
    it("should parse source to AST node", () => {
      const source = ".test { color: red; }";
      const ast = parsers.rics.parse(source, {} as any) as any;

      expect(ast.type).toBe("root");
      expect(ast.source).toBe(source);
    });

    it("should return correct loc positions", () => {
      const source = ".test { color: red; }";
      const ast = parsers.rics.parse(source, {} as any) as any;

      expect(parsers.rics.locStart(ast)).toBe(0);
      expect(parsers.rics.locEnd(ast)).toBe(source.length);
    });
  });

  describe("formatting", () => {
    it("should format basic rule", () => {
      const input = ".test{color:red;}";
      const ast = parsers.rics.parse(input, {} as any) as any;
      const path = { getValue: () => ast } as any;

      const output = printers["rics-ast"].print(path, {} as any, () => "");
      expect(output).toContain(".test");
      expect(output).toContain("color:");
    });

    it("should handle nested rules with proper indentation", () => {
      const input = `.parent {
color: red;
.child {
color: blue;
}
}`;
      const ast = parsers.rics.parse(input, {} as any) as any;
      const path = { getValue: () => ast } as any;

      const output = printers["rics-ast"].print(path, {} as any, () => "") as string;
      expect(output).toContain("  .child");
      expect(output).toContain("    color: blue");
    });

    it("should normalize spacing around colons", () => {
      const input = `.test {
color:red;
padding:   10px;
}`;
      const ast = parsers.rics.parse(input, {} as any) as any;
      const path = { getValue: () => ast } as any;

      const output = printers["rics-ast"].print(path, {} as any, () => "") as string;
      expect(output).toContain("color: red");
      expect(output).toContain("padding: 10px");
    });

    it("should end with newline", () => {
      const input = ".test { color: red; }";
      const ast = parsers.rics.parse(input, {} as any) as any;
      const path = { getValue: () => ast } as any;

      const output = printers["rics-ast"].print(path, {} as any, () => "") as string;
      expect(output.endsWith("\n")).toBe(true);
    });

    it("should preserve double colons in pseudo-elements", () => {
      const input = `#browse-page::before,
#search-page::before {
  content: "";
}`;
      const ast = parsers.rics.parse(input, {} as any) as any;
      const path = { getValue: () => ast } as any;

      const output = printers["rics-ast"].print(path, {} as any, () => "") as string;
      expect(output).toContain("#browse-page::before");
      expect(output).toContain("#search-page::before");
      expect(output).not.toContain(": :before");
    });
  });
});
