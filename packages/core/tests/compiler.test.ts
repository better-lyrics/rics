import { describe, it, expect } from "vitest";
import { compile, compileWithDetails } from "../src/compiler";

describe("compiler", () => {
  describe("variables", () => {
    it("should substitute variables", () => {
      const input = `
        $primary: #007bff;
        .button { color: $primary; }
      `;
      const result = compile(input);
      expect(result).toContain("color: #007bff");
    });

    it("should handle variable reassignment", () => {
      const input = `
        $color: red;
        .a { color: $color; }
        $color: blue;
        .b { color: $color; }
      `;
      const result = compile(input);
      expect(result).toContain(".a");
      expect(result).toContain("color: red");
      expect(result).toContain(".b");
      expect(result).toContain("color: blue");
    });

    it("should coexist with CSS var()", () => {
      const input = `
        .button { color: var(--primary); }
      `;
      const result = compile(input);
      expect(result).toContain("var(--primary)");
    });

    it("should handle vendor prefixes in font-family lists", () => {
      const input = `
        $font-sans: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
        body { font-family: $font-sans; }
      `;
      const result = compile(input);
      expect(result).toContain("font-family: \"DM Sans\", -apple-system, BlinkMacSystemFont, sans-serif");
    });
  });

  describe("nesting", () => {
    it("should handle basic nesting", () => {
      const input = `
        .parent {
          color: red;
          .child { color: blue; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".parent");
      expect(result).toContain(".parent .child");
    });

    it("should handle & parent selector", () => {
      const input = `
        .button {
          color: blue;
          &:hover { color: red; }
          &--large { font-size: 20px; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".button:hover");
      expect(result).toContain(".button--large");
    });

    it("should handle & + & sibling selector", () => {
      const input = `
        .item {
          margin: 0;
          & + & { margin-left: 10px; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".item + .item");
    });

    it("should handle + adjacent sibling combinator without &", () => {
      const input = `
        .parent {
          color: red;
          + .sibling { color: blue; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".parent + .sibling");
    });

    it("should handle ~ general sibling combinator without &", () => {
      const input = `
        .parent {
          ~ .sibling { color: green; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".parent ~ .sibling");
    });

    it("should handle > child combinator without &", () => {
      const input = `
        .parent {
          > .child { color: yellow; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".parent > .child");
    });
  });

  describe("mixins", () => {
    it("should define and include mixins", () => {
      const input = `
        @mixin button($bg) {
          background: $bg;
          padding: 10px;
        }
        .btn { @include button(blue); }
      `;
      const result = compile(input);
      expect(result).toContain("background: blue");
      expect(result).toContain("padding: 10px");
    });

    it("should handle default parameters", () => {
      const input = `
        @mixin box($size: 100px) {
          width: $size;
          height: $size;
        }
        .small { @include box(); }
        .large { @include box(200px); }
      `;
      const result = compile(input);
      expect(result).toContain("width: 100px");
      expect(result).toContain("width: 200px");
    });

    it("should handle nested selectors in mixins", () => {
      const input = `
        @mixin interactive($color) {
          color: $color;
          &:hover { color: darken($color, 10%); }
        }
        .link { @include interactive(#3498db); }
      `;
      const result = compile(input);
      expect(result).toContain(".link");
      expect(result).toContain(".link:hover");
    });
  });

  describe("functions", () => {
    it("should define and call custom functions", () => {
      const input = `
        @function double($n) {
          @return $n * 2;
        }
        .box { width: #{double(50px)}; }
      `;
      const result = compile(input);
      expect(result).toContain("width: 100px");
    });

    it("should handle string concatenation in functions", () => {
      const input = `
        @function prefix($name) {
          @return "prefix-" + $name;
        }
        .#{prefix("button")} { color: red; }
      `;
      const result = compile(input);
      expect(result).toContain("prefix-button");
    });
  });

  describe("@for loops", () => {
    it("should handle through loops", () => {
      const input = `
        @for $i from 1 through 3 {
          .mt-#{$i} { margin-top: #{$i * 4}px; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".mt-1");
      expect(result).toContain(".mt-2");
      expect(result).toContain(".mt-3");
      expect(result).toContain("margin-top: 4px");
      expect(result).toContain("margin-top: 8px");
      expect(result).toContain("margin-top: 12px");
    });

    it("should handle to loops", () => {
      const input = `
        @for $i from 1 to 3 {
          .item-#{$i} { order: $i; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".item-1");
      expect(result).toContain(".item-2");
      expect(result).not.toContain(".item-3");
    });

    it("should handle float step", () => {
      const input = `
        @for $i from 0 through 1 by 0.5 {
          .opacity-#{$i * 100} { opacity: $i; }
        }
      `;
      const result = compile(input);
      expect(result).toContain("opacity: 0");
      expect(result).toContain("opacity: 0.5");
      expect(result).toContain("opacity: 1");
    });
  });

  describe("@each loops", () => {
    it("should iterate over lists", () => {
      const input = `
        @each $color in (red, green, blue) {
          .text-#{$color} { color: $color; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".text-red");
      expect(result).toContain(".text-green");
      expect(result).toContain(".text-blue");
    });

    it("should iterate over maps", () => {
      const input = `
        $breakpoints: (sm: 576px, md: 768px);
        @each $name, $width in $breakpoints {
          .container-#{$name} { max-width: $width; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".container-sm");
      expect(result).toContain("max-width: 576px");
      expect(result).toContain(".container-md");
      expect(result).toContain("max-width: 768px");
    });
  });

  describe("@if / @else", () => {
    it("should handle simple conditionals", () => {
      const input = `
        $dark: true;
        .theme {
          @if $dark {
            background: black;
          } @else {
            background: white;
          }
        }
      `;
      const result = compile(input);
      expect(result).toContain("background: black");
      expect(result).not.toContain("background: white");
    });

    it("should handle comparison operators", () => {
      const input = `
        $size: 20;
        .box {
          @if $size > 10 {
            font-size: large;
          }
        }
      `;
      const result = compile(input);
      expect(result).toContain("font-size: large");
    });
  });

  describe("math operations", () => {
    it("should handle basic arithmetic", () => {
      const input = `
        .box {
          width: 100px + 50px;
          height: 200px - 50px;
          padding: 8px * 2;
        }
      `;
      const result = compile(input);
      expect(result).toContain("width: 150px");
      expect(result).toContain("height: 150px");
      expect(result).toContain("padding: 16px");
    });

    it("should handle division in parentheses", () => {
      const input = `.box { margin: (100px / 4); }`;
      const result = compile(input);
      expect(result).toContain("margin: 25px");
    });

    it("should handle unitless division", () => {
      const input = `.text { line-height: (24px / 16px); }`;
      const result = compile(input);
      expect(result).toContain("line-height: 1.5");
    });
  });

  describe("interpolation", () => {
    it("should interpolate in selectors", () => {
      const input = `
        $prefix: "app";
        .#{$prefix}-button { color: red; }
      `;
      const result = compile(input);
      expect(result).toContain(".app-button");
    });

    it("should interpolate in property names", () => {
      const input = `
        $prop: "margin";
        .box { #{$prop}-top: 10px; }
      `;
      const result = compile(input);
      expect(result).toContain("margin-top: 10px");
    });

    it("should interpolate in values", () => {
      const input = `
        $size: 20;
        .box { font-size: #{$size}px; }
      `;
      const result = compile(input);
      expect(result).toContain("font-size: 20px");
    });
  });

  describe("native at-rules", () => {
    it("should pass through @media", () => {
      const input = `
        @media (min-width: 768px) {
          .container { width: 750px; }
        }
      `;
      const result = compile(input);
      expect(result).toContain("@media (min-width: 768px)");
      expect(result).toContain(".container");
    });

    it("should pass through @keyframes", () => {
      const input = `
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      const result = compile(input);
      expect(result).toContain("@keyframes fade");
      expect(result).toContain("from");
      expect(result).toContain("to");
    });

    it("should pass through @import", () => {
      const input = `@import url("styles.css");`;
      const result = compile(input);
      expect(result).toContain("@import url");
    });
  });

  describe("comments", () => {
    it("should strip single-line comments", () => {
      const input = `
        // This is a comment
        .box { color: red; }
      `;
      const result = compile(input);
      expect(result).not.toContain("This is a comment");
    });

    it("should preserve multi-line comments", () => {
      const input = `
        /* This is preserved */
        .box { color: red; }
      `;
      const result = compile(input);
      expect(result).toContain("/* This is preserved */");
    });

    it("should preserve bang comments", () => {
      const input = `
        /*! Important comment */
        .box { color: red; }
      `;
      const result = compile(input, { minify: true });
      expect(result).toContain("/*! Important comment */");
    });
  });

  describe("error handling", () => {
    it("should report undefined variables", () => {
      const input = `.box { color: $undefined; }`;
      const result = compileWithDetails(input);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should handle undefined mixins gracefully", () => {
      const input = `.box { @include nonexistent(); }`;
      const result = compileWithDetails(input);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should error on unclosed ruleset brace", () => {
      const result = compileWithDetails(".test { color: red;");
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe("UNCLOSED_BLOCK");
    });

    it("should error on unclosed @media brace", () => {
      const result = compileWithDetails("@media screen { .test { color: red; }");
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe("UNCLOSED_BLOCK");
    });

    it("should error on unclosed @if block", () => {
      const result = compileWithDetails("@if true { .test { color: red; }");
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe("UNCLOSED_BLOCK");
    });
  });

  describe("minification", () => {
    it("should minify output", () => {
      const input = `
        .button {
          color: red;
          padding: 10px;
        }
      `;
      const result = compile(input, { minify: true });
      expect(result).not.toContain("\n");
      expect(result).toContain(".button{");
    });
  });

  describe("edge cases", () => {
    it("should handle @each with interpolation selector in mixin", () => {
      const input = `
        @mixin test($map) {
          @each $k, $v in $map {
            #{$k} { prop: #{$v}; }
          }
        }
        @include test((a: 1, b: 2));
      `;
      const result = compile(input);
      expect(result).toContain("a {");
      expect(result).toContain("prop: 1");
      expect(result).toContain("b {");
      expect(result).toContain("prop: 2");
    });

    it("should handle semicolon after mixin definition", () => {
      const input = `
        @mixin test {
          .inside { color: red; }
        };

        @each $item in (a, b) {
          @include test;
        }
      `;
      const result = compile(input);
      expect(result).toContain(".inside");
      expect(result).toContain("color: red");
    });

    it("should handle map-get in @each calling mixin", () => {
      const input = `
        $output: (fade, sweep);
        $animation-groups: (
          fade: (#button: background, #ui: opacity),
          sweep: (#progressbar: transform, #slider: left)
        );

        @mixin output-animation($animation-map) {
          @each $sel, $prop in $animation-map {
            #{$sel} { transition: #{$prop} 1s; }
          }
        };

        @each $group in $output {
          $animation-name: map-get($animation-groups, $group);
          @if $animation-name {
            @include output-animation($animation-name);
          }
        }
      `;
      const result = compile(input);
      expect(result).toContain("#button");
      expect(result).toContain("transition: background 1s");
      expect(result).toContain("#ui");
      expect(result).toContain("transition: opacity 1s");
      expect(result).toContain("#progressbar");
      expect(result).toContain("transition: transform 1s");
      expect(result).toContain("#slider");
      expect(result).toContain("transition: left 1s");
    });

    it("should handle missing semicolon before closing brace", () => {
      const input = `.a{color: white}.b{color:red;}`;
      const result = compileWithDetails(input);
      expect(result.css).toContain(".a");
      expect(result.css).toContain("color: white");
      expect(result.css).toContain(".b");
      expect(result.css).toContain("color: red");
      expect(result.errors.length).toBe(0);
    });
  });

  describe("list and append operations", () => {
    it("should handle empty list initialization", () => {
      const input = `
        $list: ();
        .test { content: "#{length($list)}"; }
      `;
      const result = compile(input);
      expect(result).toContain('content: "0"');
    });

    it("should handle variadic mixin parameters", () => {
      const input = `
        @mixin test($items...) {
          @each $item in $items {
            content: $item;
          }
        }
        .test { @include test(a, b, c); }
      `;
      const result = compile(input);
      expect(result).toContain("content: a");
      expect(result).toContain("content: b");
      expect(result).toContain("content: c");
    });

    it("should handle space-separated variable expressions", () => {
      const input = `
        $timing: 0.3s ease;
        $prop: opacity;
        .test { transition: $prop $timing; }
      `;
      const result = compile(input);
      expect(result).toContain("transition: opacity 0.3s ease");
    });

    it("should handle @each over single values", () => {
      const input = `
        $single: test;
        @each $item in $single {
          .#{$item} { color: red; }
        }
      `;
      const result = compile(input);
      expect(result).toContain(".test");
      expect(result).toContain("color: red");
    });

    it("should handle mixin with append in loop", () => {
      const input = `
        $hover-fade-timing: 0.3s ease;

        @mixin hover-fade($props...) {
          $transition: ();
          @each $prop in $props {
            $transition: append($transition, $prop $hover-fade-timing, comma);
          }
          transition: $transition;
        }

        .test {
          @include hover-fade(opacity, background);
        }
      `;
      const result = compile(input);
      expect(result).toContain("transition: opacity 0.3s ease, background 0.3s ease");
    });
  });
});
