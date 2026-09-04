import { readFile } from "node:fs/promises";

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node scripts/verify-report.mjs <findings.json>\n  findings.json: [{ \"key\": \"new-checkout\", \"verdict\": \"stale\" }, ...]");
  process.exit(2);
}

const manifest = JSON.parse(await readFile(new URL("../flags.manifest.json", import.meta.url), "utf8"));
const findings = JSON.parse(await readFile(reportPath, "utf8"));
const verdictByKey = new Map(findings.map((finding) => [finding.key, finding.verdict]));

let mismatchCount = 0;
for (const flag of manifest.flags) {
  const expected = flag.expected.verdict;
  const actual = verdictByKey.get(flag.key) ?? "missing";
  const isMatch = expected === actual;
  if (!isMatch) mismatchCount += 1;
  console.log(`${isMatch ? "ok  " : "FAIL"} ${flag.key.padEnd(24)} expected ${expected.padEnd(8)} got ${actual}`);
}

const unexpectedKeys = findings.map((finding) => finding.key).filter((key) => !manifest.flags.some((flag) => flag.key === key));
for (const key of unexpectedKeys) {
  mismatchCount += 1;
  console.log(`FAIL ${key.padEnd(24)} not in manifest`);
}

console.log(`\n${manifest.flags.length - mismatchCount + unexpectedKeys.length}/${manifest.flags.length} matched, ${mismatchCount} mismatches.`);
process.exit(mismatchCount === 0 ? 0 : 1);
