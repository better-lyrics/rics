import type { Parser, Printer, Plugin, SupportLanguage } from "prettier";

interface RicsNode {
  type: "root";
  source: string;
}

const languages: SupportLanguage[] = [
  {
    name: "rics",
    parsers: ["rics"],
    extensions: [".rics"],
    vscodeLanguageIds: ["rics"],
  },
];

const parsers: Record<string, Parser<RicsNode>> = {
  rics: {
    parse(text: string, _options: object): RicsNode {
      return { type: "root", source: text };
    },
    astFormat: "rics-ast",
    locStart: () => 0,
    locEnd: (node) => node.source.length,
  },
};

const printers: Record<string, Printer<RicsNode>> = {
  "rics-ast": {
    print(path) {
      const node = path.getValue();
      return formatRics(node.source);
    },
  },
};

function formatRics(source: string): string {
  const lines = source.split("\n");
  const result: string[] = [];
  let indent = 0;
  let inMultilineComment = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();

    // Handle multi-line comments
    if (inMultilineComment) {
      if (trimmed.includes("*/")) {
        inMultilineComment = false;
        result.push("  ".repeat(indent) + trimmed);
      } else {
        result.push("  ".repeat(indent) + " " + trimmed);
      }
      continue;
    }

    if (trimmed.startsWith("/*") && !trimmed.includes("*/")) {
      inMultilineComment = true;
      result.push("  ".repeat(indent) + trimmed);
      continue;
    }

    // Skip empty lines but preserve one blank line between blocks
    if (!trimmed) {
      if (result.length > 0 && result[result.length - 1] !== "") {
        result.push("");
      }
      continue;
    }

    // Decrease indent for closing braces
    if (trimmed.startsWith("}")) {
      indent = Math.max(0, indent - 1);
    }

    // Format the line
    let formatted = "  ".repeat(indent) + trimmed;

    // Normalize spacing around colons in declarations (but not in selectors)
    if (trimmed.includes(":") && !trimmed.startsWith("@") && !trimmed.includes("{")) {
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex > 0) {
        const prop = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();
        formatted = "  ".repeat(indent) + prop + ": " + value;
      }
    }

    result.push(formatted);

    // Increase indent after opening braces
    if (trimmed.endsWith("{")) {
      indent++;
    }
  }

  // Remove trailing empty lines and ensure single newline at end
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return result.join("\n") + "\n";
}

const plugin: Plugin<RicsNode> = {
  languages,
  parsers,
  printers,
};

export default plugin;
export { languages, parsers, printers };
