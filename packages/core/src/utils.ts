import { Value, ColorValue } from "./types";

export function valueToString(value: Value): string {
  switch (value.type) {
    case "number":
      if (Number.isInteger(value.value)) {
        return `${value.value}${value.unit}`;
      }
      // Round to 6 decimal places to avoid floating point precision issues
      const rounded = Math.round(value.value * 1e6) / 1e6;
      const str = rounded.toString();
      if (str.includes("e") || str.includes("E")) {
        return `${rounded.toFixed(10).replace(/\.?0+$/, "")}${value.unit}`;
      }
      return `${rounded}${value.unit}`;

    case "string":
      return value.quoted ? `"${value.value}"` : value.value;

    case "color":
      if (value.original) {
        return value.original;
      }
      if (value.a === 1) {
        return `#${toHex(value.r)}${toHex(value.g)}${toHex(value.b)}`;
      }
      return `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;

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

function toHex(n: number): string {
  const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function parseColor(input: string): ColorValue | null {
  const trimmed = input.trim().toLowerCase();

  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/i);
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

    return { type: "color", r, g, b, a, original: input };
  }

  const rgbMatch = trimmed.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
  if (rgbMatch) {
    return {
      type: "color",
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
      original: input,
    };
  }

  const namedColors: Record<string, [number, number, number]> = {
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

  if (namedColors[trimmed]) {
    const [r, g, b] = namedColors[trimmed];
    return {
      type: "color",
      r,
      g,
      b,
      a: trimmed === "transparent" ? 0 : 1,
      original: input,
    };
  }

  return null;
}
