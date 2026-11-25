/*
  gallery-meta.mjs: the dependency-free part of photos.mjs, so tests can run
  without sharp or ExifTool. It turns a photo's ExifTool tags into what the
  gallery shows, and lists what's missing.

  Public: Title, Alt Text (XMP-iptcCore:AltTextAccessibility) and location
  (Sublocation, City, State, Country). Private: the caption (Description),
  which the site never reads.
*/
import { homedir } from "node:os";
import { join } from "node:path";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const defaultPhotosDir = () => join(homedir(), "Pictures/lightroom-photos/website-export");

export const place = (tags) => {
  const city = tags.City;
  const state = tags.State || tags["Province-State"];
  const country = tags.Country || tags["Country-PrimaryLocationName"];
  const venue = tags.Location || tags["Sub-location"];
  return [venue, city, state || (city ? country : ""), state || city ? "" : country].filter(Boolean).join(", ").replace(/'/g, "’");
};

export const shownTitle = (title) => String(title ?? "").trim().replace(/\s+\d+$/, "").replace(/'/g, "’");

export const photoDate = (tags) => tags.CreateDate || tags.DateTimeOriginal || null;

export const altText = (tags) => String(tags.AltTextAccessibility ?? "").trim();

export function missingMeta({ title, alt, place: where }) {
  const missing = [];
  if (!shownTitle(title)) missing.push("title");
  if (!String(alt ?? "").trim()) missing.push("Alt Text");
  if (!String(where ?? "").trim()) missing.push("location");
  return missing;
}
