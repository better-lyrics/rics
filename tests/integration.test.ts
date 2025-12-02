import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { compile, compileWithDetails } from "../src/compiler";

describe("integration tests", () => {
  describe("duration-hack fixture", () => {
    it("should generate many selectors in :not()", () => {
      const input = readFileSync(join(__dirname, "fixtures/duration-hack.scss"), "utf-8");
      const result = compileWithDetails(input, { maxIterations: 100000, timeout: 30000 });

      expect(result.errors.length).toBe(0);
      expect(result.css).toContain(":not(");
      expect(result.css).toContain('[data-duration="0"]');
      expect(result.css).toContain('[data-duration="1.5"]');

      const selectorCount = (result.css.match(/\[data-duration=/g) || []).length;
      expect(selectorCount).toBeGreaterThanOrEqual(1500);
    });
  });

  describe("sibling-blur fixture", () => {
    it("should generate cascading blur rules", () => {
      const input = readFileSync(join(__dirname, "fixtures/sibling-blur.scss"), "utf-8");
      const result = compile(input);

      expect(result).toContain("+.blyrics--line");
      expect(result).toContain("blur(1.5px)");
      expect(result).toContain("blur(9px)");

      const blurMatches = result.match(/blur\([\d.]+px\)/g) || [];
      expect(blurMatches.length).toBe(6);
    });
  });

  describe("breakpoints fixture", () => {
    it("should generate media queries from map", () => {
      const input = readFileSync(join(__dirname, "fixtures/breakpoints.scss"), "utf-8");
      const result = compile(input);

      expect(result).toContain("@media (max-width: 1024px)");
      expect(result).toContain("@media (max-width: 1170px)");
      expect(result).toContain("@media (max-width: 1279px)");
      expect(result).toContain("max-width: 200px");
      expect(result).toContain("max-width: 250px");
      expect(result).toContain("max-width: 300px");
    });
  });

  describe("glass panel mixin", () => {
    it("should compile glass panel mixin with conditionals", () => {
      const input = `
        @mixin glass-panel($blur: 10px, $bg: rgba(0, 0, 0, 0.5)) {
          background: $bg;
          backdrop-filter: blur($blur);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;

          @if $blur > 5px {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
        }

        .sidebar { @include glass-panel(15px); }
        .modal { @include glass-panel(20px, rgba(20, 20, 20, 0.8)); }
      `;
      const result = compile(input);

      expect(result).toContain(".sidebar");
      expect(result).toContain(".modal");
      expect(result).toContain("backdrop-filter: blur(15px)");
      expect(result).toContain("backdrop-filter: blur(20px)");
      expect(result).toContain("box-shadow");
    });
  });

  describe("complex nested structures", () => {
    it("should handle deeply nested selectors", () => {
      const input = `
        .app {
          .header {
            .nav {
              .item {
                color: blue;
                &:hover { color: red; }
                &.active { font-weight: bold; }
              }
            }
          }
        }
      `;
      const result = compile(input);

      expect(result).toContain(".app .header .nav .item");
      expect(result).toContain(".app .header .nav .item:hover");
      expect(result).toContain(".app .header .nav .item.active");
    });
  });

  describe("native CSS pass-through", () => {
    it("should preserve CSS custom properties", () => {
      const input = `
        :root {
          --primary: #007bff;
        }
        .button {
          color: var(--primary);
          background: var(--bg, white);
        }
      `;
      const result = compile(input);

      expect(result).toContain("--primary: #007bff");
      expect(result).toContain("var(--primary)");
      expect(result).toContain("var(--bg, white)");
    });

    it("should preserve calc()", () => {
      const input = `.box { width: calc(100% - 20px); }`;
      const result = compile(input);
      expect(result).toContain("calc(100% - 20px)");
    });

    it("should preserve clamp()", () => {
      const input = `.text { font-size: clamp(1rem, 2vw, 2rem); }`;
      const result = compile(input);
      expect(result).toContain("clamp(1rem, 2vw, 2rem)");
    });
  });

  describe("performance limits", () => {
    it("should respect maxIterations", () => {
      const input = `
        @for $i from 1 through 1000000 {
          .item-#{$i} { order: $i; }
        }
      `;
      const result = compileWithDetails(input, { maxIterations: 100 });

      expect(result.errors.some(e => e.code === "MAX_ITERATIONS")).toBe(true);
    });

    it("should respect timeout", () => {
      const input = `
        @function slow($n) {
          $result: "";
          @for $i from 1 through $n {
            $result: $result + "x";
          }
          @return $result;
        }
        .box { content: "#{slow(100000)}"; }
      `;
      const result = compileWithDetails(input, { timeout: 100, maxIterations: 1000000 });
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty input", () => {
      const result = compile("");
      expect(result).toBe("");
    });

    it("should handle whitespace only", () => {
      const result = compile("   \n\t  ");
      expect(result.trim()).toBe("");
    });

    it("should handle nested at-rules", () => {
      const input = `
        @supports (display: grid) {
          @media (min-width: 768px) {
            .container { display: grid; }
          }
        }
      `;
      const result = compile(input);

      expect(result).toContain("@supports (display: grid)");
      expect(result).toContain("@media (min-width: 768px)");
    });

    it("should handle multiple selectors", () => {
      const input = `
        h1, h2, h3 {
          margin: 0;
          &:first-child { margin-top: 20px; }
        }
      `;
      const result = compile(input);

      expect(result).toContain("h1, h2, h3");
      expect(result).toContain("h1:first-child");
      expect(result).toContain("h2:first-child");
      expect(result).toContain("h3:first-child");
    });

    it("should handle attribute selectors", () => {
      const input = `
        [data-theme="dark"] {
          .button { background: #333; }
        }
      `;
      const result = compile(input);
      expect(result).toContain('[data-theme="dark"] .button');
    });
  });
});
