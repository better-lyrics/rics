import {
  CompilerConfig,
  CompilerState,
  CompileResult,
  CompileError,
  CompileWarning,
  ErrorCode,
  Value,
  MixinDefinition,
  FunctionDefinition,
  ParamDefinition,
  SourceLocation,
} from "./types";
import {
  createScope,
  lookupVariable,
  setVariable,
  valueToString,
  isTruthy,
  createExpressionEvaluator,
  parseMap,
  parseList,
} from "./evaluator";

export const defaultConfig: Readonly<Required<CompilerConfig>> = {
  maxIterations: 10000,
  maxOutputRules: 50000,
  maxNestingDepth: 64,
  maxInputSize: 1024 * 1024, // 1MB
  timeout: 5000,
  strictMode: false,
  minify: false,
  preserveBangComments: true,
};

class Compiler {
  private config: Required<CompilerConfig>;
  private state!: CompilerState;
  private input: string = "";
  private pos: number = 0;
  private valueStartPos: number = 0;
  private evaluator = createExpressionEvaluator((error) =>
    this.addError(error)
  );

  constructor(config: Partial<CompilerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  compile(input: string): CompileResult {
    // Check input size limit
    if (
      this.config.maxInputSize > 0 &&
      input.length > this.config.maxInputSize
    ) {
      return {
        css: "",
        errors: [
          {
            type: "error",
            code: ErrorCode.MAX_INPUT_SIZE,
            message: `Input exceeds maximum size of ${this.config.maxInputSize} bytes`,
          },
        ],
        warnings: [],
        stats: {
          iterations: 0,
          rules: 0,
          duration: 0,
          inputSize: input.length,
          outputSize: 0,
        },
      };
    }

    this.input = input;
    this.pos = 0;

    this.state = {
      config: this.config,
      scope: createScope(),
      mixins: new Map(),
      functions: new Map(),
      iterations: 0,
      rules: 0,
      startTime: Date.now(),
      errors: [],
      warnings: [],
      output: [],
      selectorStack: [],
      atRuleStack: [],
    };

    try {
      this.parseStylesheet();
    } catch (e) {
      if (e instanceof CompilerError) {
        this.addError({
          type: "error",
          code: e.code,
          message: e.message,
          start: e.location,
        });
      } else {
        this.addError({
          type: "error",
          code: ErrorCode.SYNTAX_ERROR,
          message: String(e),
        });
      }
    }

    const css = this.formatOutput();

    return {
      css,
      errors: this.state.errors,
      warnings: this.state.warnings,
      stats: {
        iterations: this.state.iterations,
        rules: this.state.rules,
        duration: Date.now() - this.state.startTime,
        inputSize: input.length,
        outputSize: css.length,
      },
    };
  }

  private checkLimits(): void {
    if (
      this.config.maxIterations > 0 &&
      this.state.iterations >= this.config.maxIterations
    ) {
      throw new CompilerError(
        ErrorCode.MAX_ITERATIONS,
        "Maximum iterations exceeded",
        this.location()
      );
    }
    if (
      this.config.timeout > 0 &&
      Date.now() - this.state.startTime >= this.config.timeout
    ) {
      throw new CompilerError(
        ErrorCode.TIMEOUT,
        "Compilation timeout",
        this.location()
      );
    }
    if (
      this.config.maxOutputRules > 0 &&
      this.state.rules >= this.config.maxOutputRules
    ) {
      throw new CompilerError(
        ErrorCode.MAX_OUTPUT_RULES,
        "Maximum output rules exceeded",
        this.location()
      );
    }
  }

  private addError(
    error: Omit<CompileError, "type"> & { type?: "error" }
  ): void {
    this.state.errors.push({ type: "error", ...error } as CompileError);
    if (this.config.strictMode) {
      throw new CompilerError(error.code, error.message, error.start);
    }
  }

  private addWarning(warning: Omit<CompileWarning, "type">): void {
    this.state.warnings.push({ type: "warning", ...warning } as CompileWarning);
  }

  private location(): SourceLocation {
    return this.locationAt(this.pos);
  }

  private locationAt(pos: number): SourceLocation {
    let line = 1;
    let column = 0;
    for (let i = 0; i < pos && i < this.input.length; i++) {
      if (this.input[i] === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
    }
    return { line, column, offset: pos };
  }

  private peek(offset: number = 0): string {
    return this.input[this.pos + offset] || "";
  }

  private advance(count: number = 1): string {
    const result = this.input.slice(this.pos, this.pos + count);
    this.pos += count;
    return result;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length) {
      const ch = this.peek();
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        this.advance();
      } else if (ch === "/" && this.peek(1) === "/") {
        this.skipSingleLineComment();
      } else if (ch === "/" && this.peek(1) === "*") {
        // Don't consume multi-line comments here - let parseStylesheet handle them
        // to preserve them in output
        break;
      } else {
        break;
      }
    }
  }

  private skipSingleLineComment(): void {
    while (this.pos < this.input.length && this.peek() !== "\n") {
      this.advance();
    }
    if (this.peek() === "\n") this.advance();
  }

  private readMultiLineComment(): string {
    const start = this.pos;
    const isBang = this.peek(2) === "!";
    this.advance(2);

    while (this.pos < this.input.length) {
      if (this.peek() === "*" && this.peek(1) === "/") {
        this.advance(2);
        break;
      }
      this.advance();
    }

    const comment = this.input.slice(start, this.pos);
    if (isBang || !this.config.minify) {
      return comment;
    }
    return "";
  }

  private parseStylesheet(): void {
    while (this.pos < this.input.length) {
      this.checkLimits();
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.peek();

      if (ch === "@") {
        this.parseAtRule();
      } else if (ch === "$") {
        this.parseVariableDeclaration();
      } else if (ch === "/" && this.peek(1) === "*") {
        const comment = this.readMultiLineComment();
        if (comment) {
          this.state.output.push(comment);
        }
      } else if (ch === "}") {
        break;
      } else {
        this.parseRuleset();
      }
    }
  }

