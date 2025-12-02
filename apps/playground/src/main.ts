import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { StreamLanguage } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import * as prettier from "prettier/standalone";
import * as cssParser from "prettier/plugins/postcss";
import Split from "split.js";
import { compileWithDetails } from "rics";
import { ricsLanguage } from "codemirror-lang-rics";
import { examples } from "./examples";

// Styles are loaded via CSS link in index.html to avoid FOUC

const cssLanguage = StreamLanguage.define({
  name: "css",
  startState() {
    return { inComment: false, inString: null as string | null, braceDepth: 0 };
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

    // Property names (word followed by :)
    if (state.braceDepth > 0 && stream.match(/^[\w-]+(?=\s*:)/)) {
      return "propertyName";
    }

    // Selectors
    if (stream.match(/^\.[a-zA-Z_][\w-]*/)) return "className";
    if (stream.match(/^#[a-zA-Z_][\w-]*/)) return "tagName";
    if (stream.match(/^::?[\w-]+/)) return "className";
    if (stream.match(/^@[\w-]+/)) return "keyword";

    // Functions
    if (stream.match(/^[\w-]+(?=\()/)) return "function";
    if (stream.match(/^[()]/)) return "punctuation";

    // Element selectors / values
    if (stream.match(/^[\w-]+/)) {
      return state.braceDepth > 0 ? "variableName" : "tagName";
    }

    stream.next();
    return null;
  },
});

const inputEl = document.getElementById("input-editor")!;
const outputEl = document.getElementById("output-editor")!;
const statusEl = document.getElementById("status")!;
const statsEl = document.getElementById("stats")!;
const examplesDropdown = document.getElementById("examples-dropdown")!;
const examplesTrigger = document.getElementById("examples-trigger")!;
const examplesMenu = document.getElementById("examples-menu")!;
const shareBtn = document.getElementById("share")!;
const importBtn = document.getElementById("import")!;
const exportBtn = document.getElementById("export")!;
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const formatInputBtn = document.getElementById("format-input")!;
const copyOutputBtn = document.getElementById("copy-output")!;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const outputEditor = new EditorView({
  state: EditorState.create({
    doc: "",
    extensions: [
      basicSetup,
      cssLanguage,
      oneDark,
      EditorState.readOnly.of(true),
    ],
  }),
  parent: outputEl,
});

function compileAndUpdate(source: string) {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const result = compileWithDetails(source, {
      timeout: 30000,
      maxIterations: 100000,
    });

    if (result.errors.length > 0) {
      statusEl.className = "status-error";
      statusEl.textContent = `Error: ${result.errors[0].message}`;
      if (result.errors[0].start) {
        statusEl.textContent += ` (line ${result.errors[0].start.line})`;
      }
    } else {
      statusEl.className = "status-success";
      statusEl.textContent = `Compiled successfully`;
    }

    let output = result.css || "/* No output */";

    // Auto-format CSS
    if (output && !result.errors.length) {
      try {
        output = await prettier.format(output, {
          parser: "css",
          plugins: [cssParser],
          tabWidth: 2,
        });
        output = output.trim();
      } catch {
        // Keep unformatted if prettier fails
      }
    }

    // Count lines and calculate delta
    const inputLines = source.split("\n").length;
    const outputLines = output.split("\n").length;
    const delta = outputLines - inputLines;
    const deltaSign = delta > 0 ? "+" : "";
    const deltaClass =
      delta > 0
        ? "delta-positive"
        : delta < 0
          ? "delta-negative"
          : "delta-neutral";

    const deltaText = `[${deltaSign}${delta}]`;
    statsEl.textContent = `${result.stats.duration}ms · ${result.stats.rules} rules · ${inputLines} → ${outputLines} lines `;

    // Update or create delta span
    let deltaSpan = statsEl.querySelector(".delta") as HTMLSpanElement;
    if (!deltaSpan) {
      deltaSpan = document.createElement("span");
      deltaSpan.className = "delta";
      statsEl.appendChild(deltaSpan);
    }
    deltaSpan.className = `delta ${deltaClass}`;
    deltaSpan.textContent = deltaText;

    // Add bytes after delta
    const bytesText = document.createTextNode(
      ` · ${result.stats.outputSize} bytes`
    );
    if (deltaSpan.nextSibling) {
      statsEl.replaceChild(bytesText, deltaSpan.nextSibling);
    } else {
      statsEl.appendChild(bytesText);
    }

    outputEditor.dispatch({
      changes: { from: 0, to: outputEditor.state.doc.length, insert: output },
    });
  }, 150);
}

const editor = new EditorView({
  state: EditorState.create({
    doc: examples.basic,
    extensions: [
      basicSetup,
      ricsLanguage(),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          compileAndUpdate(update.state.doc.toString());
        }
      }),
    ],
  }),
  parent: inputEl,
});

