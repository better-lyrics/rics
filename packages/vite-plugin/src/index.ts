import type { Plugin, ResolvedConfig } from "vite";
import type { CompilerConfig } from "rics";
import { compileWithDetails } from "rics";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

export interface RicsPluginOptions extends Partial<CompilerConfig> {
  /**
   * File extensions to process
   * @default ['.rics']
   */
  extensions?: string[];
}

const defaultOptions: RicsPluginOptions = {
  extensions: [".rics"],
};

export function ricsPlugin(options: RicsPluginOptions = {}): Plugin {
  const opts = { ...defaultOptions, ...options };
  const extensions = opts.extensions!;
  let config: ResolvedConfig;
  const cssMap = new Map<string, string>();

  const isRicsFile = (id: string) => {
    // Skip ?raw imports - let Vite handle them natively
    if (id.includes("?raw")) return false;
    const cleanId = id.split("?")[0];
    return extensions.some((ext) => cleanId.endsWith(ext));
  };

  const compileRics = (code: string, id: string) => {
    const result = compileWithDetails(code, opts);

    if (result.errors.length > 0) {
      const error = result.errors[0];
      const location = error.start
        ? ` at line ${error.start.line}, column ${error.start.column}`
        : "";
      throw new Error(`rics compile error${location}: ${error.message}`);
    }

    return result.css;
  };

  return {
    name: "vite-plugin-rics",
    enforce: "pre" as const,

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    resolveId(source, importer) {
      if (!isRicsFile(source)) return null;

      // Resolve .rics to virtual .css module
      if (importer) {
        const resolved = resolve(dirname(importer), source);
        return `\0virtual:rics:${resolved}`;
      }
      return null;
    },

    load(id) {
      if (!id.startsWith("\0virtual:rics:")) return null;

      const actualPath = id.replace("\0virtual:rics:", "");

      try {
        const code = readFileSync(actualPath, "utf-8");
        const css = compileRics(code, actualPath);
        cssMap.set(actualPath, css);

        // Return as a CSS module that Vite understands
        // This creates a style tag with the CSS
        const cssCode = JSON.stringify(css);

        // Both dev and build: inject style tag
        // In build mode, Vite will extract this into CSS chunks
        return `
const css = ${cssCode};
const style = document.createElement('style');
style.setAttribute('data-rics-id', ${JSON.stringify(actualPath)});
style.textContent = css;
document.head.appendChild(style);
export default css;
`;
      } catch (e) {
        this.error(e instanceof Error ? e.message : String(e));
      }
    },

    // Add the file to watch list for HMR
    handleHotUpdate({ file, server }) {
      if (!isRicsFile(file)) return;

      // Invalidate the virtual module
      const virtualId = `\0virtual:rics:${file}`;
      const mod = server.moduleGraph.getModuleById(virtualId);

      if (mod) {
        server.moduleGraph.invalidateModule(mod);

        // Also invalidate any modules that import this
        mod.importers.forEach((importer) => {
          server.moduleGraph.invalidateModule(importer);
        });
      }
    },

    // Transform .rics in HTML
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        // For production builds, we'll handle CSS differently
        return html;
      },
    },
  };
}
