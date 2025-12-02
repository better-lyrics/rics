import {
  Value,
  NumberValue,
  StringValue,
  ColorValue,
  BooleanValue,
  ListValue,
  MapValue,
  Scope,
  ErrorCode,
  CompileError,
} from "./types";
import { builtinFunctions } from "./functions";
export { valueToString, parseColor } from "./utils";
import { valueToString, parseColor } from "./utils";

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  px: { px: 1, em: 16, rem: 16, pt: 0.75, pc: 9, in: 96, cm: 37.8, mm: 3.78 },
  em: { px: 1 / 16, em: 1, rem: 1 },
  rem: { px: 1 / 16, rem: 1, em: 1 },
  pt: { px: 4 / 3, pt: 1 },
  pc: { px: 1 / 9, pc: 1 },
  in: { px: 1 / 96, in: 1, cm: 2.54, mm: 25.4 },
  cm: { px: 1 / 37.8, cm: 1, mm: 10, in: 1 / 2.54 },
  mm: { px: 1 / 3.78, mm: 1, cm: 0.1 },
  "%": { "%": 1 },
  deg: { deg: 1, rad: Math.PI / 180, turn: 1 / 360, grad: 0.9 },
  rad: { rad: 1, deg: 180 / Math.PI, turn: 1 / (2 * Math.PI) },
  turn: { turn: 1, deg: 360, rad: 2 * Math.PI },
  s: { s: 1, ms: 1000 },
  ms: { ms: 1, s: 0.001 },
};

export function createScope(parent: Scope | null = null): Scope {
  return { variables: new Map(), parent };
}

export function lookupVariable(scope: Scope, name: string): Value | undefined {
  const normalizedName = name.startsWith("$") ? name : `$${name}`;
  let current: Scope | null = scope;
  while (current) {
    if (current.variables.has(normalizedName)) {
      return current.variables.get(normalizedName);
    }
    current = current.parent;
  }
  return undefined;
}

export function setVariable(scope: Scope, name: string, value: Value): void {
  const normalizedName = name.startsWith("$") ? name : `$${name}`;

  // SCSS behavior: update variable in the scope where it's defined, not create new
  let current: Scope | null = scope;
  while (current) {
    if (current.variables.has(normalizedName)) {
      current.variables.set(normalizedName, value);
      return;
    }
    current = current.parent;
  }

  // Variable doesn't exist in any parent scope, create in current scope
  scope.variables.set(normalizedName, value);
}

function hasTopLevelComma(input: string): boolean {
  let depth = 0;
  let inString: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (ch === inString && input[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      continue;
    }

    if (depth === 0 && ch === ",") {
      return true;
    }
  }

  return false;
}

export function parseValue(input: string): Value {
  const trimmed = input.trim();

  if (trimmed === "" || trimmed === "null") {
    return { type: "null" };
  }

  if (trimmed === "true") {
    return { type: "boolean", value: true };
  }

  if (trimmed === "false") {
    return { type: "boolean", value: false };
  }

  const colorMatch = parseColor(trimmed);
  if (colorMatch) {
    return colorMatch;
  }

  const numberMatch = trimmed.match(/^(-?\d*\.?\d+(?:e[+-]?\d+)?)([\w%]*)$/i);
  if (numberMatch) {
    return {
      type: "number",
      value: parseFloat(numberMatch[1]),
      unit: numberMatch[2] || "",
    };
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return {
      type: "string",
      value: trimmed.slice(1, -1),
      quoted: true,
    };
  }

  // Check for list or map in parentheses
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(1, -1).trim();
    // Check if it's a map (has key: value pairs)
    if (inner.includes(":") && !inner.startsWith(":")) {
      return parseMap(trimmed);
    }
    // Otherwise treat as list
    return parseList(trimmed);
  }

  // Handle comma-separated lists without parentheses
  if (hasTopLevelComma(trimmed)) {
    return parseList(trimmed);
  }

  return {
    type: "string",
    value: trimmed,
    quoted: false,
  };
}

export function isTruthy(value: Value): boolean {
  switch (value.type) {
    case "null":
      return false;
    case "boolean":
      return value.value;
    case "string":
      return value.value !== "";
    case "number":
      return value.value !== 0;
    case "list":
      return value.values.length > 0;
    case "map":
      return value.entries.size > 0;
    case "color":
      return true;
  }
}