// Dropdown handling
examplesTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  examplesDropdown.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!examplesDropdown.contains(e.target as Node)) {
    examplesDropdown.classList.remove("open");
  }
});

function setActiveExample(exampleKey: string) {
  // Remove active class from all buttons
  examplesMenu.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Add active class to selected button
  const activeBtn = examplesMenu.querySelector(
    `button[data-example="${exampleKey}"]`
  );
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// Set initial active example
setActiveExample("basic");

examplesMenu.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.dataset.example) return;

  const exampleKey = target.dataset.example as keyof typeof examples;
  const example = examples[exampleKey];
  if (!example) return;

  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: example },
  });
  examplesDropdown.classList.remove("open");

  // Update trigger text to show selected example
  const triggerText = examplesTrigger.querySelector("span");
  if (triggerText) {
    triggerText.textContent = target.textContent;
  }

  // Update active state
  setActiveExample(exampleKey);
});

shareBtn.addEventListener("click", () => {
  const source = editor.state.doc.toString();
  const encoded = btoa(encodeURIComponent(source));
  const url = `${window.location.origin}${window.location.pathname}#${encoded}`;

  navigator.clipboard.writeText(url).then(() => {
    const originalText = shareBtn.textContent;
    shareBtn.textContent = "Copied!";
    setTimeout(() => {
      shareBtn.textContent = originalText;
    }, 2000);
  });
});

// Import .rics file
importBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: content },
    });
    // Update trigger text
    const triggerText = examplesTrigger.querySelector("span");
    if (triggerText) {
      triggerText.textContent = file.name;
    }
    // Clear active example
    examplesMenu.querySelectorAll("button").forEach((btn) => {
      btn.classList.remove("active");
    });
  };
  reader.readAsText(file);
  fileInput.value = "";
});

// Export as .rics file
exportBtn.addEventListener("click", () => {
  const source = editor.state.doc.toString();
  const blob = new Blob([source], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "styles.rics";
  a.click();
  URL.revokeObjectURL(url);
});

formatInputBtn.addEventListener("click", () => {
  // Simple formatting: normalize indentation
  const source = editor.state.doc.toString();
  const lines = source.split("\n");
  let formatted = "";
  let indent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted += "\n";
      continue;
    }

    // Decrease indent for closing braces
    if (trimmed.startsWith("}")) {
      indent = Math.max(0, indent - 1);
    }

    formatted += "  ".repeat(indent) + trimmed + "\n";

    // Increase indent after opening braces
    if (trimmed.endsWith("{")) {
      indent++;
    }
  }

  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: formatted.trim() },
  });
});

copyOutputBtn.addEventListener("click", () => {
  const output = outputEditor.state.doc.toString();
  navigator.clipboard.writeText(output).then(() => {
    const originalText = copyOutputBtn.textContent;
    copyOutputBtn.textContent = "Copied!";
    setTimeout(() => {
      copyOutputBtn.textContent = originalText;
    }, 2000);
  });
});

if (window.location.hash) {
  try {
    const decoded = decodeURIComponent(atob(window.location.hash.slice(1)));
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: decoded },
    });
  } catch {
    console.error("Failed to decode URL hash");
  }
}

compileAndUpdate(editor.state.doc.toString());

// Initialize split panes
Split(["#pane-input", "#pane-output"], {
  sizes: [50, 50],
  minSize: 200,
  gutterSize: 6,
  cursor: "col-resize",
  onDrag: () => {
    editor.requestMeasure();
    outputEditor.requestMeasure();
  },
});
