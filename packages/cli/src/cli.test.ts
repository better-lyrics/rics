import { describe, it, expect } from "vitest";
import { parseArgs } from "./cli";

describe("cli", () => {
  describe("parseArgs", () => {
    it("should parse input file", () => {
      const result = parseArgs(["styles.rics"]);
      expect(result.input).toBe("styles.rics");
    });

    it("should parse -o/--output option", () => {
      const short = parseArgs(["input.rics", "-o", "output.css"]);
      expect(short.options.output).toBe("output.css");

      const long = parseArgs(["input.rics", "--output", "output.css"]);
      expect(long.options.output).toBe("output.css");
    });

    it("should parse -m/--minify option", () => {
      const short = parseArgs(["input.rics", "-m"]);
      expect(short.options.minify).toBe(true);

      const long = parseArgs(["input.rics", "--minify"]);
      expect(long.options.minify).toBe(true);
    });

    it("should parse -w/--watch option", () => {
      const short = parseArgs(["input.rics", "-w"]);
      expect(short.options.watch).toBe(true);

      const long = parseArgs(["input.rics", "--watch"]);
      expect(long.options.watch).toBe(true);
    });

    it("should parse -h/--help option", () => {
      const short = parseArgs(["-h"]);
      expect(short.options.help).toBe(true);

      const long = parseArgs(["--help"]);
      expect(long.options.help).toBe(true);
    });

    it("should parse -v/--version option", () => {
      const short = parseArgs(["-v"]);
      expect(short.options.version).toBe(true);

      const long = parseArgs(["--version"]);
      expect(long.options.version).toBe(true);
    });

    it("should parse multiple options", () => {
      const result = parseArgs([
        "input.rics",
        "-o",
        "output.css",
        "-m",
        "-w",
      ]);
      expect(result.input).toBe("input.rics");
      expect(result.options.output).toBe("output.css");
      expect(result.options.minify).toBe(true);
      expect(result.options.watch).toBe(true);
    });

    it("should handle no arguments", () => {
      const result = parseArgs([]);
      expect(result.input).toBeUndefined();
      expect(result.options).toEqual({});
    });

    it("should handle options before input", () => {
      const result = parseArgs(["-m", "-o", "out.css", "input.rics"]);
      expect(result.input).toBe("input.rics");
      expect(result.options.minify).toBe(true);
      expect(result.options.output).toBe("out.css");
    });
  });
});
