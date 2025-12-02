import { describe, it, expect } from "vitest";
import { tokenize } from "../src/tokenizer";
import { TokenType } from "../src/types";

describe("tokenizer", () => {
  it("should tokenize variables", () => {
    const tokens = tokenize("$primary");
    expect(tokens[0].type).toBe(TokenType.VARIABLE);
    expect(tokens[0].value).toBe("$primary");
  });

  it("should tokenize numbers with units", () => {
    const tokens = tokenize("100px");
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe("100px");
  });

  it("should tokenize colors", () => {
    const tokens = tokenize("#ff0000");
    expect(tokens[0].type).toBe(TokenType.HASH);
    expect(tokens[0].value).toBe("#ff0000");
  });

  it("should tokenize at-keywords", () => {
    const tokens = tokenize("@mixin");
    expect(tokens[0].type).toBe(TokenType.AT_KEYWORD);
    expect(tokens[0].value).toBe("@mixin");
  });

  it("should tokenize interpolation start", () => {
    const tokens = tokenize("#{");
    expect(tokens[0].type).toBe(TokenType.INTERP_START);
  });

  it("should tokenize strings", () => {
    const tokens = tokenize('"hello world"');
    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].value).toBe('"hello world"');
  });

  it("should tokenize operators", () => {
    const tokens = tokenize("+ - * / %");
    expect(tokens.filter(t => t.type !== TokenType.WHITESPACE && t.type !== TokenType.EOF).map(t => t.type)).toEqual([
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.STAR,
      TokenType.SLASH,
      TokenType.PERCENT,
    ]);
  });

  it("should tokenize comparison operators", () => {
    const tokens = tokenize("== != >= <=");
    const ops = tokens.filter(t => t.type !== TokenType.WHITESPACE && t.type !== TokenType.EOF);
    expect(ops.map(t => t.type)).toEqual([
      TokenType.EQ,
      TokenType.NEQ,
      TokenType.GTE,
      TokenType.LTE,
    ]);
  });

  it("should tokenize logical operators", () => {
    const tokens = tokenize("and or not");
    const ops = tokens.filter(t => t.type !== TokenType.WHITESPACE && t.type !== TokenType.EOF);
    expect(ops.map(t => t.type)).toEqual([
      TokenType.AND,
      TokenType.OR,
      TokenType.NOT,
    ]);
  });

  it("should tokenize comments", () => {
    const tokens = tokenize("// comment\n/* block */");
    const comments = tokens.filter(t => t.type === TokenType.COMMENT);
    expect(comments.length).toBe(2);
  });

  it("should tokenize bang comments", () => {
    const tokens = tokenize("/*! important */");
    expect(tokens[0].type).toBe(TokenType.BANG_COMMENT);
  });

  it("should track source locations", () => {
    const tokens = tokenize("$var\n.class");
    expect(tokens[0].start.line).toBe(1);
    expect(tokens[0].start.column).toBe(0);
  });
});
