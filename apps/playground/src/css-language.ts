import { StreamLanguage } from "@codemirror/language";

interface CSSState {
  inComment: boolean;
  inString: string | null;
  braceDepth: number;
}

export const cssLanguage = StreamLanguage.define<CSSState>({
  name: "css",
  startState() {
    return { inComment: false, inString: null, braceDepth: 0 };
  },
  token(stream, state) {
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
      stream.next();
      return "string";
    }

    if (stream.match("/*")) {
      state.inComment = true;
      return "comment";
    }

    if (stream.match(/^["']/)) {
      state.inString = stream.current();
      return "string";
    }

    if (stream.match("{")) {
      state.braceDepth++;
      return "punctuation";
    }

    if (stream.match("}")) {
      state.braceDepth = Math.max(0, state.braceDepth - 1);
      return "punctuation";
    }

    if (stream.match(/^#[0-9a-fA-F]{3,8}\b/)) return "color";
    if (stream.match(/^-?[\d.]+[\w%]*/)) return "number";
    if (stream.match(/^[;:,]/)) return "punctuation";

    if (state.braceDepth > 0 && stream.match(/^[\w-]+(?=\s*:)/)) {
      return "propertyName";
    }

    if (stream.match(/^\.[a-zA-Z_][\w-]*/)) return "className";
    if (stream.match(/^#[a-zA-Z_][\w-]*/)) return "tagName";
    if (stream.match(/^::?[\w-]+/)) return "className";
    if (stream.match(/^@[\w-]+/)) return "keyword";

    if (stream.match(/^[\w-]+(?=\()/)) return "function";
    if (stream.match(/^[()]/)) return "punctuation";

    if (stream.match(/^[\w-]+/)) {
      return state.braceDepth > 0 ? "variableName" : "tagName";
    }

    stream.next();
    return null;
  },
});
