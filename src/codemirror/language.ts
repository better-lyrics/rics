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
    if (state.inComment) {
      if (stream.match("*/")) {
        state.inComment = false;
        return "comment";
      }
      stream.next();
      return "comment";
    }

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

    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    if (stream.match("/*")) {
      state.inComment = true;
      return "comment";
    }

    if (stream.match(/^["']/)) {
      state.inString = stream.current();
      return "string";
    }

    if (stream.match(/^\$[\w-]+/)) {
      return "variableName.special";
    }

    if (stream.match(/^#\{/)) {
      state.inInterpolation++;
      return "punctuation";
    }

    if (stream.match(/^#[0-9a-fA-F]{3,8}\b/)) {
      return "color";
    }

    if (stream.match(/^#[\w-]+/)) {
      return "tagName";
    }

    if (stream.match(/^@(mixin|function|include|if|else|for|each|return|media|supports|keyframes|font-face|import|charset|namespace|page|layer|container|scope|starting-style)\b/)) {
      return "keyword";
    }

    if (stream.match(/^@[\w-]+/)) {
      return "keyword";
    }

    if (stream.match(/^(and|or|not|from|through|to|in|by)\b/)) {
      return "keyword";
    }

    if (stream.match(/^(true|false|null)\b/)) {
      return "atom";
    }

    if (stream.match(/^-?[\d.]+(%|em|rem|px|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax|deg|rad|turn|grad|s|ms|hz|khz|dpi|dpcm|dppx)?/)) {
      return "number";
    }

    if (stream.match(/^(rgb|rgba|hsl|hsla|url|calc|var|min|max|clamp|lighten|darken|saturate|desaturate|adjust-hue|mix|complement|invert|grayscale|percentage|round|ceil|floor|abs|random|str-length|str-slice|str-index|str-insert|to-upper-case|to-lower-case|quote|unquote|length|nth|join|append|index|map-get|map-keys|map-values|map-has-key|type-of|unit|unitless|if|red|green|blue|alpha|opacity|hue|saturation|lightness|inspect)\b/)) {
      return "function";
    }

    if (stream.match(/^[.:][\w-]+/)) {
      return "className";
    }

    if (stream.match(/^&/)) {
      return "operator";
    }

    if (stream.match(/^[{}()[\]:;,]/)) {
      if (stream.current() === "{") state.braceDepth++;
      if (stream.current() === "}") state.braceDepth--;
      return "punctuation";
    }

    if (stream.match(/^[=!<>]=?|[+\-*/%]/)) {
      return "operator";
    }

    if (stream.match(/^!important\b/i)) {
      return "keyword";
    }

    if (stream.match(/^[\w-]+\s*(?=:)/)) {
      return "propertyName";
    }

    if (stream.match(/^[\w-]+/)) {
      return "variableName";
    }

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
