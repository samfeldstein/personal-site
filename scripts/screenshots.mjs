#!/usr/bin/env node
/*
  screenshots.mjs: makes the 1280x720 and 640x360 WebP screenshots in site/img/projects/.

    node scripts/screenshots.mjs            (all)
    node scripts/screenshots.mjs presswork   (only names containing the text)

  Uses headless Google Chrome (CHROME env var overrides the path) and sharp.
  Light mode, top of page, no cookie-banner handling. Alt text lives in
  scripts/projects.json.
*/
import { mkdirSync, existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "site/img/projects");
const SITES = {
  "postoley-dance-ensemble": "https://postoley.org/",
  "presswork-web-co": "https://presswork.dev/",
  "prairie-rose-arena": "https://prairierosearena.com/",
};
const CHROME = process.env.CHROME || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync);
if (!CHROME) { console.error("No Chrome found; set CHROME=/path/to/chrome"); process.exit(1); }

const only = process.argv[2];
const tmp = join(tmpdir(), `screenshots-${process.pid}`);
mkdirSync(tmp, { recursive: true });
mkdirSync(OUT, { recursive: true });
let failed = 0;

for (const [name, url] of Object.entries(SITES)) {
  if (only && !name.includes(only)) continue;
  const png = join(tmp, `${name}.png`);
  try {
    execFileSync(CHROME, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-color-profile=srgb",
      "--force-prefers-color-scheme=light", "--force-prefers-reduced-motion", "--window-size=1280,720", "--virtual-time-budget=10000",
      `--user-data-dir=${join(tmp, "profile-" + name)}`, `--screenshot=${png}`, url,
    ], { stdio: "ignore", timeout: 60000 });
    const file = join(OUT, `${name}.webp`);
    await sharp(png).resize(1280, 720, { fit: "cover", position: "top" }).webp({ quality: 60, effort: 6 }).toFile(file);
    await sharp(png).resize(640, 360, { fit: "cover", position: "top" }).webp({ quality: 60, effort: 6 }).toFile(join(OUT, `${name}-640.webp`));
    const kb = (statSync(file).size / 1024).toFixed(1);
    console.log(`${name}.webp ${kb} KB${kb > 60 ? "  (over 60 KB)" : ""}`);
  } catch (e) {
    failed++;
    console.error(`${name}: failed (${e.message.split("\n")[0]})`);
  }
}
rmSync(tmp, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