export function compareValues(left: Value, right: Value, operator: string): boolean {
  if (operator === "==" || operator === "!=") {
    const equal = valuesEqual(left, right);
    return operator === "==" ? equal : !equal;
  }

  if (left.type === "number" && right.type === "number") {
    const leftVal = left.value;
    const rightVal = convertUnit(right.value, right.unit, left.unit) ?? right.value;

    switch (operator) {
      case "<":
        return leftVal < rightVal;
      case ">":
        return leftVal > rightVal;
      case "<=":
        return leftVal <= rightVal;
      case ">=":
        return leftVal >= rightVal;
    }
  }

  if (left.type === "string" && right.type === "string") {
    switch (operator) {
      case "<":
        return left.value < right.value;
      case ">":
        return left.value > right.value;
      case "<=":
        return left.value <= right.value;
      case ">=":
        return left.value >= right.value;
    }
  }

  return false;
}

function valuesEqual(left: Value, right: Value): boolean {
  if (left.type !== right.type) {
    return false;
  }

  switch (left.type) {
    case "number":
      return left.value === (right as NumberValue).value && left.unit === (right as NumberValue).unit;
    case "string":
      return left.value === (right as StringValue).value;
    case "boolean":
      return left.value === (right as BooleanValue).value;
    case "color":
      const rc = right as ColorValue;
      return left.r === rc.r && left.g === rc.g && left.b === rc.b && left.a === rc.a;
    case "null":
      return true;
    case "list":
      const rl = right as ListValue;
      if (left.values.length !== rl.values.length) return false;
      return left.values.every((v, i) => valuesEqual(v, rl.values[i]));
    case "map":
      const rm = right as MapValue;
      if (left.entries.size !== rm.entries.size) return false;
      for (const [k, v] of left.entries) {
        const rv = rm.entries.get(k);
        if (!rv || !valuesEqual(v, rv)) return false;
      }
      return true;
  }
}

// Helper to get raw string value without quotes for concatenation
function rawStringValue(v: Value): string {
  if (v.type === "string") {
    return v.value;
  }
  return valueToString(v);
}

export function performMath(
  left: Value,
  right: Value,
  operator: string
): Value | { error: ErrorCode; message: string } {
  if (operator === "+") {
    if (left.type === "string" || right.type === "string") {
      return {
        type: "string",
        value: rawStringValue(left) + rawStringValue(right),
        quoted: false,
      };
    }
  }

  if (left.type === "number" && right.type === "number") {
    let rightVal = right.value;
    let resultUnit = left.unit || right.unit;

    if (left.unit && right.unit && left.unit !== right.unit) {
      const converted = convertUnit(right.value, right.unit, left.unit);
      if (converted !== null) {
        rightVal = converted;
        resultUnit = left.unit;
      } else {
        resultUnit = left.unit;
      }
    }

    let result: number;
    switch (operator) {
      case "+":
        result = left.value + rightVal;
        break;
      case "-":
        result = left.value - rightVal;
        break;
      case "*":
        result = left.value * rightVal;
        if (left.unit && right.unit) {
          resultUnit = left.unit;
        }
        break;
      case "/":
        if (rightVal === 0) {
          return { error: ErrorCode.DIVISION_BY_ZERO, message: "Division by zero" };
        }
        result = left.value / rightVal;
        if (left.unit === right.unit) {
          resultUnit = "";
        }
        break;
      case "%":
        if (rightVal === 0) {
          return { error: ErrorCode.DIVISION_BY_ZERO, message: "Modulo by zero" };
        }
        result = left.value % rightVal;
        break;
      default:
        return { error: ErrorCode.TYPE_ERROR, message: `Unknown operator: ${operator}` };
    }

    return { type: "number", value: result, unit: resultUnit };
  }

  if (left.type === "color" && right.type === "number" && operator === "*") {
    return {
      type: "color",
      r: Math.round(left.r * right.value),
      g: Math.round(left.g * right.value),
      b: Math.round(left.b * right.value),
      a: left.a,
    };
  }

  return {
    error: ErrorCode.TYPE_ERROR,
    message: `Cannot perform ${operator} on ${left.type} and ${right.type}`,
  };
}

function convertUnit(value: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return value;
  if (!fromUnit || !toUnit) return value;

  const conversions = UNIT_CONVERSIONS[fromUnit];
  if (conversions && conversions[toUnit] !== undefined) {
    return value * conversions[toUnit];
  }

  return null;
}

export function parseList(input: string): ListValue {
  const trimmed = input.trim();

  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(1, -1).trim();
    return parseListInner(inner);
  }

  return parseListInner(trimmed);
}

function parseListInner(input: string): ListValue {
  const hasComma = input.includes(",");
  const separator = hasComma ? "," : " ";
  const items = splitList(input, separator);

  return {
    type: "list",
    values: items.map((item) => parseValue(item.trim())),
    separator,
  };
}

