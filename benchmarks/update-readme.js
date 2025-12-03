import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { Bench } from "tinybench";
import { compileWithDetails } from "rics";
import * as sass from "sass";
import less from "less";
import stylus from "stylus";

const __dirname = dirname(fileURLToPath(import.meta.url));
const README_PATH = join(__dirname, "../packages/core/README.md");

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

async function runBenchmarks() {
  console.log("Running benchmarks...");

  const bench = new Bench({ time: 1000 });

  bench.add("rics", compilers.rics);
  bench.add("sass", compilers.scss);
  bench.add("stylus", compilers.stylus);

  await bench.warmup();
  await bench.run();

  const results = bench.tasks
    .map(task => ({
      name: task.name,
      opsPerSec: Math.round(task.result?.hz || 0),
    }))
    .sort((a, b) => b.opsPerSec - a.opsPerSec);

  // Less benchmark (async)
  const lessStart = performance.now();
  for (let i = 0; i < 100; i++) {
    await compilers.less();
  }
  const lessOps = Math.round(100000 / (performance.now() - lessStart));
  results.push({ name: "less", opsPerSec: lessOps });
  results.sort((a, b) => b.opsPerSec - a.opsPerSec);

  return results;
}

async function getPackageSizes() {
  console.log("Fetching package sizes...");

  const packages = ["rics", "sass", "less", "stylus"];
  const results = [];

  for (const pkg of packages) {
    try {
      const info = JSON.parse(
        execSync(`npm view ${pkg} --json 2>/dev/null`, { encoding: "utf-8" })
      );
      results.push({
        name: pkg,
        size: info.dist?.unpackedSize || 0,
        deps: info.dependencies ? Object.keys(info.dependencies).length : 0,
      });
    } catch (e) {
      console.log(`  Warning: Could not fetch ${pkg}`);
    }
  }

  return results.sort((a, b) => a.size - b.size);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function generateBenchmarkMarkdown(perfResults, sizeResults) {
  const ricsPerf = perfResults.find(r => r.name === "rics");
  const ricsSize = sizeResults.find(r => r.name === "rics");

  let md = `## Benchmarks

> Auto-generated. Run \`pnpm bench\` in the benchmarks folder to regenerate.

### Performance (ops/sec, higher is better)

| Preprocessor | ops/sec | Comparison |
|--------------|---------|------------|
`;

  for (const r of perfResults) {
    const comparison = r.name === "rics"
      ? "**fastest**"
      : `${(ricsPerf.opsPerSec / r.opsPerSec).toFixed(1)}x slower`;
    md += `| ${r.name} | ${r.opsPerSec.toLocaleString()} | ${comparison} |\n`;
  }

  md += `
### Package Size (smaller is better)

| Package | Size | Dependencies | Comparison |
|---------|------|--------------|------------|
`;

  for (const r of sizeResults) {
    const comparison = r.name === "rics"
      ? "**smallest**"
      : `${Math.round(r.size / ricsSize.size)}x larger`;
    md += `| ${r.name} | ${formatSize(r.size)} | ${r.deps} | ${comparison} |\n`;
  }

  return md;
}

async function updateReadme() {
  const perfResults = await runBenchmarks();
  const sizeResults = await getPackageSizes();

  const benchmarkMd = generateBenchmarkMarkdown(perfResults, sizeResults);

  let readme = readFileSync(README_PATH, "utf-8");

  // Replace or add benchmark section
  const benchmarkStart = "## Benchmarks";
  const benchmarkEnd = "\n## ";

  if (readme.includes(benchmarkStart)) {
    // Replace existing benchmark section
    const startIdx = readme.indexOf(benchmarkStart);
    const endIdx = readme.indexOf(benchmarkEnd, startIdx + benchmarkStart.length);
    if (endIdx > startIdx) {
      readme = readme.slice(0, startIdx) + benchmarkMd + readme.slice(endIdx);
    } else {
      // Benchmark is at the end
      readme = readme.slice(0, startIdx) + benchmarkMd;
    }
  } else {
    // Add before License section
    const licenseIdx = readme.indexOf("## License");
    if (licenseIdx > 0) {
      readme = readme.slice(0, licenseIdx) + benchmarkMd + "\n" + readme.slice(licenseIdx);
    } else {
      readme += "\n" + benchmarkMd;
    }
  }

  writeFileSync(README_PATH, readme);
  console.log("✅ README updated with benchmark results!");
}

updateReadme().catch(console.error);
