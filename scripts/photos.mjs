#!/usr/bin/env node
/*
  photos.mjs: builds the gallery on /photos/ from Lightroom's exports.

  Lightroom Classic exports the Website collection to a folder outside this
  repo (PHOTOS_DIR, default ~/Pictures/lightroom-photos/website-export), so
  the exports and their private captions and GPS never reach GitHub. Run it
  after Lightroom exports:

    npm install          (once; installs sharp and exiftool-vendored)
    node scripts/photos.mjs

  It reads each photo's Title, Alt Text, capture date and location
  (Sublocation, City, State, Country) with ExifTool. The caption
  (Description) is private and never read. If any photo lacks a title, Alt
  Text or location, it lists them and stops before changing anything.
  Otherwise it writes WebP copies at the widths below into site/img/photos/
  (only the ones that don't exist yet; sharp writes no metadata), deletes
  copies of photos that are gone, and rewrites the gallery between the
  <!-- gallery --> markers in site/photos/index.html, newest first.

  A changed photo that keeps its file name keeps its old WebPs; delete
  site/img/photos/<name>-*.webp first to regenerate them.
*/
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, statSync } from "node:fs";
import { join, parse, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ExifTool } from "exiftool-vendored";
import { MONTHS, altText, defaultPhotosDir, missingMeta, photoDate, place, shownTitle } from "./gallery-meta.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const SOURCE = process.env.PHOTOS_DIR || defaultPhotosDir();
const OUT = join(root, "site/img/photos");
const PAGE = join(root, "site/photos/index.html");
const WIDTHS = [256, 480, 691, 936, 1150, 1382, 1640, 1850, 2048];
const ROW = { small: 160, wide: 320, vw: 22, from: 728, to: 1455, stretch: 1.3 };
const sizes = (ratio) => {
  const r = ratio * ROW.stretch;
  const phone = r * ROW.small;
  return `(min-width: ${ROW.to}px) ${Math.round(r * ROW.wide)}px, (min-width: ${ROW.from}px) ${(r * ROW.vw).toFixed(1)}vw, ${phone > 340 ? "100vw" : `${Math.round(phone)}px`}`;
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

if (!existsSync(SOURCE) || !statSync(SOURCE).isDirectory()) {
  console.error(`photos: no export folder at ${SOURCE}; export the Website collection from Lightroom there, or set PHOTOS_DIR. Nothing changed.`);
  process.exit(1);
}
const html = readFileSync(PAGE, "utf8");
const re = /(<!-- gallery -->)[\s\S]*?(\n\s*<!-- \/gallery -->)/;
if (!re.test(html)) {
  console.error("photos: site/photos/index.html is missing the <!-- gallery --> ... <!-- /gallery --> markers; nothing changed");
  process.exit(1);
}
const files = readdirSync(SOURCE).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
if (!files.length) {
  console.error(`photos: no photos found in ${SOURCE}; nothing changed`);
  process.exit(1);
}

const exiftool = new ExifTool();
const photos = [];
const problems = [];
try {
  for (const file of files) {
    const path = join(SOURCE, file);
    let tags;
    try {
      tags = await exiftool.read(path);
    } catch (err) {
      problems.push(`${file}: couldn't read its metadata (${err.message})`);
      continue;
    }
    const date = photoDate(tags);
    const photo = {
      file,
      path,
      name: parse(file).name,
      title: String(tags.Title ?? "").trim(),
      shown: shownTitle(tags.Title),
      month: date?.year ? `${MONTHS[date.month - 1]} ${date.year}` : "",
      date: date || "Unknown date",
      alt: altText(tags),
      place: place(tags),
    };
    const missing = missingMeta(photo);
    if (missing.length) problems.push(`${file}: no ${missing.join(", ")}`);
    photos.push(photo);
  }
} finally {
  await exiftool.end();
}

if (problems.length) {
  console.error(`photos: fix these in Lightroom (Title, Alt Text, and a location: Sublocation, City, State, or Country), export again, and rerun. Nothing changed.\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
for (const p of photos) {
  const meta = await sharp(p.path).metadata();
  [p.width, p.height] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  p.widths = WIDTHS.filter((w) => w <= p.width);
  if (p.widths.length < WIDTHS.length && !p.widths.includes(p.width)) p.widths.push(p.width);
  for (const w of p.widths) {
    const out = join(OUT, `${p.name}-${w}.webp`);
    if (existsSync(out)) continue;
    await sharp(p.path).rotate().resize({ width: w }).webp().toFile(out);
    console.log(`wrote img/photos/${p.name}-${w}.webp`);
  }
}

photos.sort((a, b) => {
  if (a.date === "Unknown date" && b.date === "Unknown date") return 0;
  if (a.date === "Unknown date") return 1;
  if (b.date === "Unknown date") return -1;
  return new Date(b.date) - new Date(a.date);
});

const keep = new Set(photos.flatMap((p) => p.widths.map((w) => `${p.name}-${w}.webp`)));
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".webp") && !keep.has(f)) {
    unlinkSync(join(OUT, f));
    console.log(`deleted img/photos/${f}`);
  }
}

const img = (p, i) => {
  const url = (w) => `/img/photos/${p.name}-${w}.webp`;
  const priority = i === 0 ? ' loading="eager" decoding="async" fetchpriority="high"' : ' loading="lazy" decoding="async"';
  const info = `<span class="thumb-info"><span class="thumb-title">${esc(p.shown)}</span>${p.place ? `<span class="thumb-place">${esc(p.place)}</span>` : ""}${p.month ? `<span class="thumb-date">${p.month}</span>` : ""}</span>`;
  const ratio = +(p.width / p.height).toFixed(3);
  return `      <li style="--r: ${ratio}"><a class="thumb" href="${url(p.widths.at(-1))}" data-title="${esc(p.shown)}"${p.place ? ` data-place="${esc(p.place)}"` : ""} data-date="${p.month}"><img src="${url(p.widths[1] ?? p.widths[0])}" srcset="${p.widths.map((w) => `${url(w)} ${w}w`).join(", ")}" sizes="${sizes(ratio)}" alt="${esc(p.alt)}"${priority} width="${p.width}" height="${p.height}">${info}</a></li>`;
};

writeFileSync(PAGE, html.replace(re, (_, open, close) => `${open}\n${photos.map(img).join("\n")}${close}`));
console.log(`photos: ${photos.length} photos in the gallery`);
