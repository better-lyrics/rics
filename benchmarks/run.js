import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Bench } from "tinybench";
import { compileWithDetails } from "rics";
import * as sass from "sass";
import less from "less";
import stylus from "stylus";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read fixture files
const fixtures = {
  rics: readFileSync(join(__dirname, "fixtures/sample.rics"), "utf-8"),
  scss: readFileSync(join(__dirname, "fixtures/sample.scss"), "utf-8"),
  less: readFileSync(join(__dirname, "fixtures/sample.less"), "utf-8"),
  stylus: readFileSync(join(__dirname, "fixtures/sample.styl"), "utf-8"),
};

// Compile functions
const compilers = {
  rics: () => compileWithDetails(fixtures.rics).css,
  scss: () => sass.compileString(fixtures.scss, {
    silenceDeprecations: ['slash-div', 'global-builtin', 'color-functions']
  }).css,
  less: async () => (await less.render(fixtures.less)).css,
  stylus: () => stylus.render(fixtures.stylus),
};

async function run() {
  console.log("🚀 rics Performance Benchmark\n");
  console.log("─".repeat(70));

  const bench = new Bench({ time: 1000 });

  // Add synchronous tasks
  bench.add("rics", compilers.rics);
  bench.add("sass (dart)", compilers.scss);
  bench.add("stylus", compilers.stylus);

  // Run sync benchmarks first
  await bench.warmup();
  await bench.run();

  // Get output sizes
  const outputs = {
    rics: compilers.rics(),
    scss: compilers.scss(),
    stylus: compilers.stylus(),
    less: await compilers.less(),
  };

  // Print results
  console.log("\n📊 Performance Results (ops/sec - higher is better):\n");

  const table = bench.table();

  // Sort by ops/sec (fastest first)
  const results = bench.tasks
    .map(task => ({
      name: task.name,
      opsPerSec: task.result?.hz || 0,
      mean: task.result?.mean || 0,
      margin: task.result?.rme || 0,
    }))
    .sort((a, b) => b.opsPerSec - a.opsPerSec);

  const fastest = results[0].opsPerSec;

  console.log("| Preprocessor | ops/sec    | Mean (ms) | ±RME   | vs rics |");
  console.log("|--------------|------------|-----------|--------|---------|");

  for (const r of results) {
    const comparison = r.name === "rics"
      ? "-"
      : `${(fastest / r.opsPerSec).toFixed(1)}x slower`;
    console.log(
      `| ${r.name.padEnd(12)} | ${r.opsPerSec.toFixed(0).padStart(10)} | ${r.mean.toFixed(3).padStart(9)} | ${("±" + r.margin.toFixed(1) + "%").padStart(6)} | ${comparison.padStart(7)} |`
    );
  }

  // Less benchmark (async)
  console.log("\n📝 Note: Less runs async, benchmarked separately:");
  const lessStart = performance.now();
  const lessIterations = 100;
  for (let i = 0; i < lessIterations; i++) {
    await compilers.less();
  }
  const lessTime = (performance.now() - lessStart) / lessIterations;
  console.log(`  Less: ~${(1000 / lessTime).toFixed(0)} ops/sec (${lessTime.toFixed(3)}ms mean)`);

  // Output sizes
  console.log("\n" + "─".repeat(70));
  console.log("\n📦 Output Sizes:\n");

  console.log("| Preprocessor | Input    | Output   | Ratio |");
  console.log("|--------------|----------|----------|-------|");

  for (const [name, output] of Object.entries(outputs)) {
    const input = fixtures[name === "scss" ? "scss" : name];
    const ratio = (output.length / input.length * 100).toFixed(0);
    console.log(
      `| ${name.padEnd(12)} | ${(input.length + " B").padStart(8)} | ${(output.length + " B").padStart(8)} | ${(ratio + "%").padStart(5)} |`
    );
  }

  console.log("\n" + "─".repeat(70));
  console.log("\n✨ Benchmark complete!\n");
}

run().catch(console.error);
