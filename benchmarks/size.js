import { execSync } from "node:child_process";

const packages = ["rics", "sass", "less", "stylus"];

console.log("📦 Package Size Comparison\n");
console.log("Fetching package info from npm registry...\n");

const results = [];

for (const pkg of packages) {
  try {
    const info = JSON.parse(
      execSync(`npm view ${pkg} --json 2>/dev/null`, { encoding: "utf-8" })
    );

    results.push({
      name: pkg,
      version: info.version,
      unpacked: info.dist?.unpackedSize || 0,
      gzip: info.dist?.size || 0,
      deps: info.dependencies ? Object.keys(info.dependencies).length : 0,
    });
  } catch (e) {
    console.log(`  ⚠️  ${pkg}: Could not fetch info`);
  }
}

// Sort by unpacked size
results.sort((a, b) => a.unpacked - b.unpacked);

console.log("| Package  | Version  | Unpacked   | Gzipped   | Deps | vs rics |");
console.log("|----------|----------|------------|-----------|------|---------|");

const smallest = results[0]?.unpacked || 1;

for (const r of results) {
  const ratio = r.name === results[0]?.name
    ? "-"
    : `${(r.unpacked / smallest).toFixed(0)}x`;
  console.log(
    `| ${r.name.padEnd(8)} | ${r.version.padEnd(8)} | ${formatSize(r.unpacked).padStart(10)} | ${formatSize(r.gzip).padStart(9)} | ${String(r.deps).padStart(4)} | ${ratio.padStart(7)} |`
  );
}

console.log("\n✨ Size comparison complete!\n");

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
