import { describe, it, expect, vi } from "vitest";
import ricsLoader from "./index";

describe("webpack-loader-rics", () => {
  const createMockContext = (options = {}) => ({
    async: vi.fn(() => vi.fn()),
    getOptions: vi.fn(() => options),
    emitWarning: vi.fn(),
  });

  describe("ricsLoader", () => {
    it("should compile valid rics source", () => {
      const callback = vi.fn();
      const context = {
        async: () => callback,
        getOptions: () => ({}),
        emitWarning: vi.fn(),
      };

      const source = `
        $color: red;
        .test { color: $color; }
      `;

      ricsLoader.call(context as any, source);

      expect(callback).toHaveBeenCalledWith(null, expect.stringContaining("color: red"));
    });

    it("should pass errors to callback", () => {
      const callback = vi.fn();
      const context = {
        async: () => callback,
        getOptions: () => ({}),
        emitWarning: vi.fn(),
      };

      // Invalid @for syntax causes an error
      const source = `@for $i from 1 to { }`;

      ricsLoader.call(context as any, source);

      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should pass compiler options through", () => {
      const callback = vi.fn();
      const context = {
        async: () => callback,
        getOptions: () => ({ minify: true }),
        emitWarning: vi.fn(),
      };

      const source = `
        .test { color: red; }
      `;

      ricsLoader.call(context as any, source);

      expect(callback).toHaveBeenCalledWith(null, expect.any(String));
      // Minified output should not have newlines
      const output = callback.mock.calls[0][1];
      expect(output).not.toContain("\n");
    });
  });
});
