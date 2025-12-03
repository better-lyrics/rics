import type { Extension } from "@codemirror/state";
import { LanguageSupport, StreamLanguage, StringStream } from "@codemirror/language";

interface LexerState {
  inString: string | null;
  inComment: boolean;
  inInterpolation: number;
  braceDepth: number;
}

const scssLike = StreamLanguage.define<LexerState>({
  name: "rics",

  startState(): LexerState {
    return {
      inString: null,
      inComment: false,
      inInterpolation: 0,
      braceDepth: 0,
    };
  },

  token(stream: StringStream, state: LexerState): string | null {
    // Handle block comments
    if (state.inComment) {
      if (stream.match("*/")) {
        state.inComment = false;
        return "comment";
      }
      stream.next();
      return "comment";
    }

    // Handle strings
    if (state.inString) {
      if (stream.peek() === state.inString) {
        stream.next();
        state.inString = null;
        return "string";
      }
      if (stream.peek() === "\\" && stream.string.length > stream.pos + 1) {
        stream.next();
        stream.next();
        return "string";
      }
      if (stream.peek() === "#" && stream.string[stream.pos + 1] === "{") {
        stream.next();
        stream.next();
        state.inInterpolation++;
        return "punctuation";
      }
      stream.next();
      return "string";
    }

    // Handle interpolation
    if (state.inInterpolation > 0) {
      if (stream.peek() === "}") {
        stream.next();
        state.inInterpolation--;
        return "punctuation";
      }
      if (stream.peek() === "{") {
        stream.next();
        state.inInterpolation++;
        return "punctuation";
      }
    }

    // Skip whitespace
    if (stream.eatSpace()) {
      return null;
    }

    // Line comments
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    // Block comments
    if (stream.match("/*")) {
      state.inComment = true;
      return "comment";
    }

    // Strings
    if (stream.match(/^["']/)) {
      state.inString = stream.current();
      return "string";
    }

    // Variables: $name or $name-with-dashes (must come before other identifier matching)
    if (stream.match(/^\$[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      return "variableName.special";
    }

    // Interpolation start
    if (stream.match(/^#\{/)) {
      state.inInterpolation++;
      return "punctuation";
    }

    // Hex colors
    if (stream.match(/^#[0-9a-fA-F]{3,8}\b/)) {
      return "color";
    }

    // ID selectors
    if (stream.match(/^#[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      return "tagName";
    }

    // At-rules
    if (stream.match(/^@(mixin|function|include|if|else|for|each|while|return|content|extend|debug|warn|error|media|supports|keyframes|font-face|import|use|forward|charset|namespace|page|layer|container|scope|starting-style|property)\b/)) {
      return "keyword";
    }

    // Other @ rules
    if (stream.match(/^@[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      return "keyword";
    }

    // Keywords
    if (stream.match(/^(and|or|not|from|through|to|in)\b/)) {
      return "keyword";
    }

    // Boolean/null
    if (stream.match(/^(true|false|null)\b/)) {
      return "atom";
    }

    // !important
    if (stream.match(/^!important\b/i)) {
      return "keyword";
    }

    // Numbers with units
    if (stream.match(/^-?(\d+\.?\d*|\.\d+)(%|em|rem|px|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax|dvh|dvw|svh|svw|lvh|lvw|deg|rad|turn|grad|s|ms|hz|khz|dpi|dpcm|dppx|fr|cqi|cqw|cqh|cqb|cqi)?/)) {
      return "number";
    }

    // Functions (only when followed by parenthesis)
    if (stream.match(/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklch|oklab|color|color-mix|url|calc|var|env|min|max|clamp|sin|cos|tan|asin|acos|atan|atan2|pow|sqrt|hypot|log|exp|abs|sign|round|mod|rem|lighten|darken|saturate|desaturate|adjust-hue|mix|complement|invert|grayscale|fade-in|fade-out|opacify|transparentize|adjust-color|scale-color|change-color|ie-hex-str|percentage|ceil|floor|random|str-length|str-slice|str-index|str-insert|to-upper-case|to-lower-case|quote|unquote|unique-id|length|nth|set-nth|join|append|zip|index|list-separator|is-bracketed|map-get|map-merge|map-remove|map-keys|map-values|map-has-key|keywords|type-of|unit|unitless|comparable|if|feature-exists|variable-exists|global-variable-exists|function-exists|mixin-exists|content-exists|inspect|selector-nest|selector-append|selector-extend|selector-replace|selector-unify|is-superselector|simple-selectors|selector-parse|red|green|blue|alpha|hue|saturation|lightness)(?=\s*\()/)) {
      return "function";
    }

    // Class and pseudo selectors
    if (stream.match(/^\.[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      return "className";
    }

    // Pseudo classes/elements
    if (stream.match(/^::?[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      return "className";
    }

    // Parent selector
    if (stream.match(/^&/)) {
      return "operator";
    }

    // Punctuation and braces
    if (stream.match(/^[{}()[\];,]/)) {
      const ch = stream.current();
      if (ch === "{") state.braceDepth++;
      if (ch === "}") state.braceDepth = Math.max(0, state.braceDepth - 1);
      return "punctuation";
    }

    // Colon (property separator)
    if (stream.match(/^:/)) {
      return "punctuation";
    }

    // Vendor prefixes (-webkit-*, -moz-*, -apple-system, etc.) - check before operators
    if (stream.match(/^-[a-zA-Z][a-zA-Z0-9_-]*/)) {
      return state.braceDepth > 0 ? "variableName" : "tagName";
    }

    // Operators
    if (stream.match(/^[=!<>]=?|[+\-*\/%]/)) {
      return "operator";
    }

    // Property names (word followed by colon, but only inside braces)
    if (state.braceDepth > 0 && stream.match(/^[a-zA-Z_-][a-zA-Z0-9_-]*(?=\s*:)/)) {
      return "propertyName";
    }

    // Element selectors / values
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      // If we're inside braces, it's likely a value
      return state.braceDepth > 0 ? "variableName" : "tagName";
    }

    // Anything else - consume one character
    stream.next();
    return null;
  },
});

let languageExtension: Extension | null = null;

export function ricsLanguage(): Extension {
  if (!languageExtension) {
    languageExtension = new LanguageSupport(scssLike);
  }
  return languageExtension;
}

export function ricsHighlighting(): Extension {
  return ricsLanguage();
}
