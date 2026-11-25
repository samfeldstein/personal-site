# Handoff

## Next (2026-11-25, personal-site session; not pushed)

**Claude next: the About the Author page** (ROADMAP.md, first item): a new chapter or back-matter page with a short bio, maybe a portrait from the photos, and contact links, built from `book.css`. It needs a design decision first (start skill step 4: pitch two or three options, copy drafted in chat with the `sams-voice` skill), so it suits its own session.

**Open items, grouped:**
- Sequence: (1) make samfeldstein.com the primary domain (ROADMAP), then (2) Presswork's roadmap item (i) uses the .com `#person` link (ISSUES points at it). Item 1 needs Sam in the Cloudflare dashboard.
- Can run in parallel with the About page: résumés from the Find a Job project (ROADMAP).
- Owner's call, no session needed until Sam decides: shrink the repo (history rewrite, ROADMAP).
- Watch only: gallery image URLs changed (ISSUES), the Cloudflare dashboard settings (ISSUES).

**Waiting on Sam:** push (command at wrap-up). Nothing else.

**Done 2026-11-25:**
- Private captions: every photo's Alt Text and location are set in Lightroom (Claude wrote them into the originals in `~/Pictures/lightroom-photos` after Sam's Cmd+S; Sam read them back). Lightroom exports to `~/Pictures/lightroom-photos/website-export`, outside the repo; `photos/` is untracked and `/photos/` ignored. `scripts/photos.mjs` reads Alt Text (never the caption) and refuses a photo missing title, Alt Text or location; `check.mjs` checks the gallery. 89 photos, all located; four new ones (two Andrew Bird photos synced from Sam's phone, moved by Sam out of Lightroom's `Mobile Downloads.lrdata`).
- Held changes from the photo walk-through: the 10 résumé PDFs and their `_headers` entry deleted; the GitHub repo description set by Sam; Presswork roadmap item (i) added; arches-national-monument removed.
- Checks: plan reviewed three times, one clean cold round, a medium code review (one nit fixed, one pre-existing sort edge case left: an unparsed date string would sort unpredictably; no current photo hits it). On the local photos page: devices.mjs (13 profiles, no sideways scroll), axe at 375 and 1440 in light and dark (0 violations), the keyboard walk (all stops outlined), Lighthouse mobile 95/100/100/100, a phone-width check that the longest location fits its thumbnail. iOS Simulator skipped (content in existing styles; WebKit screenshots ran in audit.mjs). Firefox didn't launch under Playwright, as before.
- Private details (captions, home locations, GPS) are kept out of tracked files; a working doc that held them was dropped from the unpushed history before any push.

**Sandbox notes:** the Lightroom folder was reached with the directory tool (`~/Pictures/lightroom-photos`); Playwright (devices.mjs, audit.mjs) and the preview server ran in the Terminal panel; `gh` ran in Sam's terminal. Photos synced from Lightroom mobile live in `~/Pictures/Lightroom/Mobile Downloads.lrdata`, which only Lightroom may change.

- Optional, owner's call: retake ReGreen's screenshot by hand at 1920×1080 so its scale matches the others (it's 16:9 already, so it lines up).

## Where things stand

- **Live.** The rebuild was merged to `main` on 2026-10-17 ([#1](https://github.com/samfeldstein/personal-site/pull/1), then [#2](https://github.com/samfeldstein/personal-site/pull/2) for the lightbox size fix and live scores) and is live at samfeldstein.xyz. Every push to `main` deploys; other branches get preview URLs.
- **State.** The site is the plain HTML rebuild, redesigned as an old book (see `docs/makeover-report.md`). The five audits are done and their clear-cut findings are fixed. Checks and all 40 tests pass.
- **Scores.** Live, mobile: performance 97–99 on all four pages; accessibility, best practices and SEO 100. Previews score SEO 66 because Cloudflare marks them noindex; that's expected.
- **Local preview.** `git checkout -- site/code/index.html && git checkout main && git pull && npm install && npx wrangler dev`. `node scripts/projects.mjs` rewrites `site/code/index.html` every run, so discard or commit it before the next pull.

## Launch notes (2026-10-17)

1. **Build command.** Workers & Pages → personal-site → Settings → Build is `npm run build`, deploy `npx wrangler deploy`, non-production branches `npx wrangler versions upload`. It had still been `npx astro build`, which failed the first builds; build commands can only be set in the dashboard.
2. **Cloudflare dashboard.** Keep Web Analytics on (cookieless; Presswork kept it too) and Bot Fight Mode off (its injected script dropped Presswork's Lighthouse Best Practices to 81). The colophon says only "No cookies."
3. **Lighthouse.** Run it with `npx lighthouse <url> --form-factor=mobile` (from any folder; reports are gitignored) and record the home page with `node scripts/lighthouse.mjs <score> "<blocking>" "<speed index>" "<largest contentful paint>"`.

## Still to do (owner, deferred 2026-10-17)

- **Monthly project check.** `.github/workflows/projects-update.yml` runs `scripts/projects.mjs --yes` on the 1st of each month (or by hand from the Actions tab). If the Code page would change it opens a pull request, which is the approval; repositories waiting for a name are listed in the pull request or in an issue. To work, turn on Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" on GitHub. No deploy hook or secret is needed; if you made the old `CLOUDFLARE_DEPLOY_HOOK` secret or the Worker's deploy hook, delete them. GitHub turns off scheduled workflows after 60 days without commits and emails first; re-enable it from the Actions tab. (Not yet run.)
- **Owner checks not yet reported:** a real phone, and a screen reader pass if possible.

## Waiting on the owner

These need decisions or changes outside the repo; they're also in `ISSUES.md`.

- **Presswork's own structured data.** Now Presswork's roadmap item (i).
- **Contents numbering.** Chapters use 1–3, other links continue in lowercase roman (iv–viii). The design audit noted roman usually comes before arabic in a book. The owner chose the current scheme; revisit only if asked.
- **Gallery row size.** The design audit suggested smaller rows so three landscapes fit per row; kept larger because the owner asked for thumbnails at least twice the old size.

## Deploys

Decided 2026-10-17: keep Workers Builds (every push to `main` deploys after `npm run build` runs the checks). To make builds cheaper, drop the old image cache from history (see ROADMAP) and keep sharp and exiftool-vendored out of the build install.

## Optional follow-ups

- A Content-Security-Policy header (needs hashes for the two inline head scripts, which `scripts/sync.mjs` would compute).
- Redirects for the old `/_astro/*` gallery image URLs (87 rules), only for old image-search hits.
- A notification when a new repo is waiting for approval.
- Tests for the `others` merge in `projects.mjs`.
- The roadmap: an About the Author page, and résumés from the Find a Job project (`ROADMAP.md`).

## How the work was done

- **Plan, then build.** Plan before code, reviewed by subagents from separate angles; check every finding against the code before acting.
- **Verify in a browser.** Playwright with `/opt/node-tools/node_modules/playwright/index.mjs` and Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Lighthouse via `npx --yes lighthouse@12.8.2` with `CHROME_PATH` set. These paths are for the cloud container.
- **Subagents** worked in git worktrees on disjoint files; check that a worktree starts from this branch, not `main`.
- **Scratch files** go outside the repo; write screenshots with absolute paths.
