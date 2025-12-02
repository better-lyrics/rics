import type { LoaderContext } from "webpack";
import type { CompilerConfig } from "rics";
import { compileWithDetails } from "rics";

export interface RicsLoaderOptions extends Partial<CompilerConfig> {}

export default function ricsLoader(
  this: LoaderContext<RicsLoaderOptions>,
  source: string
): void {
  const callback = this.async();
  const options = this.getOptions();

  try {
    const result = compileWithDetails(source, options);

    if (result.errors.length > 0) {
      const error = result.errors[0];
      const location = error.start
        ? ` at line ${error.start.line}, column ${error.start.column}`
        : "";
      callback(new Error(`rics compile error${location}: ${error.message}`));
      return;
    }

    for (const warning of result.warnings) {
      const location = warning.start
        ? ` at line ${warning.start.line}, column ${warning.start.column}`
        : "";
      this.emitWarning(new Error(`${warning.message}${location}`));
    }

    callback(null, result.css);
  } catch (e) {
    callback(e instanceof Error ? e : new Error(String(e)));
  }
}
