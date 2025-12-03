import { Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";

export interface ColorHighlighterConfig {
  /**
   * CSS class for the color preview container
   * @default "cm-color-preview"
   */
  className?: string;
  /**
   * CSS class for light backgrounds (dark text)
   * @default "cm-color-preview-light"
   */
  lightClassName?: string;
  /**
   * CSS class for dark backgrounds (light text)
   * @default "cm-color-preview-dark"
   */
  darkClassName?: string;
  /**
   * Luminance threshold for switching between light/dark text (0-1)
   * @default 0.35
   */
  luminanceThreshold?: number;
}

// Check if a color function contains only valid literal values (no variables)
function hasValidColorArgs(str: string): boolean {
  // Extract content inside parentheses
  const match = str.match(/\(([^)]*)\)/);
  if (!match) return false;

  const args = match[1];

  // Reject if contains preprocessor variables ($var), CSS variables (var()),
  // or rics interpolation (#{})
  if (/\$\w|var\s*\(|#\{/.test(args)) {
    return false;
  }

  // For color() function, allow color space identifiers
  if (str.startsWith("color(") || str.startsWith("color ")) {
    return /^[a-z-]+\s+[\d.\s%/,-]+$/i.test(args);
  }

  // For all color functions, allow: numbers, dots, %, deg, commas, spaces, forward slash, minus
  // This covers rgb, hsl, hwb, lab, lch, oklch, oklab with various syntaxes
  return /^[\d.\s%,/deg+-]+$/i.test(args);
}

// Parse color string to valid CSS color
function parseColorValue(colorStr: string): string | null {
  const str = colorStr.trim();

  // Hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(str)) {
    return str;
  }

  // Functional color notations - validate arguments are literal values
  if (/^(rgba?|hsla?|hwb|lab|lch|oklch|oklab|color)\s*\(/i.test(str)) {
    return hasValidColorArgs(str) ? str : null;
  }

  return null;
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Calculate relative luminance (WCAG formula)
function calculateLuminance(r: number, g: number, b: number): number {
  const sRGB = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

// Get luminance from any supported color format
function getLuminance(color: string): number {
  // Hex colors
  const hexMatch = color.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return calculateLuminance(r, g, b);
  }

  // rgb/rgba
  const rgbMatch = color.match(
    /rgba?\s*\(\s*([\d.]+)(%?)\s*[,\s]\s*([\d.]+)(%?)\s*[,\s]\s*([\d.]+)(%?)/i
  );
  if (rgbMatch) {
    let r = parseFloat(rgbMatch[1]);
    let g = parseFloat(rgbMatch[3]);
    let b = parseFloat(rgbMatch[5]);
    if (rgbMatch[2] === "%") r = r * 2.55;
    if (rgbMatch[4] === "%") g = g * 2.55;
    if (rgbMatch[6] === "%") b = b * 2.55;
    return calculateLuminance(r, g, b);
  }

  // hsl/hsla
  const hslMatch = color.match(
    /hsla?\s*\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%/i
  );
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    const [r, g, b] = hslToRgb(h, s, l);
    return calculateLuminance(r, g, b);
  }

  // hwb
  const hwbMatch = color.match(
    /hwb\s*\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%/i
  );
  if (hwbMatch) {
    const h = parseFloat(hwbMatch[1]);
    const w = parseFloat(hwbMatch[2]) / 100;
    const bl = parseFloat(hwbMatch[3]) / 100;
    const [r1, g1, b1] = hslToRgb(h, 100, 50);
    const r = (r1 / 255) * (1 - w - bl) + w;
    const g = (g1 / 255) * (1 - w - bl) + w;
    const b = (b1 / 255) * (1 - w - bl) + w;
    return calculateLuminance(r * 255, g * 255, b * 255);
  }

  // oklch/oklab/lch/lab - use lightness directly
  const lightMatch = color.match(
    /(?:oklch|oklab|lch|lab)\s*\(\s*([\d.]+)(%?)/i
  );
  if (lightMatch) {
    let l = parseFloat(lightMatch[1]);
    if (lightMatch[2] === "%") l = l / 100;
    else if (l > 1) l = l / 100;
    return l;
  }

  return 0.5;
}

/**
 * Creates a color highlighter extension for CodeMirror.
 * Highlights color values (hex, rgb, hsl, etc.) with their actual color as background.
 */
export function colorHighlighter(config: ColorHighlighterConfig = {}) {
  const {
    className = "cm-color-preview",
    lightClassName = "cm-color-preview-light",
    darkClassName = "cm-color-preview-dark",
    luminanceThreshold = 0.35,
  } = config;

  // Color patterns - use negative lookbehind to prevent lab/lch matching inside oklab/oklch
  const colorPatterns = [
    /#[0-9a-fA-F]{3,8}\b/g,
    /rgba?\s*\([^)]+\)/gi,
    /hsla?\s*\([^)]+\)/gi,
    /hwb\s*\([^)]+\)/gi,
    /(?<!ok)lab\s*\([^)]+\)/gi,
    /(?<!ok)lch\s*\([^)]+\)/gi,
    /oklch\s*\([^)]+\)/gi,
    /oklab\s*\([^)]+\)/gi,
    /color\s*\([^)]+\)/gi,
  ];

  function createColorDecoration(color: string): Decoration {
    const luminance = getLuminance(color);
    const isLight = luminance > luminanceThreshold;

    return Decoration.mark({
      class: `${className} ${isLight ? lightClassName : darkClassName}`,
      attributes: {
        style: `--cm-color-preview: ${color};`,
      },
    });
  }

  function findColors(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];
    const doc = view.state.doc;

    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i);
      const lineText = line.text;

      for (const pattern of colorPatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(lineText)) !== null) {
          const color = parseColorValue(match[0]);
          if (color) {
            const from = line.from + match.index;
            const to = from + match[0].length;
            decorations.push(createColorDecoration(color).range(from, to));
          }
        }
      }
    }

    return Decoration.set(decorations, true);
  }

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = findColors(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = findColors(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

/**
 * Default styles for the color highlighter.
 * Import and add to your editor's extensions, or define your own styles.
 */
export const colorHighlighterStyles = EditorView.baseTheme({
  ".cm-color-preview": {
    backgroundColor: "var(--cm-color-preview)",
    padding: "1px 4px",
    borderRadius: "3px",
    outline: "1px solid rgba(128, 128, 128, 0.3)",
    margin: "0 1px",
  },
  ".cm-color-preview *": {
    color: "inherit !important",
    background: "none !important",
  },
  ".cm-color-preview-light": {
    color: "#000",
  },
  ".cm-color-preview-dark": {
    color: "#fff",
  },
});
