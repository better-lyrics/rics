import { Value, ColorValue, ColorFormat } from "./types";

// Pre-computed constants for performance
const ROUND_FACTORS = [1, 10, 100, 1000];
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const GAMMA = 2.4;
const GAMMA_INV = 1 / 2.4;

// Pre-compiled regex patterns
const OKLCH_REGEX = /^oklch\s*\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/;
const HEX_REGEX = /^#([0-9a-f]{3,8})$/i;
const RGB_REGEX = /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/;

// Named colors lookup (moved outside parseColor for performance)
const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  lime: [0, 255, 0],
  aqua: [0, 255, 255],
  teal: [0, 128, 128],
  navy: [0, 0, 128],
  fuchsia: [255, 0, 255],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
  pink: [255, 192, 203],
  brown: [165, 42, 42],
  transparent: [0, 0, 0],
};

function toHex(n: number): string {
  const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function round(n: number, decimals: number): number {
  const factor = ROUND_FACTORS[decimals];
  return Math.round(n * factor) / factor;
}

// Gamma conversion functions (moved to module level)
function toLinear(x: number): number {
  x = x / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, GAMMA);
}

function toSrgb(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 255;
  return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, GAMMA_INV) - 0.055) * 255);
}

// RGB to HSL conversion
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [h, s * 100, l * 100];
}

// RGB to oklch conversion
function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * RAD_TO_DEG;
  if (H < 0) H += 360;
  return [L, C, H];
}

function colorToString(value: ColorValue): string {
  const { r, g, b, a, format, original } = value;

  if (original) {
    return original;
  }

  switch (format) {
    case "oklch": {
      const [L, C, H] = rgbToOklch(r, g, b);
      if (a === 1) {
        return `oklch(${round(L * 100, 1)}% ${round(C, 3)} ${round(H, 3)})`;
      }
      return `oklch(${round(L * 100, 1)}% ${round(C, 3)} ${round(H, 3)} / ${round(a, 2)})`;
    }
    case "hsl": {
      const [h, s, l] = rgbToHsl(r, g, b);
      if (a === 1) {
        return `hsl(${round(h, 1)}, ${round(s, 1)}%, ${round(l, 1)}%)`;
      }
      return `hsla(${round(h, 1)}, ${round(s, 1)}%, ${round(l, 1)}%, ${round(a, 2)})`;
    }
    case "rgb":
      if (a === 1) {
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      }
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(a, 2)})`;
    case "hex":
    default:
      if (a === 1) {
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(a, 2)})`;
  }
}

export function valueToString(value: Value): string {
  switch (value.type) {
    case "number":
      if (Number.isInteger(value.value)) {
        return `${value.value}${value.unit}`;
      }
      const rounded = Math.round(value.value * 1e6) / 1e6;
      const str = rounded.toString();
      if (str.includes("e") || str.includes("E")) {
        return `${rounded.toFixed(10).replace(/\.?0+$/, "")}${value.unit}`;
      }
      return `${rounded}${value.unit}`;

    case "string":
      return value.quoted ? `"${value.value}"` : value.value;

    case "color":
      return colorToString(value);

    case "boolean":
      return value.value ? "true" : "false";

    case "list":
      return value.values.map(valueToString).join(value.separator === "," ? ", " : " ");

    case "map":
      const entries: string[] = [];
      value.entries.forEach((v, k) => {
        entries.push(`${k}: ${valueToString(v)}`);
      });
      return `(${entries.join(", ")})`;

    case "null":
      return "null";
  }
}

// Convert oklch to RGB
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = h * DEG_TO_RAD;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  return [
    toSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    toSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    toSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  ];
}

export function parseColor(input: string): ColorValue | null {
  const trimmed = input.trim().toLowerCase();

  // Check named colors first (most common case, fast lookup)
  const named = NAMED_COLORS[trimmed];
  if (named) {
    return {
      type: "color",
      r: named[0],
      g: named[1],
      b: named[2],
      a: trimmed === "transparent" ? 0 : 1,
      format: "hex",
      original: trimmed,
    };
  }

  // Hex colors (very common)
  const hexMatch = trimmed.match(HEX_REGEX);
  if (hexMatch) {
    const hex = hexMatch[1];
    let r: number, g: number, b: number, a: number = 1;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = parseInt(hex.slice(6, 8), 16) / 255;
    } else {
      return null;
    }

    return { type: "color", r, g, b, a, format: "hex" };
  }

  // RGB/RGBA
  const rgbMatch = trimmed.match(RGB_REGEX);
  if (rgbMatch) {
    return {
      type: "color",
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
      format: "rgb",
    };
  }

  // OKLCH (less common, check last)
  const oklchMatch = trimmed.match(OKLCH_REGEX);
  if (oklchMatch) {
    let l = parseFloat(oklchMatch[1]);
    if (oklchMatch[2] === "%") l = l / 100;
    const c = parseFloat(oklchMatch[3]);
    const h = parseFloat(oklchMatch[4]);
    let a = 1;
    if (oklchMatch[5]) {
      a = parseFloat(oklchMatch[5]);
      if (oklchMatch[6] === "%") a = a / 100;
    }
    const [r, g, b] = oklchToRgb(l, c, h);
    return { type: "color", r, g, b, a, format: "oklch" };
  }

  return null;
}
