export interface CompilerConfig {
  maxIterations: number;
  maxOutputRules: number;
  maxNestingDepth: number;
  maxInputSize: number;
  timeout: number;
  strictMode: boolean;
  minify: boolean;
  preserveBangComments: boolean;
}

export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
}

export interface CompileError {
  type: "error";
  code: ErrorCode;
  message: string;
  source?: string;
  start?: SourceLocation;
  end?: SourceLocation;
}

export interface CompileWarning {
  type: "warning";
  code: string;
  message: string;
  source?: string;
  start?: SourceLocation;
  end?: SourceLocation;
}

export interface CompileResult {
  css: string;
  errors: CompileError[];
  warnings: CompileWarning[];
  stats: {
    iterations: number;
    rules: number;
    duration: number;
    inputSize: number;
    outputSize: number;
  };
}

export enum ErrorCode {
  SYNTAX_ERROR = "SYNTAX_ERROR",
  UNEXPECTED_TOKEN = "UNEXPECTED_TOKEN",
  UNCLOSED_BLOCK = "UNCLOSED_BLOCK",
  UNCLOSED_STRING = "UNCLOSED_STRING",
  UNDEFINED_VARIABLE = "UNDEFINED_VARIABLE",
  INVALID_VARIABLE_NAME = "INVALID_VARIABLE_NAME",
  UNDEFINED_FUNCTION = "UNDEFINED_FUNCTION",
  UNDEFINED_MIXIN = "UNDEFINED_MIXIN",
  WRONG_ARG_COUNT = "WRONG_ARG_COUNT",
  MISSING_RETURN = "MISSING_RETURN",
  INVALID_LOOP_RANGE = "INVALID_LOOP_RANGE",
  MAX_ITERATIONS = "MAX_ITERATIONS",
  MAX_OUTPUT_RULES = "MAX_OUTPUT_RULES",
  MAX_NESTING_DEPTH = "MAX_NESTING_DEPTH",
  MAX_INPUT_SIZE = "MAX_INPUT_SIZE",
  TIMEOUT = "TIMEOUT",
  TYPE_ERROR = "TYPE_ERROR",
  INVALID_UNIT = "INVALID_UNIT",
  DIVISION_BY_ZERO = "DIVISION_BY_ZERO",
}

export enum TokenType {
  EOF = "EOF",
  WHITESPACE = "WHITESPACE",
  NEWLINE = "NEWLINE",
  COMMENT = "COMMENT",
  BANG_COMMENT = "BANG_COMMENT",
  IDENT = "IDENT",
  VARIABLE = "VARIABLE",
  NUMBER = "NUMBER",
  STRING = "STRING",
  HASH = "HASH",
  AT_KEYWORD = "AT_KEYWORD",
  COLON = "COLON",
  SEMICOLON = "SEMICOLON",
  COMMA = "COMMA",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  PLUS = "PLUS",
  MINUS = "MINUS",
  STAR = "STAR",
  SLASH = "SLASH",
  PERCENT = "PERCENT",
  AMPERSAND = "AMPERSAND",
  GT = "GT",
  LT = "LT",
  EQ = "EQ",
  NEQ = "NEQ",
  GTE = "GTE",
  LTE = "LTE",
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  DOT = "DOT",
  TILDE = "TILDE",
  PIPE = "PIPE",
  CARET = "CARET",
  INTERP_START = "INTERP_START",
  INTERP_END = "INTERP_END",
  IMPORTANT = "IMPORTANT",
  UNKNOWN = "UNKNOWN",
}

export interface Token {
  type: TokenType;
  value: string;
  start: SourceLocation;
  end: SourceLocation;
}

export type Value =
  | NumberValue
  | StringValue
  | ColorValue
  | BooleanValue
  | ListValue
  | MapValue
  | NullValue;

export interface NumberValue {
  type: "number";
  value: number;
  unit: string;
}

export interface StringValue {
  type: "string";
  value: string;
  quoted: boolean;
}

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface ColorValue {
  type: "color";
  r: number;
  g: number;
  b: number;
  a: number;
  original?: string;
  format?: ColorFormat;
}

export interface BooleanValue {
  type: "boolean";
  value: boolean;
}

export interface ListValue {
  type: "list";
  values: Value[];
  separator: "," | " ";
}

export interface MapValue {
  type: "map";
  entries: Map<string, Value>;
}

interface NullValue {
  type: "null";
}

export interface MixinDefinition {
  name: string;
  params: ParamDefinition[];
  body: string;
  start: SourceLocation;
}

export interface FunctionDefinition {
  name: string;
  params: ParamDefinition[];
  body: string;
  start: SourceLocation;
}

export interface ParamDefinition {
  name: string;
  defaultValue?: string;
}

export interface Scope {
  variables: Map<string, Value>;
  parent: Scope | null;
}

export interface CompilerState {
  config: CompilerConfig;
  scope: Scope;
  mixins: Map<string, MixinDefinition>;
  functions: Map<string, FunctionDefinition>;
  iterations: number;
  rules: number;
  startTime: number;
  errors: CompileError[];
  warnings: CompileWarning[];
  output: string[];
  selectorStack: string[];
  atRuleStack: string[];
}
