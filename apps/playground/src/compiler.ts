import type { EditorView } from "codemirror";
import * as prettier from "prettier/standalone";
import * as cssParser from "prettier/plugins/postcss";
import { compileWithDetails } from "rics";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function createCompiler(
  outputEditor: EditorView,
  statusEl: HTMLElement,
  statsEl: HTMLElement
) {
  return function compileAndUpdate(source: string) {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      const result = compileWithDetails(source, {
        timeout: 5000,
        maxIterations: 50000,
      });

      if (result.errors.length > 0) {
        statusEl.className = "status-error";
        statusEl.textContent = `Error: ${result.errors[0].message}`;
        if (result.errors[0].start) {
          statusEl.textContent += ` (line ${result.errors[0].start.line})`;
        }
      } else if (result.warnings.length > 0) {
        statusEl.className = "status-warning";
        statusEl.textContent = `Warning: ${result.warnings[0].message}`;
        if (result.warnings[0].start) {
          statusEl.textContent += ` (line ${result.warnings[0].start.line})`;
        }
        if (result.warnings.length > 1) {
          statusEl.textContent += ` (+${result.warnings.length - 1} more)`;
        }
      } else {
        statusEl.className = "status-success";
        statusEl.textContent = `Compiled successfully`;
      }

      let output = result.css || "/* No output */";

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

      let deltaSpan = statsEl.querySelector(".delta") as HTMLSpanElement;
      if (!deltaSpan) {
        deltaSpan = document.createElement("span");
        deltaSpan.className = "delta";
        statsEl.appendChild(deltaSpan);
      }
      deltaSpan.className = `delta ${deltaClass}`;
      deltaSpan.textContent = deltaText;

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
  };
}
