import { Token, TokenType, SourceLocation } from "./types";

export class Tokenizer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 0;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.pos = 0;
    this.line = 1;
    this.column = 0;

    while (this.pos < this.input.length) {
      const token = this.nextToken();
      if (token) {
        this.tokens.push(token);
      }
    }

    this.tokens.push(this.createToken(TokenType.EOF, ""));
    return this.tokens;
  }

  private nextToken(): Token | null {
    const ch = this.peek();

    if (ch === "/" && this.peek(1) === "/") {
      return this.readSingleLineComment();
    }

    if (ch === "/" && this.peek(1) === "*") {
      return this.readMultiLineComment();
    }

    if (ch === " " || ch === "\t") {
      return this.readWhitespace();
    }

    if (ch === "\n" || ch === "\r") {
      return this.readNewline();
    }

    if (ch === "$") {
      return this.readVariable();
    }

    if (ch === "#" && this.peek(1) === "{") {
      return this.readInterpStart();
    }

    if (ch === "#") {
      return this.readHash();
    }

    if (ch === "@") {
      return this.readAtKeyword();
    }

    if (ch === '"' || ch === "'") {
      return this.readString(ch);
    }

    if (this.isDigit(ch) || (ch === "." && this.isDigit(this.peek(1)))) {
      return this.readNumber();
    }

    if (this.isIdentStart(ch)) {
      if (ch === "-" && !this.isIdentChar(this.peek(1))) {
        return this.readPunctuation();
      }
      return this.readIdent();
    }

    if (ch === "!" && this.lookAhead("!important")) {
      return this.readImportant();
    }

    return this.readPunctuation();
  }

  private readSingleLineComment(): Token {
    const start = this.location();
    this.advance(2);
    let value = "//";
    while (this.pos < this.input.length && this.peek() !== "\n") {
      value += this.advance();
    }
    return this.createToken(TokenType.COMMENT, value, start);
  }

  private readMultiLineComment(): Token {
    const start = this.location();
    const isBang = this.peek(2) === "!";
    let value = "";
    value += this.advance();
    value += this.advance();

    while (this.pos < this.input.length) {
      if (this.peek() === "*" && this.peek(1) === "/") {
        value += this.advance();
        value += this.advance();
        break;
      }
      value += this.advance();
    }

    return this.createToken(isBang ? TokenType.BANG_COMMENT : TokenType.COMMENT, value, start);
  }

  private readWhitespace(): Token {
    const start = this.location();
    let value = "";
    while (this.pos < this.input.length && (this.peek() === " " || this.peek() === "\t")) {
      value += this.advance();
    }
    return this.createToken(TokenType.WHITESPACE, value, start);
  }

  private readNewline(): Token {
    const start = this.location();
    let value = "";
    if (this.peek() === "\r") {
      value += this.advance();
    }
    if (this.peek() === "\n") {
      value += this.advance();
    }
    return this.createToken(TokenType.NEWLINE, value, start);
  }

  private readVariable(): Token {
    const start = this.location();
    this.advance();
    let name = "$";
    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      name += this.advance();
    }
    return this.createToken(TokenType.VARIABLE, name, start);
  }

  private readInterpStart(): Token {
    const start = this.location();
    this.advance(2);
    return this.createToken(TokenType.INTERP_START, "#{", start);
  }

  private readHash(): Token {
    const start = this.location();
    this.advance();
    let value = "#";
    while (this.pos < this.input.length && this.isHexChar(this.peek())) {
      value += this.advance();
    }
    if (value.length === 1) {
      while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
        value += this.advance();
      }
    }
    return this.createToken(TokenType.HASH, value, start);
  }

  private readAtKeyword(): Token {
    const start = this.location();
    this.advance();
    let value = "@";
    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      value += this.advance();
    }
    return this.createToken(TokenType.AT_KEYWORD, value, start);
  }

  private readString(quote: string): Token {
    const start = this.location();
    let value = this.advance();

    while (this.pos < this.input.length) {
      const ch = this.peek();
      if (ch === quote) {
        value += this.advance();
        break;
      }
      if (ch === "\\") {
        value += this.advance();
        if (this.pos < this.input.length) {
          value += this.advance();
        }
      } else if (ch === "\n") {
        break;
      } else {
        value += this.advance();
      }
    }

    return this.createToken(TokenType.STRING, value, start);
  }

  private readNumber(): Token {
    const start = this.location();
    let value = "";

    if (this.peek() === "-" || this.peek() === "+") {
      value += this.advance();
    }

    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peek(1))) {
      value += this.advance();
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    if (this.peek() === "e" || this.peek() === "E") {
      value += this.advance();
      if (this.peek() === "+" || this.peek() === "-") {
        value += this.advance();
      }
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      value += this.advance();
    }

    return this.createToken(TokenType.NUMBER, value, start);
  }

  private readIdent(): Token {
    const start = this.location();
    let value = "";

    if (this.peek() === "-") {
      value += this.advance();
    }

    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      value += this.advance();
    }

    const lower = value.toLowerCase();
    if (lower === "and") return this.createToken(TokenType.AND, value, start);
    if (lower === "or") return this.createToken(TokenType.OR, value, start);
    if (lower === "not") return this.createToken(TokenType.NOT, value, start);

    return this.createToken(TokenType.IDENT, value, start);
  }

  private readImportant(): Token {
    const start = this.location();
    this.advance(10);
    return this.createToken(TokenType.IMPORTANT, "!important", start);
  }

  private readPunctuation(): Token {
    const start = this.location();
    const ch = this.advance();

    switch (ch) {
      case ":":
        return this.createToken(TokenType.COLON, ch, start);
      case ";":
        return this.createToken(TokenType.SEMICOLON, ch, start);
      case ",":
        return this.createToken(TokenType.COMMA, ch, start);
      case "{":
        return this.createToken(TokenType.LBRACE, ch, start);
      case "}":
        if (this.tokens.length > 0) {
          const lastToken = this.tokens[this.tokens.length - 1];
          if (lastToken.type === TokenType.INTERP_START ||
              (this.tokens.some(t => t.type === TokenType.INTERP_START))) {
          }
        }
        return this.createToken(TokenType.RBRACE, ch, start);
      case "(":
        return this.createToken(TokenType.LPAREN, ch, start);
      case ")":
        return this.createToken(TokenType.RPAREN, ch, start);
      case "[":
        return this.createToken(TokenType.LBRACKET, ch, start);
      case "]":
        return this.createToken(TokenType.RBRACKET, ch, start);
      case "+":
        return this.createToken(TokenType.PLUS, ch, start);
      case "-":
        return this.createToken(TokenType.MINUS, ch, start);
      case "*":
        return this.createToken(TokenType.STAR, ch, start);
      case "/":
        return this.createToken(TokenType.SLASH, ch, start);
      case "%":
        return this.createToken(TokenType.PERCENT, ch, start);
      case "&":
        return this.createToken(TokenType.AMPERSAND, ch, start);
      case ">":
        if (this.peek() === "=") {
          this.advance();
          return this.createToken(TokenType.GTE, ">=", start);
        }
        return this.createToken(TokenType.GT, ch, start);
      case "<":
        if (this.peek() === "=") {
          this.advance();
          return this.createToken(TokenType.LTE, "<=", start);
        }
        return this.createToken(TokenType.LT, ch, start);
      case "=":
        if (this.peek() === "=") {
          this.advance();
          return this.createToken(TokenType.EQ, "==", start);
        }
        return this.createToken(TokenType.UNKNOWN, ch, start);
      case "!":
        if (this.peek() === "=") {
          this.advance();
          return this.createToken(TokenType.NEQ, "!=", start);
        }
        return this.createToken(TokenType.UNKNOWN, ch, start);
      case ".":
        return this.createToken(TokenType.DOT, ch, start);
      case "~":
        return this.createToken(TokenType.TILDE, ch, start);
      case "|":
        return this.createToken(TokenType.PIPE, ch, start);
      case "^":
        return this.createToken(TokenType.CARET, ch, start);
      default:
        return this.createToken(TokenType.UNKNOWN, ch, start);
    }
  }

  private peek(offset: number = 0): string {
    return this.input[this.pos + offset] || "";
  }

  private advance(count: number = 1): string {
    let result = "";
    for (let i = 0; i < count && this.pos < this.input.length; i++) {
      const ch = this.input[this.pos++];
      result += ch;
      if (ch === "\n") {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
    }
    return result;
  }

  private location(): SourceLocation {
    return { line: this.line, column: this.column, offset: this.pos };
  }

  private createToken(type: TokenType, value: string, start?: SourceLocation): Token {
    const startLoc = start || this.location();
    return {
      type,
      value,
      start: startLoc,
      end: this.location(),
    };
  }

  private lookAhead(str: string): boolean {
    return this.input.slice(this.pos, this.pos + str.length).toLowerCase() === str.toLowerCase();
  }

  private isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9";
  }

  private isHexChar(ch: string): boolean {
    return this.isDigit(ch) || (ch >= "a" && ch <= "f") || (ch >= "A" && ch <= "F");
  }

  private isIdentStart(ch: string): boolean {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_" || ch === "-";
  }

  private isIdentChar(ch: string): boolean {
    return this.isIdentStart(ch) || this.isDigit(ch);
  }
}

export function tokenize(input: string): Token[] {
  return new Tokenizer(input).tokenize();
}
