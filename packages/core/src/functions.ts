import { Value, ColorValue } from "./types";
import { valueToString, parseColor } from "./utils";

type BuiltinFunction = (args: Value[]) => Value | string;

function ensureNumber(val: Value, fallback = 0): number {
  if (val.type === "number") return val.value;
  if (val.type === "string") {
    const n = parseFloat(val.value);
    return isNaN(n) ? fallback : n;
  }
  return fallback;
}

function ensureColor(val: Value): ColorValue | null {
  if (val.type === "color") return val;
  if (val.type === "string") {
    return parseColor(val.value);
  }
  return null;
}

function ensureString(val: Value): string {
  return valueToString(val).replace(/^["']|["']$/g, "");
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return [h, s * 100, l * 100];
}

function adjustLightness(color: ColorValue, amount: number, darken = false): ColorValue {
  const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
  const newL = darken ? Math.max(0, l - amount) : Math.min(100, l + amount);
  const [r, g, b] = hslToRgb(h, s, newL);
  return { type: "color", r, g, b, a: color.a, format: color.format };
}

function adjustSaturation(color: ColorValue, amount: number, desaturate = false): ColorValue {
  const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
  const newS = desaturate ? Math.max(0, s - amount) : Math.min(100, s + amount);
  const [r, g, b] = hslToRgb(h, newS, l);
  return { type: "color", r, g, b, a: color.a, format: color.format };
}

export const builtinFunctions: Record<string, BuiltinFunction> = {
  lighten(args) {
    const color = ensureColor(args[0]);
    const amount = ensureNumber(args[1], 10);
    if (!color) return args[0];
    return adjustLightness(color, amount);
  },

  darken(args) {
    const color = ensureColor(args[0]);
    const amount = ensureNumber(args[1], 10);
    if (!color) return args[0];
    return adjustLightness(color, amount, true);
  },

  saturate(args) {
    const color = ensureColor(args[0]);
    const amount = ensureNumber(args[1], 10);
    if (!color) return args[0];
    return adjustSaturation(color, amount);
  },

  desaturate(args) {
    const color = ensureColor(args[0]);
    const amount = ensureNumber(args[1], 10);
    if (!color) return args[0];
    return adjustSaturation(color, amount, true);
  },

  "adjust-hue"(args) {
    const color = ensureColor(args[0]);
    const degrees = ensureNumber(args[1], 0);
    if (!color) return args[0];
    const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
    const [r, g, b] = hslToRgb(h + degrees, s, l);
    return { type: "color", r, g, b, a: color.a, format: color.format };
  },

  rgba(args) {
    if (args.length === 2) {
      const color = ensureColor(args[0]);
      const alpha = ensureNumber(args[1], 1);
      if (!color) return args[0];
      return { type: "color", r: color.r, g: color.g, b: color.b, a: alpha, format: color.format };
    }
    const r = Math.round(ensureNumber(args[0], 0));
    const g = Math.round(ensureNumber(args[1], 0));
    const b = Math.round(ensureNumber(args[2], 0));
    const a = args[3] ? ensureNumber(args[3], 1) : 1;
    return { type: "color", r, g, b, a, format: "rgb" as const };
  },

  rgb(args) {
    const r = Math.round(ensureNumber(args[0], 0));
    const g = Math.round(ensureNumber(args[1], 0));
    const b = Math.round(ensureNumber(args[2], 0));
    return { type: "color", r, g, b, a: 1, format: "rgb" as const };
  },

  hsl(args) {
    const h = ensureNumber(args[0], 0);
    const s = ensureNumber(args[1], 0);
    const l = ensureNumber(args[2], 0);
    const [r, g, b] = hslToRgb(h, s, l);
    return { type: "color", r, g, b, a: 1, format: "hsl" as const };
  },

  hsla(args) {
    const h = ensureNumber(args[0], 0);
    const s = ensureNumber(args[1], 0);
    const l = ensureNumber(args[2], 0);
    const a = args[3] ? ensureNumber(args[3], 1) : 1;
    const [r, g, b] = hslToRgb(h, s, l);
    return { type: "color", r, g, b, a, format: "hsl" as const };
  },

  mix(args) {
    const color1 = ensureColor(args[0]);
    const color2 = ensureColor(args[1]);
    const weight = args[2] ? ensureNumber(args[2], 50) / 100 : 0.5;
    if (!color1 || !color2) return args[0];

    const w = weight * 2 - 1;
    const a = color1.a - color2.a;
    const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
    const w2 = 1 - w1;

    return {
      type: "color",
      r: Math.round(color1.r * w1 + color2.r * w2),
      g: Math.round(color1.g * w1 + color2.g * w2),
      b: Math.round(color1.b * w1 + color2.b * w2),
      a: color1.a * weight + color2.a * (1 - weight),
      format: color1.format,
    };
  },

  red(args) {
    const color = ensureColor(args[0]);
    return { type: "number", value: color?.r ?? 0, unit: "" };
  },

  green(args) {
    const color = ensureColor(args[0]);
    return { type: "number", value: color?.g ?? 0, unit: "" };
  },

  blue(args) {
    const color = ensureColor(args[0]);
    return { type: "number", value: color?.b ?? 0, unit: "" };
  },

  alpha(args) {
    const color = ensureColor(args[0]);
    return { type: "number", value: color?.a ?? 1, unit: "" };
  },

  opacity(args) {
    const color = ensureColor(args[0]);
    return { type: "number", value: color?.a ?? 1, unit: "" };
  },

  hue(args) {
    const color = ensureColor(args[0]);
    if (!color) return { type: "number", value: 0, unit: "deg" };
    const [h] = rgbToHsl(color.r, color.g, color.b);
    return { type: "number", value: h, unit: "deg" };
  },

  saturation(args) {
    const color = ensureColor(args[0]);
    if (!color) return { type: "number", value: 0, unit: "%" };
    const [, s] = rgbToHsl(color.r, color.g, color.b);
    return { type: "number", value: s, unit: "%" };
  },

  lightness(args) {
    const color = ensureColor(args[0]);
    if (!color) return { type: "number", value: 0, unit: "%" };
    const [, , l] = rgbToHsl(color.r, color.g, color.b);
    return { type: "number", value: l, unit: "%" };
  },

  complement(args) {
    const color = ensureColor(args[0]);
    if (!color) return args[0];
    const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
    const [r, g, b] = hslToRgb(h + 180, s, l);
    return { type: "color", r, g, b, a: color.a, format: color.format };
  },

  invert(args) {
    const color = ensureColor(args[0]);
    if (!color) return args[0];
    return {
      type: "color",
      r: 255 - color.r,
      g: 255 - color.g,
      b: 255 - color.b,
      a: color.a,
      format: color.format,
    };
  },

  grayscale(args) {
    const color = ensureColor(args[0]);
    if (!color) return args[0];
    return adjustSaturation(color, 100, true);
  },

  percentage(args) {
    const n = ensureNumber(args[0], 0);
    return { type: "number", value: n * 100, unit: "%" };
  },

  round(args) {
    const n = ensureNumber(args[0], 0);
    const unit = args[0].type === "number" ? args[0].unit : "";
    return { type: "number", value: Math.round(n), unit };
  },

  ceil(args) {
    const n = ensureNumber(args[0], 0);
    const unit = args[0].type === "number" ? args[0].unit : "";
    return { type: "number", value: Math.ceil(n), unit };
  },

  floor(args) {
    const n = ensureNumber(args[0], 0);
    const unit = args[0].type === "number" ? args[0].unit : "";
    return { type: "number", value: Math.floor(n), unit };
  },

  abs(args) {
    const n = ensureNumber(args[0], 0);
    const unit = args[0].type === "number" ? args[0].unit : "";
    return { type: "number", value: Math.abs(n), unit };
  },

  min(args) {
    const numbers = args.map((a) => ensureNumber(a, Infinity));
    const minIdx = numbers.indexOf(Math.min(...numbers));
    const unit = args[minIdx]?.type === "number" ? args[minIdx].unit : "";
    return { type: "number", value: Math.min(...numbers), unit };
  },

  max(args) {
    const numbers = args.map((a) => ensureNumber(a, -Infinity));
    const maxIdx = numbers.indexOf(Math.max(...numbers));
    const unit = args[maxIdx]?.type === "number" ? args[maxIdx].unit : "";
    return { type: "number", value: Math.max(...numbers), unit };
  },

  random(args) {
    const limit = args.length > 0 ? ensureNumber(args[0], 1) : 1;
    if (limit <= 1) {
      return { type: "number", value: Math.random(), unit: "" };
    }
    return { type: "number", value: Math.floor(Math.random() * limit) + 1, unit: "" };
  },

  "unit"(args) {
    if (args[0].type === "number") {
      return { type: "string", value: args[0].unit, quoted: true };
    }
    return { type: "string", value: "", quoted: true };
  },

  unitless(args) {
    if (args[0].type === "number") {
      return { type: "boolean", value: args[0].unit === "" };
    }
    return { type: "boolean", value: true };
  },

  "str-length"(args) {
    const str = ensureString(args[0]);
    return { type: "number", value: str.length, unit: "" };
  },

  "str-slice"(args) {
    const str = ensureString(args[0]);
    const start = Math.floor(ensureNumber(args[1], 1)) - 1;
    const end = args[2] ? Math.floor(ensureNumber(args[2], str.length)) : str.length;
    return { type: "string", value: str.slice(start, end), quoted: false };
  },

  "str-index"(args) {
    const str = ensureString(args[0]);
    const substr = ensureString(args[1]);
    const idx = str.indexOf(substr);
    return { type: "number", value: idx === -1 ? 0 : idx + 1, unit: "" };
  },

  "str-insert"(args) {
    const str = ensureString(args[0]);
    const insert = ensureString(args[1]);
    const idx = Math.floor(ensureNumber(args[2], 1)) - 1;
    return {
      type: "string",
      value: str.slice(0, idx) + insert + str.slice(idx),
      quoted: false,
    };
  },

  "to-upper-case"(args) {
    const str = ensureString(args[0]);
    return { type: "string", value: str.toUpperCase(), quoted: false };
  },

  "to-lower-case"(args) {
    const str = ensureString(args[0]);
    return { type: "string", value: str.toLowerCase(), quoted: false };
  },

  quote(args) {
    const str = ensureString(args[0]);
    return { type: "string", value: str, quoted: true };
  },

  unquote(args) {
    const str = ensureString(args[0]);
    return { type: "string", value: str, quoted: false };
  },

  length(args) {
    const val = args[0];
    if (val.type === "list") {
      return { type: "number", value: val.values.length, unit: "" };
    }
    if (val.type === "map") {
      return { type: "number", value: val.entries.size, unit: "" };
    }
    return { type: "number", value: 1, unit: "" };
  },

  nth(args) {
    const list = args[0];
    let n = Math.floor(ensureNumber(args[1], 1));
    if (list.type === "list") {
      // Support negative indices: -1 = last, -2 = second-to-last, etc.
      if (n < 0) n = list.values.length + n + 1;
      if (n >= 1 && n <= list.values.length) {
        return list.values[n - 1];
      }
    }
    return { type: "null" };
  },

  join(args) {
    const list1 = args[0];
    const list2 = args[1];
    const separator = args[2] ? ensureString(args[2]) : ",";

    const values1 = list1.type === "list" ? list1.values : [list1];
    const values2 = list2.type === "list" ? list2.values : [list2];

    return {
      type: "list",
      values: [...values1, ...values2],
      separator: separator === " " ? " " : ",",
    };
  },

  append(args) {
    const list = args[0];
    const val = args[1];
    const separator = args[2] ? ensureString(args[2]) : ",";

    const values = list.type === "list" ? [...list.values] : [list];
    values.push(val);

    return {
      type: "list",
      values,
      separator: separator === " " ? " " : ",",
    };
  },

  index(args) {
    const list = args[0];
    const val = args[1];

    if (list.type !== "list") {
      return { type: "null" };
    }

    const valStr = valueToString(val);
    const idx = list.values.findIndex((v) => valueToString(v) === valStr);
    return { type: "number", value: idx === -1 ? 0 : idx + 1, unit: "" };
  },

  "map-get"(args) {
    const map = args[0];
    const key = ensureString(args[1]);

    if (map.type === "map") {
      return map.entries.get(key) || { type: "null" };
    }
    return { type: "null" };
  },

  "map-keys"(args) {
    const map = args[0];
    if (map.type === "map") {
      const keys: Value[] = [];
      map.entries.forEach((_, k) => {
        keys.push({ type: "string", value: k, quoted: false });
      });
      return { type: "list", values: keys, separator: "," };
    }
    return { type: "list", values: [], separator: "," };
  },

  "map-values"(args) {
    const map = args[0];
    if (map.type === "map") {
      const values: Value[] = [];
      map.entries.forEach((v) => {
        values.push(v);
      });
      return { type: "list", values, separator: "," };
    }
    return { type: "list", values: [], separator: "," };
  },

  "map-has-key"(args) {
    const map = args[0];
    const key = ensureString(args[1]);
    if (map.type === "map") {
      return { type: "boolean", value: map.entries.has(key) };
    }
    return { type: "boolean", value: false };
  },

  "type-of"(args) {
    return { type: "string", value: args[0].type, quoted: false };
  },

  inspect(args) {
    return { type: "string", value: valueToString(args[0]), quoted: true };
  },

  "if"(args) {
    const condition = args[0];
    const trueVal = args[1];
    const falseVal = args[2] || { type: "null" as const };

    const isTruthy =
      condition.type === "boolean"
        ? condition.value
        : condition.type !== "null";

    return isTruthy ? trueVal : falseVal;
  },
};
