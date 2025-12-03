import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import Split from "split.js";
import * as prettier from "prettier/standalone";
import prettierRics from "prettier-plugin-rics";
import {
  ricsLanguage,
  colorHighlighter,
  colorHighlighterStyles,
} from "codemirror-lang-rics";
import { cssLanguage } from "./css-language";
import { createCompiler } from "./compiler";
import { examples } from "./examples";
import "./styles.rics";

const $ = (id: string) => document.getElementById(id)!;

const statusEl = $("status");
const statsEl = $("stats");
const examplesDropdown = $("examples-dropdown");
const examplesTrigger = $("examples-trigger");
const examplesMenu = $("examples-menu");
const fileInput = $("file-input") as HTMLInputElement;

const outputEditor = new EditorView({
  state: EditorState.create({
    doc: "",
    extensions: [
      basicSetup,
      cssLanguage,
      oneDark,
      colorHighlighter(),
      colorHighlighterStyles,
      EditorState.readOnly.of(true),
    ],
  }),
  parent: $("output-editor"),
});

const compileAndUpdate = createCompiler(outputEditor, statusEl, statsEl);

const editor = new EditorView({
  state: EditorState.create({
    doc: examples.basic,
    extensions: [
      basicSetup,
      ricsLanguage(),
      oneDark,
      colorHighlighter(),
      colorHighlighterStyles,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          compileAndUpdate(update.state.doc.toString());
        }
      }),
    ],
  }),
  parent: $("input-editor"),
});

function setEditorContent(content: string) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: content },
  });
}

function setTriggerText(text: string) {
  const span = examplesTrigger.querySelector("span");
  if (span) span.textContent = text;
}

function clearActiveExample() {
  examplesMenu.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
}

function setActiveExample(key: string) {
  clearActiveExample();
  const btn = examplesMenu.querySelector(`button[data-example="${key}"]`);
  if (btn) btn.classList.add("active");
}

// Examples dropdown
examplesTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  examplesDropdown.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!examplesDropdown.contains(e.target as Node)) {
    examplesDropdown.classList.remove("open");
  }
});

function loadExample(key: string) {
  if (!examples[key]) return false;
  setEditorContent(examples[key]);
  const btn = examplesMenu.querySelector(`button[data-example="${key}"]`);
  setTriggerText(btn?.textContent || key);
  setActiveExample(key);
  history.pushState(null, "", `/${key}`);
  return true;
}

examplesMenu.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const key = target.dataset.example as keyof typeof examples;
  if (!key || !examples[key]) return;

  loadExample(key);
  examplesDropdown.classList.remove("open");
});

// Handle browser back/forward
window.addEventListener("popstate", () => {
  const path = location.pathname.slice(1);
  if (path && examples[path]) {
    setEditorContent(examples[path]);
    const btn = examplesMenu.querySelector(`button[data-example="${path}"]`);
    setTriggerText(btn?.textContent || path);
    setActiveExample(path);
  }
});

// Share
$("share").addEventListener("click", () => {
  const encoded = btoa(encodeURIComponent(editor.state.doc.toString()));
  const url = `${location.origin}${location.pathname}#${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    const btn = $("share");
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = original), 2000);
  });
});

// Import
$("import").addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    setEditorContent(e.target?.result as string);
    setTriggerText(file.name);
    clearActiveExample();
  };
  reader.readAsText(file);
  fileInput.value = "";
});

// Export
$("export").addEventListener("click", () => {
  const blob = new Blob([editor.state.doc.toString()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "styles.rics";
  a.click();
  URL.revokeObjectURL(url);
});

// Format
$("format-input").addEventListener("click", async () => {
  try {
    const formatted = await prettier.format(editor.state.doc.toString(), {
      parser: "rics",
      plugins: [prettierRics],
    });
    setEditorContent(formatted.trim());
  } catch {
    // Fallback to simple formatting if prettier fails
    const lines = editor.state.doc.toString().split("\n");
    let result = "";
    let indent = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        result += "\n";
        continue;
      }
      if (trimmed.startsWith("}")) indent = Math.max(0, indent - 1);
      result += "  ".repeat(indent) + trimmed + "\n";
      if (trimmed.endsWith("{")) indent++;
    }
    setEditorContent(result.trim());
  }
});

// Copy output
$("copy-output").addEventListener("click", () => {
  navigator.clipboard.writeText(outputEditor.state.doc.toString()).then(() => {
    const btn = $("copy-output");
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = original), 2000);
  });
});

// Load from URL: hash takes priority, then pathname, then default
let initialExample = "basic";
if (location.hash) {
  try {
    setEditorContent(decodeURIComponent(atob(location.hash.slice(1))));
    clearActiveExample();
    setTriggerText("Shared");
    initialExample = "";
  } catch {
    console.error("Failed to decode URL hash");
  }
} else {
  const path = location.pathname.slice(1);
  if (path && examples[path]) {
    initialExample = path;
    setEditorContent(examples[path]);
  }
}

// Initial compile and active example
if (initialExample) {
  setActiveExample(initialExample);
  const btn = examplesMenu.querySelector(`button[data-example="${initialExample}"]`);
  if (btn) setTriggerText(btn.textContent || initialExample);
}
compileAndUpdate(editor.state.doc.toString());

// Split panes
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
