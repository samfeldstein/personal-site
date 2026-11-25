import { test } from "node:test";
import assert from "node:assert/strict";
import { altText, missingMeta, photoDate, place, shownTitle } from "../scripts/gallery-meta.mjs";

test("place puts Lightroom's Sublocation before the city and state", () => {
  assert.equal(place({ Location: "Fillmore Auditorium", City: "Denver", State: "CO" }), "Fillmore Auditorium, Denver, CO");
  assert.equal(place({ "Sub-location": "Robert's Western World", City: "Nashville", "Province-State": "TN" }), "Robert’s Western World, Nashville, TN");
});

test("place shows a park with a state and no city, or a region alone", () => {
  assert.equal(place({ Location: "Custer State Park", State: "SD" }), "Custer State Park, SD");
  assert.equal(place({ Location: "Southern California" }), "Southern California");
  assert.equal(place({ City: "Paris", Country: "France" }), "Paris, France");
  assert.equal(place({}), "");
});

test("shownTitle drops a trailing number and curls apostrophes", () => {
  assert.equal(shownTitle("Barksdale's 2"), "Barksdale’s");
  assert.equal(shownTitle("  Andrew Bird  "), "Andrew Bird");
  assert.equal(shownTitle("3"), "3");
  assert.equal(shownTitle(undefined), "");
});

test("photoDate falls back to DateTimeOriginal when CreateDate is missing", () => {
  const original = { year: 2021, month: 1 };
  assert.equal(photoDate({ DateTimeOriginal: original }), original);
  assert.equal(photoDate({ CreateDate: "c", DateTimeOriginal: original }), "c");
  assert.equal(photoDate({}), null);
});

test("altText reads Alt Text, never the private caption", () => {
  assert.equal(altText({ AltTextAccessibility: "  A cat. " }), "A cat.");
  assert.equal(altText({ Description: "Taken at my parents' house." }), "");
});

test("missingMeta lists each empty field", () => {
  assert.deepEqual(missingMeta({ title: "Cat", alt: "A cat.", place: "Marfa, TX" }), []);
  assert.deepEqual(missingMeta({ title: " ", alt: "", place: "" }), ["title", "Alt Text", "location"]);
  assert.deepEqual(missingMeta({ title: "Cat 2", alt: "  ", place: "Marfa, TX" }), ["Alt Text"]);
});
