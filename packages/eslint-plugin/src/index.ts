import type { Rule } from "eslint";
import { compileWithDetails } from "rics";

// Custom parser for .rics files
const parser = {
  parseForESLint(code: string) {
    // Create a minimal AST that ESLint can work with
    return {
      ast: {
        type: "Program" as const,
        body: [],
        sourceType: "module" as const,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        range: [0, code.length] as [number, number],
        comments: [],
        tokens: [],
      },
      services: { ricsSource: code },
      scopeManager: null,
      visitorKeys: {},
    };
  },
};

// Rule: no-compile-errors - Reports rics compilation errors
const noCompileErrors: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Report rics compilation errors",
    },
    messages: {
      compileError: "{{message}}",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const source = sourceCode.getText();

    const result = compileWithDetails(source, { timeout: 5000 });

    for (const error of result.errors) {
      const loc = error.start
        ? { line: error.start.line, column: error.start.column }
        : { line: 1, column: 0 };

      context.report({
        loc,
        messageId: "compileError",
        data: { message: error.message },
      });
    }

    return {};
  },
};

// Rule: no-compile-warnings - Reports rics compilation warnings
const noCompileWarnings: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Report rics compilation warnings",
    },
    messages: {
      compileWarning: "{{message}}",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const source = sourceCode.getText();

    const result = compileWithDetails(source, { timeout: 5000 });

    for (const warning of result.warnings) {
      const loc = warning.start
        ? { line: warning.start.line, column: warning.start.column }
        : { line: 1, column: 0 };

      context.report({
        loc,
        messageId: "compileWarning",
        data: { message: warning.message },
      });
    }

    return {};
  },
};

// Rule: max-nesting-depth - Limits nesting depth
const maxNestingDepth: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Limit nesting depth in rics files",
    },
    messages: {
      tooDeep: "Nesting depth exceeds {{max}} levels",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "number", default: 4 },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const source = sourceCode.getText();
    const options = context.options[0] || {};
    const maxDepth = options.max ?? 4;

    let currentDepth = 0;
    let maxFound = 0;
    let deepestLine = 1;

    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === "{") {
          currentDepth++;
          if (currentDepth > maxFound) {
            maxFound = currentDepth;
            deepestLine = i + 1;
          }
        } else if (char === "}") {
          currentDepth = Math.max(0, currentDepth - 1);
        }
      }
    }

    if (maxFound > maxDepth) {
      context.report({
        loc: { line: deepestLine, column: 0 },
        messageId: "tooDeep",
        data: { max: String(maxDepth) },
      });
    }

    return {};
  },
};

// Configs
const configs = {
  recommended: {
    files: ["**/*.rics"],
    languageOptions: {
      parser,
    },
    plugins: {} as Record<string, unknown>,
    rules: {
      "rics/no-compile-errors": "error" as const,
      "rics/no-compile-warnings": "warn" as const,
    },
  },
};

// Plugin export
const plugin = {
  meta: {
    name: "eslint-plugin-rics",
    version: "0.1.0",
  },
  configs,
  rules: {
    "no-compile-errors": noCompileErrors,
    "no-compile-warnings": noCompileWarnings,
    "max-nesting-depth": maxNestingDepth,
  },
  processors: {},
  parser,
};

export default plugin;
export { configs, parser };
export const rules = plugin.rules;