  private parseVariableDeclaration(): void {
    const varName = this.readVariable();
    this.skipWhitespace();

    if (this.peek() !== ":") {
      this.addError({
        code: ErrorCode.SYNTAX_ERROR,
        message: `Expected ':' after variable name ${varName}`,
        start: this.location(),
      });
      return;
    }
    this.advance();
    this.skipWhitespace();

    const valueStr = this.readUntil(";", true).trim();
    if (this.peek() === ";") this.advance();

    const value = this.evaluateExpression(valueStr);
    setVariable(this.state.scope, varName, value);
  }

  private readVariable(): string {
    let name = this.advance();
    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      name += this.advance();
    }
    return name;
  }

  private parseAtRule(): void {
    const keyword = this.readAtKeyword();

    switch (keyword) {
      case "@mixin":
        this.parseMixin();
        break;
      case "@function":
        this.parseFunction();
        break;
      case "@include":
        this.parseInclude();
        break;
      case "@if":
        this.parseIf();
        break;
      case "@for":
        this.parseFor();
        break;
      case "@each":
        this.parseEach();
        break;
      case "@return":
        break;
      case "@media":
      case "@supports":
      case "@keyframes":
      case "@font-face":
      case "@import":
      case "@charset":
      case "@namespace":
      case "@page":
      case "@layer":
      case "@container":
      case "@scope":
      case "@starting-style":
        this.parseNativeAtRule(keyword);
        break;
      default:
        this.parseNativeAtRule(keyword);
    }
  }

  private readAtKeyword(): string {
    let keyword = this.advance();
    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      keyword += this.advance();
    }
    return keyword;
  }

  private parseMixin(): void {
    this.skipWhitespace();
    const name = this.readIdent();
    this.skipWhitespace();

    const params = this.parseParamDefinitions();
    this.skipWhitespace();

    if (this.peek() !== "{") {
      this.addError({
        code: ErrorCode.SYNTAX_ERROR,
        message: `Expected '{' after mixin definition`,
        start: this.location(),
      });
      return;
    }

    const body = this.readBlock();
    this.state.mixins.set(name, {
      name,
      params,
      body,
      start: this.location(),
    });
  }

  private parseFunction(): void {
    this.skipWhitespace();
    const name = this.readIdent();
    this.skipWhitespace();

    const params = this.parseParamDefinitions();
    this.skipWhitespace();

    if (this.peek() !== "{") {
      this.addError({
        code: ErrorCode.SYNTAX_ERROR,
        message: `Expected '{' after function definition`,
        start: this.location(),
      });
      return;
    }

    const body = this.readBlock();
    this.state.functions.set(name, {
      name,
      params,
      body,
      start: this.location(),
    });
  }

  private parseParamDefinitions(): ParamDefinition[] {
    const params: ParamDefinition[] = [];

    if (this.peek() !== "(") return params;
    this.advance();

    while (this.pos < this.input.length && this.peek() !== ")") {
      this.skipWhitespace();
      if (this.peek() === ")") break;

      if (this.peek() !== "$") {
        this.advance();
        continue;
      }

      const paramName = this.readVariable();
      this.skipWhitespace();

      let defaultValue: string | undefined;
      if (this.peek() === ":") {
        this.advance();
        this.skipWhitespace();
        defaultValue = this.readParamDefault();
      }

      params.push({ name: paramName, defaultValue });

      this.skipWhitespace();
      if (this.peek() === ",") this.advance();
    }

    if (this.peek() === ")") this.advance();
    return params;
  }

  private readParamDefault(): string {
    let value = "";
    let depth = 0;

    while (this.pos < this.input.length) {
      const ch = this.peek();
      if (depth === 0 && (ch === "," || ch === ")")) break;

      if (ch === "(" || ch === "[" || ch === "{") depth++;
      if (ch === ")" || ch === "]" || ch === "}") depth--;

      value += this.advance();
    }

    return value.trim();
  }

  private parseInclude(): void {
    this.skipWhitespace();
    const name = this.readIdent();
    this.skipWhitespace();

    const args: string[] = [];
    if (this.peek() === "(") {
      this.advance();
      while (this.pos < this.input.length && this.peek() !== ")") {
        this.skipWhitespace();
        if (this.peek() === ")") break;

        args.push(this.readArgument());
        this.skipWhitespace();
        if (this.peek() === ",") this.advance();
      }
      if (this.peek() === ")") this.advance();
    }

    this.skipWhitespace();
    if (this.peek() === ";") this.advance();

    const mixin = this.state.mixins.get(name);
    if (!mixin) {
      this.addError({
        code: ErrorCode.UNDEFINED_MIXIN,
        message: `Undefined mixin: ${name}`,
        start: this.location(),
      });
      return;
    }

    this.executeMixin(mixin, args);
  }

  private executeMixin(mixin: MixinDefinition, args: string[]): void {
    const localScope = createScope(this.state.scope);

    for (let i = 0; i < mixin.params.length; i++) {
      const param = mixin.params[i];
      const argValue = args[i] || param.defaultValue || "";
      const value = this.evaluateExpression(argValue);
      setVariable(localScope, param.name, value);
    }

    const savedScope = this.state.scope;
    const savedPos = this.pos;
    const savedInput = this.input;
    const savedInMixinContext = this.inMixinContext;

    this.state.scope = localScope;
    this.input = mixin.body;
    this.pos = 0;
    this.inMixinContext = true;

    this.parseMixinBody();

    this.state.scope = savedScope;
    this.pos = savedPos;
    this.input = savedInput;
    this.inMixinContext = savedInMixinContext;
  }

  private parseMixinBody(): void {
    while (this.pos < this.input.length) {
      this.checkLimits();
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.peek();

      if (ch === "@") {
        const atKeyword = this.peekAtKeyword();
        if (atKeyword === "@include") {
          this.advance(8);
          this.parseInclude();
        } else if (atKeyword === "@if") {
          this.advance(3);
          this.parseIf();
        } else if (atKeyword === "@for") {
          this.advance(4);
          this.parseFor();
        } else if (atKeyword === "@each") {
          this.advance(5);
          this.parseEach();
        } else {
          this.parseAtRule();
        }
      } else if (ch === "$") {
        this.parseVariableDeclaration();
      } else if (ch === "/" && this.peek(1) === "*") {
        const comment = this.readMultiLineComment();
        if (comment) {
          this.state.output.push(comment);
        }
      } else if (ch === "}") {
        break;
      } else if (
        ch === "&" ||
        ch === "." ||
        ch === "[" ||
        ch === "*" ||
        (ch === "#" && this.peek(1) !== "{") ||
        (ch === ":" && this.looksLikeSelector())
      ) {
        // Handle nested selectors like &:hover {}
        this.parseRuleset();
      } else {
        // Try to parse as declaration first
        const decl = this.parseDeclaration();
        if (decl) {
          this.state.output.push(decl);
        }
      }
    }
  }

  private parseIf(): void {
    this.skipWhitespace();

    // Collect all branches: [{condition, block}, ...]
    // The last one may have condition = null for plain @else
    const branches: { condition: string | null; block: string }[] = [];

    // First @if branch
    const firstCondition = this.readUntil("{", false).trim();
    const firstBlock = this.readBlock();
    branches.push({ condition: firstCondition, block: firstBlock });

    // Collect @else if and @else branches
    while (true) {
      this.skipWhitespace();
      if (this.input.slice(this.pos, this.pos + 5) !== "@else") {
        break;
      }
      this.advance(5); // past "@else"
      this.skipWhitespace();

      if (this.input.slice(this.pos, this.pos + 2) === "if") {
        // @else if
        this.advance(2); // past "if"
        this.skipWhitespace();
        const elseIfCondition = this.readUntil("{", false).trim();
        const elseIfBlock = this.readBlock();
        branches.push({ condition: elseIfCondition, block: elseIfBlock });
      } else if (this.peek() === "{") {
        // plain @else
        const elseBlock = this.readBlock();
        branches.push({ condition: null, block: elseBlock });
        break; // @else must be last
      } else {
        break;
      }
    }

    // Execute the first branch whose condition is true
    for (const branch of branches) {
      if (branch.condition === null) {
        // Plain @else - always execute if we get here
        this.executeBlock(branch.block);
        break;
      } else if (this.evaluateCondition(branch.condition)) {
        this.executeBlock(branch.block);
        break;
      }
    }
  }

  private parseFor(): void {
    this.skipWhitespace();
    this.state.iterations++;
    this.checkLimits();

    if (this.peek() !== "$") {
      this.addError({
        code: ErrorCode.SYNTAX_ERROR,
        message: "Expected variable in @for",
        start: this.location(),
      });
      return;
    }

    const varName = this.readVariable();
    this.skipWhitespace();

    const rest = this.readUntil("{", false).trim();
    const loopBody = this.readBlock();

    const fromMatch = rest.match(
      /from\s+(.+?)\s+(through|to)\s+(.+?)(?:\s+by\s+(.+))?$/i
    );
    if (!fromMatch) {
      this.addError({
        code: ErrorCode.SYNTAX_ERROR,
        message: "Invalid @for syntax",
        start: this.location(),
      });
      return;
    }

    const startVal = this.evaluateExpression(fromMatch[1]);
    const endVal = this.evaluateExpression(fromMatch[3]);
    const stepVal = fromMatch[4]
      ? this.evaluateExpression(fromMatch[4])
      : { type: "number" as const, value: 1, unit: "" };
    const inclusive = fromMatch[2].toLowerCase() === "through";

    if (
      startVal.type !== "number" ||
      endVal.type !== "number" ||
      stepVal.type !== "number"
    ) {
      this.addError({
        code: ErrorCode.TYPE_ERROR,
        message: "@for requires numeric values",
        start: this.location(),
      });
      return;
    }

    const start = startVal.value;
    const end = endVal.value;
    const step = Math.abs(stepVal.value) || 1;
    const direction = end >= start ? 1 : -1;

    const localScope = createScope(this.state.scope);
    const savedScope = this.state.scope;

    let i = start;
    while (
      direction > 0
        ? inclusive
          ? i <= end
          : i < end
        : inclusive
          ? i >= end
          : i > end
    ) {
      this.state.iterations++;
      this.checkLimits();

      setVariable(localScope, varName, { type: "number", value: i, unit: "" });
      this.state.scope = localScope;
      this.executeBlock(loopBody);

      i += step * direction;
    }

    this.state.scope = savedScope;
  }

  private parseEach(): void {
    this.skipWhitespace();
    this.state.iterations++;
    this.checkLimits();

    const vars: string[] = [];
    while (this.peek() === "$") {
      vars.push(this.readVariable());
      this.skipWhitespace();
      if (this.peek() === ",") {
        this.advance();
        this.skipWhitespace();
      }
    }

    const rest = this.readUntil("{", false).trim();
    const loopBody = this.readBlock();

    const inMatch = rest.match(/^in\s+(.+)$/i);
    if (!inMatch) {
      this.addError({
        code: ErrorCode.SYNTAX_ERROR,
        message: "Invalid @each syntax, expected 'in'",
        start: this.location(),
      });
      return;
    }

    const listExpr = inMatch[1].trim();
    let collection: Value;

    if (listExpr.startsWith("(") && listExpr.includes(":")) {
      collection = parseMap(listExpr);
    } else if (listExpr.startsWith("$")) {
      collection = this.evaluateExpression(listExpr);
    } else {
      collection = parseList(listExpr);
    }

    const localScope = createScope(this.state.scope);
    const savedScope = this.state.scope;

    if (collection.type === "map") {
      collection.entries.forEach((val, key) => {
        this.state.iterations++;
        this.checkLimits();

        if (vars.length >= 1) {
          setVariable(localScope, vars[0], {
            type: "string",
            value: key,
            quoted: false,
          });
        }
        if (vars.length >= 2) {
          setVariable(localScope, vars[1], val);
        }

        this.state.scope = localScope;
        this.executeBlock(loopBody);
      });
    } else if (collection.type === "list") {
      for (const item of collection.values) {
        this.state.iterations++;
        this.checkLimits();

        if (vars.length === 1) {
          setVariable(localScope, vars[0], item);
        } else if (item.type === "list" && vars.length > 1) {
          for (let j = 0; j < vars.length && j < item.values.length; j++) {
            setVariable(localScope, vars[j], item.values[j]);
          }
        }

        this.state.scope = localScope;
        this.executeBlock(loopBody);
      }
    }

    this.state.scope = savedScope;
  }

  private parseNativeAtRule(keyword: string): void {
    this.skipWhitespace();

    const prelude = this.readUntil("{;", false);
    this.skipWhitespace();

    if (this.peek() === "{") {
      const interpolatedKeyword = this.interpolate(keyword);
      const interpolatedPrelude = this.interpolate(prelude.trim());

      this.state.atRuleStack.push(
        `${interpolatedKeyword} ${interpolatedPrelude}`
      );
      const openBraceLocation = this.location();
      this.advance();

      const savedOutput = this.state.output;
      this.state.output = [];

      this.parseStylesheet();

      if (this.peek() === "}") {
        this.advance();
      } else {
        this.addError({
          code: ErrorCode.UNCLOSED_BLOCK,
          message: `Unclosed block: missing closing brace for "${interpolatedKeyword} ${interpolatedPrelude}"`,
          start: openBraceLocation,
          end: this.location(),
        });
      }

      const innerContent = this.state.output.join(
        this.config.minify ? "" : "\n"
      );
      this.state.output = savedOutput;

      if (innerContent.trim()) {
        this.state.output.push(
          `${interpolatedKeyword} ${interpolatedPrelude} {${this.config.minify ? "" : "\n"}${innerContent}${this.config.minify ? "" : "\n"}}`
        );
      }

      this.state.atRuleStack.pop();
    } else {
      if (this.peek() === ";") this.advance();
      this.state.output.push(
        `${this.interpolate(keyword)} ${this.interpolate(prelude.trim())};`
      );
    }
  }

  private parseRuleset(): void {
    const selectorStart = this.pos;
    const selectorStr = this.readUntil("{", false);
    this.skipWhitespace();

    if (this.peek() !== "{") {
      this.pos = selectorStart;
      const line = this.readUntil(";}", true);
      if (this.peek() === ";") this.advance();
      return;
    }

    const openBraceLocation = this.location();
    this.advance();
    this.state.rules++;
    this.checkLimits();

    const selectors = this.parseSelectors(selectorStr);
    const resolvedSelectors = this.resolveSelectors(selectors);

    this.state.selectorStack.push(resolvedSelectors.join(", "));

    const declarations: string[] = [];
    const nestedRules: string[] = [];

    const savedInRulesetContext = this.inRulesetContext;
    this.inRulesetContext = true;
    let foundClosingBrace = false;

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.peek() === "}") {
        this.advance();
        foundClosingBrace = true;
        break;
      }

      const ch = this.peek();

      if (ch === "@") {
        const atKeyword = this.peekAtKeyword();
        if (atKeyword === "@include") {
          this.advance(8);
          const savedOutput = this.state.output;
          this.state.output = [];
          this.parseInclude();
          // Separate declarations from nested rules
          for (const item of this.state.output) {
            if (item.includes("{")) {
              nestedRules.push(item);
            } else {
              declarations.push(item);
            }
          }
          this.state.output = savedOutput;
        } else if (atKeyword === "@if") {
          this.advance(3);
          const savedOutput = this.state.output;
          this.state.output = [];
          this.parseIf();
          // Separate declarations from nested rules
          for (const item of this.state.output) {
            if (item.includes("{")) {
              nestedRules.push(item);
            } else {
              declarations.push(item);
            }
          }
          this.state.output = savedOutput;
        } else if (atKeyword === "@for") {
          this.advance(4);
          const savedOutput = this.state.output;
          this.state.output = [];
          this.parseFor();
          // Separate declarations from nested rules
          for (const item of this.state.output) {
            if (item.includes("{")) {
              nestedRules.push(item);
            } else {
              declarations.push(item);
            }
          }
          this.state.output = savedOutput;
        } else if (atKeyword === "@each") {
          this.advance(5);
          const savedOutput = this.state.output;
          this.state.output = [];
          this.parseEach();
          // Separate declarations from nested rules
          for (const item of this.state.output) {
            if (item.includes("{")) {
              nestedRules.push(item);
            } else {
              declarations.push(item);
            }
          }
          this.state.output = savedOutput;
        } else if (
          atKeyword === "@media" ||
          atKeyword === "@supports" ||
          atKeyword === "@container"
        ) {
          const savedOutput = this.state.output;
          this.state.output = [];
          this.parseAtRule();
          nestedRules.push(...this.state.output);
          this.state.output = savedOutput;
        } else {
          this.parseAtRule();
        }
        continue;
      }

      if (ch === "$") {
        this.parseVariableDeclaration();
        continue;
      }

      if (
        ch === "&" ||
        ch === "." ||
        ch === "[" ||
        ch === ":" ||
        ch === "*" ||
        (ch === "#" && this.peek(1) !== "{") || // ID selector, not interpolation
        (this.isIdentStart(ch) && this.looksLikeSelector())
      ) {
        const savedOutput = this.state.output;
        this.state.output = [];
        this.parseRuleset();
        nestedRules.push(...this.state.output);
        this.state.output = savedOutput;
        continue;
      }

      const decl = this.parseDeclaration();
      if (decl) {
        declarations.push(decl);
      } else {
        // parseDeclaration returned null and reset pos - skip this character to avoid infinite loop
        this.advance();
      }
    }

    // Check for unclosed brace
    if (!foundClosingBrace) {
      this.addError({
        code: ErrorCode.UNCLOSED_BLOCK,
        message: `Unclosed block: missing closing brace for "${selectorStr.trim()}"`,
        start: openBraceLocation,
        end: this.location(),
      });
    }

    this.inRulesetContext = savedInRulesetContext;
    this.state.selectorStack.pop();

    if (declarations.length > 0) {
      const declStr = declarations.join(this.config.minify ? ";" : ";\n  ");
      const selector = resolvedSelectors.join(this.config.minify ? "," : ", ");
      if (this.config.minify) {
        this.state.output.push(`${selector}{${declStr}}`);
      } else {
        this.state.output.push(`${selector} {\n  ${declStr};\n}`);
      }
    }

    this.state.output.push(...nestedRules);
  }

  private peekAtKeyword(): string {
    let i = this.pos;
    let keyword = "";
    while (
      i < this.input.length &&
      (this.input[i] === "@" || this.isIdentChar(this.input[i]))
    ) {
      keyword += this.input[i];
      i++;
    }
    return keyword;
  }

  private looksLikeSelector(): boolean {
    let i = this.pos;
    let depth = 0;

    while (i < this.input.length) {
      const ch = this.input[i];

      // Skip over #{...} interpolation blocks
      if (ch === "#" && this.input[i + 1] === "{") {
        let interpDepth = 1;
        i += 2;
        while (i < this.input.length && interpDepth > 0) {
          if (this.input[i] === "{") interpDepth++;
          if (this.input[i] === "}") interpDepth--;
          i++;
        }
        continue;
      }

      if (ch === "{") return true;
      if (ch === ";" && depth === 0) return false;
      if (ch === ":") {
        const next = this.input[i + 1];
        if (next === ":" || next === " " || /[a-z]/i.test(next)) {
          if (
            /^:(hover|focus|active|visited|first-child|last-child|nth-child|before|after|not|where|is|has)/i.test(
              this.input.slice(i)
            )
          ) {
            return true;
          }
        }
      }
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      i++;
    }

    return false;
  }

  private parseSelectors(selectorStr: string): string[] {
    const selectors: string[] = [];
    let current = "";
    let depth = 0;

    for (let i = 0; i < selectorStr.length; i++) {
      const ch = selectorStr[i];
      if (ch === "(" || ch === "[") depth++;
      if (ch === ")" || ch === "]") depth--;

      if (ch === "," && depth === 0) {
        if (current.trim()) selectors.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }

    if (current.trim()) selectors.push(current.trim());
    return selectors.map((s) => this.interpolate(s));
  }

  private resolveSelectors(selectors: string[]): string[] {
    if (this.state.selectorStack.length === 0) {
      return selectors;
    }

    const parentSelectors =
      this.state.selectorStack[this.state.selectorStack.length - 1].split(
        /\s*,\s*/
      );
    const resolved: string[] = [];

    for (const parent of parentSelectors) {
      for (const selector of selectors) {
        if (selector.includes("&")) {
          resolved.push(selector.replace(/&/g, parent));
        } else {
          resolved.push(`${parent} ${selector}`);
        }
      }
    }

    return resolved;
  }

  private parseDeclaration(): string | null {
    const propStart = this.pos;
    let property = "";
    let inInterp = false;
    let interpDepth = 0;

    while (this.pos < this.input.length) {
      const ch = this.peek();

      if (ch === "#" && this.peek(1) === "{") {
        inInterp = true;
        interpDepth = 1;
        property += this.advance(2);
        continue;
      }

      if (inInterp) {
        if (ch === "{") interpDepth++;
        if (ch === "}") {
          interpDepth--;
          if (interpDepth === 0) inInterp = false;
        }
        property += this.advance();
        continue;
      }

      if (ch === ":") break;
      if (ch === ";" || ch === "}" || ch === "{") {
        this.pos = propStart;
        return null;
      }

      property += this.advance();
    }

    if (this.peek() !== ":") return null;
    this.advance();
    this.skipWhitespace();

    property = this.interpolate(property.trim());

    this.valueStartPos = this.pos;
    let value = "";
    let depth = 0;
    inInterp = false;
    interpDepth = 0;

    while (this.pos < this.input.length) {
      const ch = this.peek();

      if (ch === "#" && this.peek(1) === "{") {
        inInterp = true;
        interpDepth = 1;
        value += this.advance(2);
        continue;
      }

      if (inInterp) {
        if (ch === "{") interpDepth++;
        if (ch === "}") {
          interpDepth--;
          if (interpDepth === 0) inInterp = false;
        }
        value += this.advance();
        continue;
      }

      if (ch === "(" || ch === "[") depth++;
      if (ch === ")" || ch === "]") depth--;

      if ((ch === ";" || ch === "}") && depth === 0) {
        if (ch === ";") this.advance();
        break;
      }

      value += this.advance();
    }

    value = this.processValue(value.trim());
    return `${property}: ${value}`;
  }

  private processValue(value: string): string {
    value = this.interpolate(value);
    value = this.substituteVariables(value);
    value = this.evaluateFunctionCalls(value);
    value = this.evaluateMath(value);
    return value;
  }

  private evaluateFunctionCalls(str: string): string {
    // Match function calls like darken(...), lighten(...), etc.
    // but not CSS functions like url(), var(), calc()
    const cssOnlyFunctions =
      /^(url|var|calc|min|max|clamp|attr|env|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|color|hwb|lab|lch|oklab|oklch|rgb|rgba|hsl|hsla)$/i;

    // Built-in SCSS-like functions that should be evaluated
    const scssBuiltins =
      /^(darken|lighten|saturate|desaturate|adjust-hue|rgba|mix|complement|invert|grayscale|red|green|blue|alpha|opacity|hue|saturation|lightness|round|ceil|floor|abs|min|max|percentage|length|nth|index|map-get|map-has-key|type-of|unit|unitless|quote|unquote|str-length|str-slice|str-index|to-upper-case|to-lower-case|if)$/i;

    let result = str;
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      // Match function calls: functionName(...)
      const funcRegex =
        /([a-zA-Z_][\w-]*)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;

      result = result.replace(funcRegex, (match, funcName, args, offset) => {
        // Skip CSS-only functions
        if (cssOnlyFunctions.test(funcName) && !scssBuiltins.test(funcName)) {
          return match;
        }

        // Check if this is a known SCSS function
        if (scssBuiltins.test(funcName)) {
          try {
            const evaluated = this.evaluateExpression(match);
            if (evaluated.type !== "null") {
              changed = true;
              return valueToString(evaluated);
            }
          } catch {
            // If evaluation fails, return original
          }
        }

        return match;
      });
    }

    return result;
  }

  private interpolate(str: string): string {
    let result = "";
    let i = 0;

    while (i < str.length) {
      if (str[i] === "#" && str[i + 1] === "{") {
        let depth = 1;
        let j = i + 2;

        while (j < str.length && depth > 0) {
          if (str[j] === "{") depth++;
          if (str[j] === "}") depth--;
          j++;
        }

        const expr = str.slice(i + 2, j - 1);
        const value = this.evaluateExpression(expr);
        // When interpolating, strip quotes from strings (SCSS behavior)
        // Exception: strings explicitly created by quote() keep their quotes
        if (value.type === "string") {
          // Check if this is from quote() - it will have quoted: true
          // For now, preserve quotes only for explicitly quoted strings in values
          result += value.value;
        } else {
          result += valueToString(value);
        }
        i = j;
      } else {
        result += str[i];
        i++;
      }
    }

    return result;
  }

  private substituteVariables(str: string): string {
    return str.replace(/\$[\w-]+/g, (match, offset) => {
      const value = lookupVariable(this.state.scope, match);
      if (value) {
        return valueToString(value);
      }
      const pos = this.valueStartPos + offset;
      this.addWarning({
        code: "UNDEFINED_VARIABLE",
        message: `Undefined variable: ${match}`,
        start: this.locationAt(pos),
        end: this.locationAt(pos + match.length),
      });
      return match;
    });
  }

  private evaluateMath(str: string): string {
    // First, try to evaluate the entire string as a math expression
    // This handles cases like "100px + 50px" without parentheses
    if (this.looksLikeMath(str) && !str.includes("(")) {
      const result = this.evaluateExpression(str);
      return valueToString(result);
    }

    // Don't evaluate math inside CSS functions like calc(), var(), min(), max(), clamp()
    return str.replace(/\(([^()]+)\)/g, (match, inner, offset) => {
      // Check what precedes this parenthesis to skip CSS functions
      const beforeParen = str.slice(0, offset);
      if (
        /(?:calc|var|min|max|clamp|url|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|linear-gradient|radial-gradient|conic-gradient|attr|translateX|translateY|translateZ|translate|translate3d|rotateX|rotateY|rotateZ|rotate|rotate3d|scaleX|scaleY|scaleZ|scale|scale3d|skewX|skewY|skew|perspective|matrix|matrix3d|cubic-bezier|steps|drop-shadow|blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|path|polygon|circle|ellipse|inset|rect|image-set|element|paint|cross-fade|image|symbols|counter|counters|format|local|annotation|stylistic|ornaments|styleset|character-variant|swash|leader|target-counter|target-counters|target-text)\s*$/i.test(
          beforeParen
        )
      ) {
        return match;
      }
      if (this.looksLikeMath(inner)) {
        const result = this.evaluateExpression(inner);
        return valueToString(result);
      }
      return match;
    });
  }

  private looksLikeMath(str: string): boolean {
    // Don't evaluate if it looks like a CSS function (calc, var, etc.)
    if (/^(calc|var|min|max|clamp)\s*\(/i.test(str.trim())) {
      return false;
    }
    // Match numbers with optional units, variables, and math operators
    // Must have a math operator and contain numbers or variables
    return /[+\-*/%]/.test(str) && (/\d/.test(str) || /\$/.test(str));
  }

  private evaluateExpression(expr: string): Value {
    const interpolated = this.interpolate(expr);
    // Note: Don't call substituteVariables here - the evaluator handles variable lookup
    // directly, which preserves list/map types instead of converting to strings

    const customFunctions = new Map<
      string,
      (...args: Value[]) => Value | string
    >();

    this.state.functions.forEach((fn, name) => {
      customFunctions.set(name, (...args: Value[]) => {
        return this.executeFunction(fn, args);
      });
    });

    return this.evaluator.evaluate(
      interpolated,
      this.state.scope,
      customFunctions
    );
  }

  private executeFunction(fn: FunctionDefinition, args: Value[]): Value {
    const localScope = createScope(this.state.scope);

    for (let i = 0; i < fn.params.length; i++) {
      const param = fn.params[i];
      const value =
        args[i] ||
        (param.defaultValue
          ? this.evaluateExpression(param.defaultValue)
          : { type: "null" as const });
      setVariable(localScope, param.name, value);
    }

    const savedScope = this.state.scope;
    this.state.scope = localScope;

    const returnValue = this.executeFunctionBody(fn.body);

    this.state.scope = savedScope;
    return returnValue;
  }

  private executeFunctionBody(body: string): Value {
    const savedPos = this.pos;
    const savedInput = this.input;

    this.input = body;
    this.pos = 0;

    let result: Value = { type: "null" };

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      if (this.peek() === "@") {
        const keyword = this.peekAtKeyword();

        if (keyword === "@return") {
          this.advance(7);
          this.skipWhitespace();
          const returnExpr = this.readUntil(";}", true).trim();
          if (this.peek() === ";") this.advance();
          result = this.evaluateExpression(returnExpr);
          break;
        } else if (keyword === "@if") {
          this.advance(3);
          const ifResult = this.executeIfForReturn();
          if (ifResult !== null) {
            result = ifResult;
            break;
          }
        } else if (keyword === "@for") {
          this.advance(4);
          const forResult = this.executeForForReturn();
          if (forResult !== null) {
            result = forResult;
            break;
          }
        } else if (keyword === "@each") {
          this.advance(5);
          const eachResult = this.executeEachForReturn();
          if (eachResult !== null) {
            result = eachResult;
            break;
          }
        } else {
          this.readUntil(";}", true);
          if (this.peek() === ";") this.advance();
        }
      } else if (this.peek() === "$") {
        this.parseVariableDeclaration();
      } else {
        this.readUntil(";}", true);
        if (this.peek() === ";") this.advance();
      }
    }

    this.pos = savedPos;
    this.input = savedInput;

    return result;
  }

  private executeIfForReturn(): Value | null {
    this.skipWhitespace();

    // Collect all branches: [{condition, block}, ...]
    const branches: { condition: string | null; block: string }[] = [];

    // First @if branch
    const firstCondition = this.readUntil("{", false).trim();
    const firstBlock = this.readBlock();
    branches.push({ condition: firstCondition, block: firstBlock });

    // Collect @else if and @else branches
    while (true) {
      this.skipWhitespace();
      if (this.input.slice(this.pos, this.pos + 5) !== "@else") {
        break;
      }
      this.advance(5); // past "@else"
      this.skipWhitespace();

      if (this.input.slice(this.pos, this.pos + 2) === "if") {
        // @else if
        this.advance(2); // past "if"
        this.skipWhitespace();
        const elseIfCondition = this.readUntil("{", false).trim();
        const elseIfBlock = this.readBlock();
        branches.push({ condition: elseIfCondition, block: elseIfBlock });
      } else if (this.peek() === "{") {
        // plain @else
        const elseBlock = this.readBlock();
        branches.push({ condition: null, block: elseBlock });
        break; // @else must be last
      } else {
        break;
      }
    }

    // Execute the first branch whose condition is true
    for (const branch of branches) {
      if (branch.condition === null) {
        // Plain @else - always execute if we get here
        const result = this.executeFunctionBody(branch.block);
        if (result.type !== "null") return result;
        break;
      } else if (this.evaluateCondition(branch.condition)) {
        const result = this.executeFunctionBody(branch.block);
        if (result.type !== "null") return result;
        break;
      }
    }

    return null;
  }

  private executeForForReturn(): Value | null {
    this.skipWhitespace();
    this.state.iterations++;
    this.checkLimits();

    if (this.peek() !== "$") return null;

    const varName = this.readVariable();
    this.skipWhitespace();

    const rest = this.readUntil("{", false).trim();
    const loopBody = this.readBlock();

    const fromMatch = rest.match(
      /from\s+(.+?)\s+(through|to)\s+(.+?)(?:\s+by\s+(.+))?$/i
    );
    if (!fromMatch) return null;

    const startVal = this.evaluateExpression(fromMatch[1]);
    const endVal = this.evaluateExpression(fromMatch[3]);
    const stepVal = fromMatch[4]
      ? this.evaluateExpression(fromMatch[4])
      : { type: "number" as const, value: 1, unit: "" };
    const inclusive = fromMatch[2].toLowerCase() === "through";

    if (
      startVal.type !== "number" ||
      endVal.type !== "number" ||
      stepVal.type !== "number"
    )
      return null;

    const start = startVal.value;
    const end = endVal.value;
    const step = Math.abs(stepVal.value) || 1;
    const direction = end >= start ? 1 : -1;

    const localScope = createScope(this.state.scope);
    const savedScope = this.state.scope;

    let i = start;
    while (
      direction > 0
        ? inclusive
          ? i <= end
          : i < end
        : inclusive
          ? i >= end
          : i > end
    ) {
      this.state.iterations++;
      this.checkLimits();

      setVariable(localScope, varName, { type: "number", value: i, unit: "" });
      this.state.scope = localScope;

      const result = this.executeFunctionBody(loopBody);
      if (result.type !== "null") {
        this.state.scope = savedScope;
        return result;
      }

      i += step * direction;
    }

    this.state.scope = savedScope;
    return null;
  }

  private executeEachForReturn(): Value | null {
    this.skipWhitespace();
    this.state.iterations++;
    this.checkLimits();

    const vars: string[] = [];
    while (this.peek() === "$") {
      vars.push(this.readVariable());
      this.skipWhitespace();
      if (this.peek() === ",") {
        this.advance();
        this.skipWhitespace();
      }
    }

    const rest = this.readUntil("{", false).trim();
    const loopBody = this.readBlock();

    const inMatch = rest.match(/^in\s+(.+)$/i);
    if (!inMatch) return null;

    const listExpr = inMatch[1].trim();
    let collection: Value;

    if (listExpr.startsWith("(") && listExpr.includes(":")) {
      collection = parseMap(listExpr);
    } else if (listExpr.startsWith("$")) {
      collection = this.evaluateExpression(listExpr);
    } else {
      collection = parseList(listExpr);
    }

    const localScope = createScope(this.state.scope);
    const savedScope = this.state.scope;

    if (collection.type === "map") {
      for (const [key, val] of collection.entries) {
        this.state.iterations++;
        this.checkLimits();

        if (vars.length >= 1) {
          setVariable(localScope, vars[0], {
            type: "string",
            value: key,
            quoted: false,
          });
        }
        if (vars.length >= 2) {
          setVariable(localScope, vars[1], val);
        }

        this.state.scope = localScope;
        const result = this.executeFunctionBody(loopBody);
        if (result.type !== "null") {
          this.state.scope = savedScope;
          return result;
        }
      }
    } else if (collection.type === "list") {
      for (const item of collection.values) {
        this.state.iterations++;
        this.checkLimits();

        if (vars.length === 1) {
          setVariable(localScope, vars[0], item);
        }

        this.state.scope = localScope;
        const result = this.executeFunctionBody(loopBody);
        if (result.type !== "null") {
          this.state.scope = savedScope;
          return result;
        }
      }
    }

    this.state.scope = savedScope;
    return null;
  }

  private evaluateCondition(expr: string): boolean {
    const value = this.evaluateExpression(expr);
    return isTruthy(value);
  }

  private inMixinContext: boolean = false;
  private inRulesetContext: boolean = false;

  private executeBlock(block: string): void {
    const savedPos = this.pos;
    const savedInput = this.input;

    this.input = block;
    this.pos = 0;

    if (this.inMixinContext || this.inRulesetContext) {
      // Inside mixin or ruleset, parse as declarations
      this.parseMixinBody();
    } else {
      this.parseStylesheet();
    }

    this.pos = savedPos;
    this.input = savedInput;
  }

  private readBlock(): string {
    if (this.peek() !== "{") return "";
    const openBraceLocation = this.location();
    this.advance();

    let depth = 1;
    let content = "";
    let inString: string | null = null;

    while (this.pos < this.input.length && depth > 0) {
      const ch = this.peek();

      if (inString) {
        content += this.advance();
        if (ch === inString && this.input[this.pos - 2] !== "\\") {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        content += this.advance();
        continue;
      }

      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          this.advance();
          break;
        }
      }

      content += this.advance();
    }

    // Check for unclosed block
    if (depth > 0) {
      this.addError({
        code: ErrorCode.UNCLOSED_BLOCK,
        message: "Unclosed block: missing closing brace",
        start: openBraceLocation,
        end: this.location(),
      });
    }

    return content;
  }

  private readUntil(chars: string, allowNested: boolean): string {
    let result = "";
    let depth = 0;
    let inString: string | null = null;

    while (this.pos < this.input.length) {
      const ch = this.peek();

      if (inString) {
        result += this.advance();
        if (ch === inString && this.input[this.pos - 2] !== "\\") {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        result += this.advance();
        continue;
      }

      // Skip over #{...} interpolation blocks
      if (ch === "#" && this.peek(1) === "{") {
        result += this.advance(2); // consume #{
        let interpDepth = 1;
        while (this.pos < this.input.length && interpDepth > 0) {
          const ic = this.peek();
          if (ic === "{") interpDepth++;
          if (ic === "}") interpDepth--;
          result += this.advance();
        }
        continue;
      }

      if (allowNested) {
        if (ch === "(" || ch === "[" || ch === "{") depth++;
        if (ch === ")" || ch === "]" || ch === "}") depth--;
      }

      if (depth === 0 && chars.includes(ch)) {
        break;
      }

      result += this.advance();
    }

    return result;
  }

  private readIdent(): string {
    let ident = "";
    while (this.pos < this.input.length && this.isIdentChar(this.peek())) {
      ident += this.advance();
    }
    return ident;
  }

  private readArgument(): string {
    let arg = "";
    let depth = 0;
    let inString: string | null = null;

    while (this.pos < this.input.length) {
      const ch = this.peek();

      if (inString) {
        arg += this.advance();
        if (ch === inString && this.input[this.pos - 2] !== "\\") {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        arg += this.advance();
        continue;
      }

      if (ch === "(") depth++;
      if (ch === ")") {
        if (depth === 0) break;
        depth--;
      }

      if (ch === "," && depth === 0) break;

      arg += this.advance();
    }

    return arg.trim();
  }

  private isIdentStart(ch: string): boolean {
    return (
      (ch >= "a" && ch <= "z") ||
      (ch >= "A" && ch <= "Z") ||
      ch === "_" ||
      ch === "-"
    );
  }

  private isIdentChar(ch: string): boolean {
    return this.isIdentStart(ch) || (ch >= "0" && ch <= "9");
  }

  private formatOutput(): string {
    if (this.config.minify) {
      return this.state.output.join("");
    }
    return this.state.output.join("\n\n");
  }
}

class CompilerError extends Error {
  code: ErrorCode;
  location?: SourceLocation;

  constructor(code: ErrorCode, message: string, location?: SourceLocation) {
    super(message);
    this.code = code;
    this.location = location;
    this.name = "CompilerError";
  }
}

export function compile(
  input: string,
  config?: Partial<CompilerConfig>
): string {
  const compiler = new Compiler(config);
  const result = compiler.compile(input);

  if (config?.strictMode && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.css;
}

export function compileWithDetails(
  input: string,
  config?: Partial<CompilerConfig>
): CompileResult {
  const compiler = new Compiler(config);
  return compiler.compile(input);
}

export async function compileAsync(
  input: string,
  config?: Partial<CompilerConfig>
): Promise<CompileResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = compileWithDetails(input, config);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }, 0);
  });
}

export function createCompiler(config?: Partial<CompilerConfig>) {
  const compiler = new Compiler(config);

  return {
    compile: (input: string) => compile(input, config),
    compileWithDetails: (input: string) => compiler.compile(input),
    compileAsync: (input: string) => compileAsync(input, config),
    reset: () => {},
  };
}