export function parseMap(input: string): MapValue {
  const trimmed = input.trim();

  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) {
    return { type: "map", entries: new Map() };
  }

  const inner = trimmed.slice(1, -1).trim();
  const entries = new Map<string, Value>();

  const pairs = splitList(inner, ",");
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) continue;

    const key = pair.slice(0, colonIdx).trim();
    const value = pair.slice(colonIdx + 1).trim();
    entries.set(key, parseValue(value));
  }

  return { type: "map", entries };
}

function splitList(input: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let inString: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      current += ch;
      if (ch === inString && input[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      current += ch;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      current += ch;
      continue;
    }

    if (depth === 0 && ch === separator[0]) {
      if (separator === " " && current.trim()) {
        result.push(current);
        current = "";
      } else if (separator === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
      continue;
    }

    current += ch;
  }

  if (current.trim()) {
    result.push(current);
  }

  return result;
}

export interface ExpressionEvaluator {
  evaluate(
    expr: string,
    scope: Scope,
    customFunctions?: Map<string, (...args: Value[]) => Value | string>
  ): Value;
  evaluateCondition(expr: string, scope: Scope): boolean;
}

export function createExpressionEvaluator(
  onError: (error: CompileError) => void
): ExpressionEvaluator {
  function evaluate(
    expr: string,
    scope: Scope,
    customFunctions?: Map<string, (...args: Value[]) => Value | string>
  ): Value {
    const trimmed = expr.trim();

    if (!trimmed) {
      return { type: "null" };
    }

    if (trimmed.startsWith("$")) {
      const varName = trimmed.split(/[^$\w-]/)[0];
      const value = lookupVariable(scope, varName);
      if (!value) {
        onError({
          type: "error",
          code: ErrorCode.UNDEFINED_VARIABLE,
          message: `Undefined variable: ${varName}`,
        });
        return { type: "string", value: trimmed, quoted: false };
      }
      if (varName === trimmed) {
        return value;
      }
      // Don't substitute value into expression - let operator parsing handle it
      // This avoids O(n²) when concatenating long strings repeatedly
      // Fall through to operator parsing below
    }

    const functionMatch = trimmed.match(/^([\w-]+)\s*\(/);
    if (functionMatch) {
      const funcName = functionMatch[1];
      const argsStart = funcName.length;
      const argsEnd = findMatchingParen(trimmed, argsStart);
      if (argsEnd !== -1) {
        const argsStr = trimmed.slice(argsStart + 1, argsEnd);
        const args = parseArguments(argsStr, scope, customFunctions);

        if (customFunctions?.has(funcName)) {
          const result = customFunctions.get(funcName)!(...args);
          if (typeof result === "string") {
            return parseValue(result);
          }
          return result;
        }

        if (builtinFunctions[funcName]) {
          const result = builtinFunctions[funcName](args);
          if (typeof result === "string") {
            return parseValue(result);
          }
          return result;
        }

        return { type: "string", value: trimmed, quoted: false };
      }
    }

    const orParts = splitByOperator(trimmed, " or ");
    if (orParts.length > 1) {
      for (const part of orParts) {
        const val = evaluate(part, scope, customFunctions);
        if (isTruthy(val)) {
          return { type: "boolean", value: true };
        }
      }
      return { type: "boolean", value: false };
    }

    const andParts = splitByOperator(trimmed, " and ");
    if (andParts.length > 1) {
      for (const part of andParts) {
        const val = evaluate(part, scope, customFunctions);
        if (!isTruthy(val)) {
          return { type: "boolean", value: false };
        }
      }
      return { type: "boolean", value: true };
    }

    for (const op of ["==", "!=", ">=", "<=", ">", "<"]) {
      const parts = splitByOperator(trimmed, op);
      if (parts.length === 2) {
        const left = evaluate(parts[0], scope, customFunctions);
        const right = evaluate(parts[1], scope, customFunctions);
        return { type: "boolean", value: compareValues(left, right, op) };
      }
    }

    if (trimmed.startsWith("not ") || trimmed.startsWith("not(")) {
      const inner = trimmed.startsWith("not(")
        ? trimmed.slice(4)
        : trimmed.slice(4);
      const val = evaluate(inner, scope, customFunctions);
      return { type: "boolean", value: !isTruthy(val) };
    }

    const addSubResult = evaluateAddSub(trimmed, scope, customFunctions);
    if (addSubResult) return addSubResult;

    return parseValue(trimmed);
  }

  function evaluateAddSub(
    expr: string,
    scope: Scope,
    customFunctions?: Map<string, (...args: Value[]) => Value | string>
  ): Value | null {
    let depth = 0;
    let inString: string | null = null;

    for (let i = expr.length - 1; i >= 0; i--) {
      const ch = expr[i];

      if (inString) {
        if (ch === inString && expr[i - 1] !== "\\") {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }

      if (ch === ")" || ch === "]" || ch === "}") {
        depth++;
        continue;
      }

      if (ch === "(" || ch === "[" || ch === "{") {
        depth--;
        continue;
      }

      if (depth === 0 && (ch === "+" || ch === "-")) {
        if (i === 0) continue;
        const prev = expr[i - 1];
        if (prev === "e" || prev === "E") continue;

        // For subtraction, require whitespace before the operator to distinguish
        // from hyphenated identifiers like "row-reverse" or "flex-start"
        if (ch === "-") {
          // Check if this is a hyphenated identifier vs actual subtraction
          // Subtraction requires whitespace: "a - b" not "a-b"
          const prevIsWhitespace = /\s/.test(prev);
          const prevIsOperatorEnd = prev === ")" || prev === "]" || prev === "}";
          if (!prevIsWhitespace && !prevIsOperatorEnd) {
            continue; // This is part of an identifier, not subtraction
          }

          // Also check if this is a vendor prefix like -apple-system, -webkit-*, -moz-*
          // These start with - followed by a letter
          const next = expr[i + 1];
          if (next && /[a-zA-Z]/.test(next)) {
            continue; // This is a vendor prefix, not subtraction
          }
        }

        const left = expr.slice(0, i).trim();
        const right = expr.slice(i + 1).trim();

        if (left && right) {
          const leftVal = evaluate(left, scope, customFunctions);
          const rightVal = evaluate(right, scope, customFunctions);
          const result = performMath(leftVal, rightVal, ch);

          if ("error" in result) {
            onError({
              type: "error",
              code: result.error,
              message: result.message,
            });
            return { type: "null" };
          }

          return result;
        }
      }
    }

    return evaluateMulDiv(expr, scope, customFunctions);
  }

  function evaluateMulDiv(
    expr: string,
    scope: Scope,
    customFunctions?: Map<string, (...args: Value[]) => Value | string>
  ): Value | null {
    let depth = 0;
    let inString: string | null = null;

    for (let i = expr.length - 1; i >= 0; i--) {
      const ch = expr[i];

      if (inString) {
        if (ch === inString && expr[i - 1] !== "\\") {
          inString = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }

      if (ch === ")" || ch === "]" || ch === "}") {
        depth++;
        continue;
      }

      if (ch === "(" || ch === "[" || ch === "{") {
        depth--;
        continue;
      }

      if (depth === 0 && (ch === "*" || ch === "/" || ch === "%")) {
        const left = expr.slice(0, i).trim();
        const right = expr.slice(i + 1).trim();

        if (left && right) {
          const leftVal = evaluate(left, scope, customFunctions);
          const rightVal = evaluate(right, scope, customFunctions);
          const result = performMath(leftVal, rightVal, ch);

          if ("error" in result) {
            onError({
              type: "error",
              code: result.error,
              message: result.message,
            });
            return { type: "null" };
          }

          return result;
        }
      }
    }

    if (expr.startsWith("(") && expr.endsWith(")")) {
      const inner = expr.slice(1, -1).trim();
      // Check if this is a list or map (contains comma but no math operators at top level)
      if (inner.includes(",") || (inner.includes(":") && !inner.startsWith(":"))) {
        // Parse as list or map
        return parseValue(expr);
      }
      // Otherwise treat as grouping parentheses
      return evaluate(inner, scope, customFunctions);
    }

    return null;
  }

  function evaluateCondition(expr: string, scope: Scope): boolean {
    const result = evaluate(expr, scope);
    return isTruthy(result);
  }

  function parseArguments(
    argsStr: string,
    scope: Scope,
    customFunctions?: Map<string, (...args: Value[]) => Value | string>
  ): Value[] {
    const args: Value[] = [];
    const parts = splitList(argsStr, ",");

    for (const part of parts) {
      args.push(evaluate(part.trim(), scope, customFunctions));
    }

    return args;
  }

  return { evaluate, evaluateCondition };
}

function findMatchingParen(str: string, start: number): number {
  let depth = 0;
  let inString: string | null = null;

  for (let i = start; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (ch === inString && str[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }

    if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function splitByOperator(expr: string, operator: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let inString: string | null = null;
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (inString) {
      current += ch;
      if (ch === inString && expr[i - 1] !== "\\") {
        inString = null;
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = ch;
      current += ch;
      i++;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      current += ch;
      i++;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      current += ch;
      i++;
      continue;
    }

    if (depth === 0 && expr.slice(i, i + operator.length) === operator) {
      result.push(current);
      current = "";
      i += operator.length;
      continue;
    }

    current += ch;
    i++;
  }

  if (current) {
    result.push(current);
  }

  return result;
}
