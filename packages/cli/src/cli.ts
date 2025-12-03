import * as fs from "node:fs";
import * as path from "node:path";
import { compileWithDetails, version } from "rics";

export interface Options {
  output?: string;
  minify?: boolean;
  watch?: boolean;
  help?: boolean;
  version?: boolean;
}

const HELP = `
rics v${version} - Lightweight SCSS-like CSS preprocessor

Usage:
  rics <input> [options]
  rics <input> -o <output> [options]

Options:
  -o, --output <file>   Output file (default: stdout)
  -m, --minify          Minify output
  -w, --watch           Watch for changes
  -h, --help            Show this help
  -v, --version         Show version

Examples:
  rics styles.rics                     # Output to stdout
  rics styles.rics -o styles.css       # Output to file
  rics src/main.rics -o dist/main.css --minify
  rics styles.rics -w -o styles.css    # Watch mode
`;

export function parseArgs(args: string[]): { input?: string; options: Options } {
  const options: Options = {};
  let input: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version") {
      options.version = true;
    } else if (arg === "-m" || arg === "--minify") {
      options.minify = true;
    } else if (arg === "-w" || arg === "--watch") {
      options.watch = true;
    } else if (arg === "-o" || arg === "--output") {
      options.output = args[++i];
    } else if (!arg.startsWith("-")) {
      input = arg;
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  return { input, options };
}

function compile(inputPath: string, options: Options): void {
  const absolutePath = path.resolve(inputPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(absolutePath, "utf-8");
  const result = compileWithDetails(source, {
    minify: options.minify,
  });

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      const loc = error.start ? `:${error.start.line}:${error.start.column}` : "";
      console.error(`${inputPath}${loc}: ${error.message}`);
    }
    process.exit(1);
  }

  for (const warning of result.warnings) {
    const loc = warning.start ? `:${warning.start.line}:${warning.start.column}` : "";
    console.warn(`${inputPath}${loc}: warning: ${warning.message}`);
  }

  if (options.output) {
    const outputPath = path.resolve(options.output);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.css);
    console.error(
      `Compiled ${inputPath} → ${options.output} (${result.stats.duration}ms, ${result.stats.outputSize} bytes)`
    );
  } else {
    process.stdout.write(result.css);
  }
}

function watch(inputPath: string, options: Options): void {
  const absolutePath = path.resolve(inputPath);

  console.error(`Watching ${inputPath}...`);
  compile(inputPath, options);

  fs.watch(absolutePath, (eventType) => {
    if (eventType === "change") {
      console.error(`\nFile changed, recompiling...`);
      try {
        compile(inputPath, options);
      } catch (e) {
        console.error(`Compile error: ${e}`);
      }
    }
  });
}

function main(): void {
  const args = process.argv.slice(2);
  const { input, options } = parseArgs(args);

  if (options.help || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  if (options.version) {
    console.log(`rics v${version}`);
    process.exit(0);
  }

  if (!input) {
    console.error("Error: No input file specified");
    console.log(HELP);
    process.exit(1);
  }

  if (options.watch) {
    watch(input, options);
  } else {
    compile(input, options);
  }
}

// Run main when executed as CLI entry point (not in test environment)
if (!process.env.VITEST) {
  main();
}
