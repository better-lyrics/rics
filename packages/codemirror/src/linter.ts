import type { Extension } from "@codemirror/state";
import type { Diagnostic } from "@codemirror/lint";
import { linter } from "@codemirror/lint";
import type { Text } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import type { CompileError, CompileWarning, CompilerConfig } from "rics";
import { compileWithDetails } from "rics";

export interface LinterConfig extends Partial<CompilerConfig> {
  delay?: number;
}

export function ricsLinter(config?: LinterConfig): Extension {
  const delay = config?.delay ?? 300;

  return linter(
    (view: EditorView) => {
      const doc = view.state.doc;
      const source = doc.toString();

      if (!source.trim()) return [];

      const result = compileWithDetails(source, config);
      return toDiagnostics([...result.errors, ...result.warnings], doc);
    },
    { delay }
  );
}

export function toDiagnostics(
  issues: (CompileError | CompileWarning)[],
  doc: Text
): Diagnostic[] {
  return issues.map((issue) => {
    let from = 0;
    let to = doc.length;

    if (issue.start) {
      from = getOffset(doc, issue.start.line, issue.start.column);
    }

    if (issue.end) {
      to = getOffset(doc, issue.end.line, issue.end.column);
    } else if (issue.start) {
      to = Math.min(from + 50, doc.length);
      const lineEnd = doc.lineAt(from).to;
      to = Math.min(to, lineEnd);
    }

    if (from >= to) {
      to = Math.min(from + 1, doc.length);
    }

    return {
      from,
      to,
      severity: issue.type === "error" ? "error" : "warning",
      message: issue.message,
      source: "rics",
    };
  });
}

function getOffset(doc: Text, line: number, column: number): number {
  if (line < 1) line = 1;
  if (line > doc.lines) line = doc.lines;

  const lineObj = doc.line(line);
  const offset = lineObj.from + column;

  return Math.min(offset, lineObj.to);
}
