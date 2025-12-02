import type { Extension } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import type { CompilerConfig, CompileResult } from "../types";
import { compileWithDetails } from "../compiler";

export interface LinterConfig extends Partial<CompilerConfig> {
  delay?: number;
}

export { ricsLanguage, ricsHighlighting } from "./language";
export { ricsLinter, toDiagnostics } from "./linter";

export function onChangeCompile(
  callback: (css: string, result: CompileResult) => void,
  config?: Partial<CompilerConfig & { delay?: number }>
): Extension {
  const delay = config?.delay ?? 150;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return EditorView.updateListener.of((update: ViewUpdate) => {
    if (!update.docChanged) return;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const source = update.state.doc.toString();
      const result = compileWithDetails(source, config);
      callback(result.css, result);
    }, delay);
  });
}
