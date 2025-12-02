import { describe, it, expect } from "vitest";
import { compile } from "../src/compiler";

describe("built-in functions", () => {
  describe("color functions", () => {
    it("lighten should increase lightness", () => {
      const input = `.box { color: #{lighten(#000000, 50%)}; }`;
      const result = compile(input);
      expect(result).toContain("color:");
      expect(result).not.toContain("#000000");
    });

    it("darken should decrease lightness", () => {
      const input = `.box { color: #{darken(#ffffff, 50%)}; }`;
      const result = compile(input);
      expect(result).toContain("color:");
      expect(result).not.toContain("#ffffff");
    });

    it("rgba should modify alpha", () => {
      const input = `.box { color: #{rgba(#ff0000, 0.5)}; }`;
      const result = compile(input);
      expect(result).toContain("rgba");
      expect(result).toContain("0.5");
    });

    it("mix should blend colors", () => {
      const input = `.box { color: #{mix(#ff0000, #0000ff, 50%)}; }`;
      const result = compile(input);
      expect(result).toContain("color:");
    });

    it("complement should return opposite hue", () => {
      const input = `.box { color: #{complement(#ff0000)}; }`;
      const result = compile(input);
      expect(result).toContain("color:");
    });

    it("invert should invert color", () => {
      const input = `.box { color: #{invert(#ff0000)}; }`;
      const result = compile(input);
      expect(result).toContain("#00ffff");
    });

    it("red should extract red component", () => {
      const input = `.box { --r: #{red(#ff8040)}; }`;
      const result = compile(input);
      expect(result).toContain("--r: 255");
    });

    it("green should extract green component", () => {
      const input = `.box { --g: #{green(#ff8040)}; }`;
      const result = compile(input);
      expect(result).toContain("--g: 128");
    });

    it("blue should extract blue component", () => {
      const input = `.box { --b: #{blue(#ff8040)}; }`;
      const result = compile(input);
      expect(result).toContain("--b: 64");
    });
  });

  describe("math functions", () => {
    it("round should round numbers", () => {
      const input = `.box { width: #{round(10.6px)}; }`;
      const result = compile(input);
      expect(result).toContain("width: 11px");
    });

    it("ceil should round up", () => {
      const input = `.box { width: #{ceil(10.1px)}; }`;
      const result = compile(input);
      expect(result).toContain("width: 11px");
    });

    it("floor should round down", () => {
      const input = `.box { width: #{floor(10.9px)}; }`;
      const result = compile(input);
      expect(result).toContain("width: 10px");
    });

    it("abs should return absolute value", () => {
      const input = `.box { margin: #{abs(-10px)}; }`;
      const result = compile(input);
      expect(result).toContain("margin: 10px");
    });

    it("min should return minimum", () => {
      const input = `.box { width: #{min(100px, 50px, 75px)}; }`;
      const result = compile(input);
      expect(result).toContain("width: 50px");
    });

    it("max should return maximum", () => {
      const input = `.box { width: #{max(100px, 50px, 75px)}; }`;
      const result = compile(input);
      expect(result).toContain("width: 100px");
    });

    it("percentage should convert to percent", () => {
      const input = `.box { width: #{percentage(0.5)}; }`;
      const result = compile(input);
      expect(result).toContain("width: 50%");
    });
  });

  describe("string functions", () => {
    it("str-length should return length", () => {
      const input = `.box { --len: #{str-length("hello")}; }`;
      const result = compile(input);
      expect(result).toContain("--len: 5");
    });

    it("str-slice should extract substring", () => {
      const input = `.box { --sub: #{str-slice("hello", 1, 3)}; }`;
      const result = compile(input);
      expect(result).toContain("--sub: hel");
    });

    it("str-index should find substring", () => {
      const input = `.box { --idx: #{str-index("hello", "l")}; }`;
      const result = compile(input);
      expect(result).toContain("--idx: 3");
    });

    it("to-upper-case should uppercase", () => {
      const input = `.box { --upper: #{to-upper-case("hello")}; }`;
      const result = compile(input);
      expect(result).toContain("--upper: HELLO");
    });

    it("to-lower-case should lowercase", () => {
      const input = `.box { --lower: #{to-lower-case("HELLO")}; }`;
      const result = compile(input);
      expect(result).toContain("--lower: hello");
    });

    it("quote should add quotes", () => {
      // In SCSS, interpolation strips quotes. To test quote(), we check
      // that it creates a quoted string (which gets unquoted during interpolation)
      const input = `.box { content: "#{quote(hello)}"; }`;
      const result = compile(input);
      // The inner quote() returns "hello", interpolation strips to hello,
      // and the outer quotes remain, giving "hello"
      expect(result).toContain('content: "hello"');
    });

    it("unquote should remove quotes", () => {
      const input = `.#{unquote("button")} { color: red; }`;
      const result = compile(input);
      expect(result).toContain(".button");
    });
  });

  describe("list functions", () => {
    it("length should return list length", () => {
      const input = `
        $list: (a, b, c);
        .box { --len: #{length($list)}; }
      `;
      const result = compile(input);
      expect(result).toContain("--len: 3");
    });

    it("nth should get list item", () => {
      const input = `
        $list: (10px, 20px, 30px);
        .box { width: #{nth($list, 2)}; }
      `;
      const result = compile(input);
      expect(result).toContain("width: 20px");
    });

    it("index should find item in list", () => {
      const input = `
        $list: (a, b, c);
        .box { --idx: #{index($list, b)}; }
      `;
      const result = compile(input);
      expect(result).toContain("--idx: 2");
    });
  });

  describe("map functions", () => {
    it("map-get should get map value", () => {
      const input = `
        $map: (width: 100px, height: 200px);
        .box { width: #{map-get($map, width)}; }
      `;
      const result = compile(input);
      expect(result).toContain("width: 100px");
    });

    it("map-has-key should check key existence", () => {
      const input = `
        $map: (width: 100px);
        .box {
          @if map-has-key($map, width) {
            width: map-get($map, width);
          }
        }
      `;
      const result = compile(input);
      expect(result).toContain("width: 100px");
    });
  });

  describe("type functions", () => {
    it("type-of should return type", () => {
      const input = `.box { --type: #{type-of(100px)}; }`;
      const result = compile(input);
      expect(result).toContain("--type: number");
    });

    it("unit should return unit", () => {
      // unit() returns a quoted string, but interpolation strips quotes
      const input = `.box { --unit: #{unit(100px)}; }`;
      const result = compile(input);
      expect(result).toContain("--unit: px");
    });

    it("unitless should check if unitless", () => {
      const input = `
        $n: 100;
        .box {
          @if unitless($n) {
            width: #{$n}px;
          }
        }
      `;
      const result = compile(input);
      expect(result).toContain("width: 100px");
    });
  });

  describe("conditional functions", () => {
    it("if should return based on condition", () => {
      const input = `.box { color: #{if(true, red, blue)}; }`;
      const result = compile(input);
      expect(result).toContain("color: red");
    });

    it("if should return false value when false", () => {
      const input = `.box { color: #{if(false, red, blue)}; }`;
      const result = compile(input);
      expect(result).toContain("color: blue");
    });
  });
});
