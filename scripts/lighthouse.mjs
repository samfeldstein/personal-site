#!/usr/bin/env node
/*
  lighthouse.mjs: updates the Lighthouse panel in every page's colophon.

    node scripts/lighthouse.mjs 97 100 100 100
    node scripts/lighthouse.mjs

  With numbers (the performance, accessibility, best practices, and SEO
  scores), writes them as given, e.g. from a Lighthouse run in Chrome DevTools
  (mobile). Without them, runs PageSpeed Insights (mobile) on the live home
  page; a PSI_KEY environment variable is used if set. Either way it writes
  shared/lighthouse.html; then run sync, commit and deploy. If the request
  fails, nothing changes.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const PAGE = join(root, "shared/lighthouse.html");
const facts = JSON.parse(readFileSync(join(root, "shared/facts.json"), "utf8"));
const CATEGORIES = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["best-practices", "Best practices"],
  ["seo", "SEO"],
];

async function fromPageSpeed() {
  const url = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  url.searchParams.set("url", `${facts.site.url}/`);
  for (const [id] of CATEGORIES) url.searchParams.append("category", id.toUpperCase().replace("-", "_"));
  if (process.env.PSI_KEY) url.searchParams.set("key", process.env.PSI_KEY);
  const response = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!response.ok) {
    console.error(`lighthouse: PageSpeed Insights answered ${response.status}; the page is unchanged`);
    process.exit(1);
  }
  const { lighthouseResult: lh } = await response.json();
  if (CATEGORIES.some(([id]) => typeof lh?.categories?.[id]?.score !== "number")) {
    console.error("lighthouse: PageSpeed Insights sent no full Lighthouse result; the page is unchanged");
    process.exit(1);
  }
  return CATEGORIES.map(([id]) => Math.round(lh.categories[id].score * 100));
}

const args = process.argv.slice(2);
if (args.length && (args.length !== 4 || args.some((a) => !/^\d{1,3}$/.test(a)))) {
  console.error("lighthouse: give all four scores, e.g. node scripts/lighthouse.mjs 97 100 100 100");
  process.exit(1);
}
const scores = args.length ? args : await fromPageSpeed();

const panel = `<figure class="pagespeed">
  <figcaption>Lighthouse scores</figcaption>
  <dl>
${CATEGORIES.map(([, label], i) => `    <div><dt>${label}</dt><dd>${scores[i]}</dd></div>`).join("\n")}
  </dl>
</figure>
`;

writeFileSync(PAGE, panel);
console.log("lighthouse:", Object.fromEntries(CATEGORIES.map(([, label], i) => [label, scores[i]])));
