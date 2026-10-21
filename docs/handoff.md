# Handoff

Last updated 2026-10-21. Read this, then `CLAUDE.md`, before working on the site.

## 2026-10-21

- **Layout.** Scripts and `projects.json` moved into `scripts/`; `ISSUES.md` and `ROADMAP.md` into `docs/`. Empty `src/` and `public/` folders (Astro leftovers) removed.
- **Code page.** Entries link to the GitHub repository, not the live site, for repositories listed under `linkToRepo` in `scripts/projects.json` (RSS Feeds). A homepage listed under neither `sites` nor `linkToRepo` gets a warning. `check.mjs` fails if a project link points at `github.io`.
- **Project list is no longer built by Cloudflare.** `npm run build` runs only `sync.mjs --check` and `check.mjs`. `projects.mjs` changes the page only when run locally, or via the monthly pull request from `.github/workflows/projects-update.yml`. With no terminal it no longer adds skills unless given `--yes`.
- **Cold review fixes.** Quote typos; `check.mjs` now checks CSS `url()`/`@import` hosts, JSON data scripts, and characters in `site/js`; `projects.mjs` reads its font ranges from `book.css`; Lighthouse script has a timeout; same-site links get no ↗.
- **Still open:** a Content-Security-Policy and other security headers; the résumé-only fonts (about 210 KB) still deployed; `.claude/hooks/pull.mjs` crashes if `origin/main` is missing or HEAD is detached (the sandbox blocked editing it); tests for `_redirects` targets, quote data and `photos.mjs` `sizes()`.

## Where things stand

- **Live.** The rebuild was merged to `main` on 2026-10-17 ([#1](https://github.com/samfeldstein/personal-site/pull/1), then [#2](https://github.com/samfeldstein/personal-site/pull/2) for the lightbox size fix and live scores) and is live at samfeldstein.xyz. Every push to `main` deploys; other branches get preview URLs.
- **State.** The site is the plain HTML rebuild, redesigned as an old book (see `docs/makeover-report.md`). The five audits are done and their clear-cut findings are fixed. Checks and all 40 tests pass.
- **Scores.** Live, mobile: performance 97–99 on all four pages; accessibility, best practices and SEO 100. Previews score SEO 66 because Cloudflare marks them noindex; that's expected.
- **Local preview.** `git checkout -- site/code/index.html && git checkout main && git pull && npm install && npx wrangler dev`. `node scripts/projects.mjs` rewrites `site/code/index.html` every run, so discard or commit it before the next pull.

## Later on 2026-10-17

- **Done and live:** Code is chapter 1 and Published Writing chapter 3 in the contents; "Sam Feldstein" everywhere (cover, copyright, structured data); copyright from 2023; the lightbox close button shows no focus box on pointer open and its × is centered in the keyboard focus ring; the gallery shows photo locations when the EXIF has them; `projects.json` `started` dates (Digital Notebook: Oct 2024; Presswork's Oct 2026 is correct); `projects.mjs` adds missing main languages to the skills line (Python, Vue and MDX added); README and report reworded from the owner's perspective.
- **Repo topics** updated on GitHub for personal-site and the Code page projects.
- **Backups.** A machine-wide launchd job on the owner's Mac pulls and clones every GitHub repo they own at login and daily. Installed and first run clean on 2026-10-17. Its source and the notebook write-up are kept in `docs/backup-repos/` (not used by the site). The first run flagged unpushed commits in trading-model, prairie-rose-arena-v2, presswork and notes for the owner to check.
- **Waiting:** photo locations (in `ISSUES.md`).

## Launch notes (2026-10-17)

1. **Build command.** Workers & Pages → personal-site → Settings → Build is `npm run build`, deploy `npx wrangler deploy`, non-production branches `npx wrangler versions upload`. It had still been `npx astro build`, which failed the first builds; build commands can only be set in the dashboard.
2. **Cloudflare dashboard.** Keep Web Analytics on (cookieless; Presswork kept it too) and Bot Fight Mode off (its injected script dropped Presswork's Lighthouse Best Practices to 81). The colophon says only "No cookies."
3. **Lighthouse.** Run it with `npx lighthouse <url> --form-factor=mobile` (from any folder; reports are gitignored) and record the home page with `node scripts/lighthouse.mjs <score> "<blocking>" "<speed index>" "<largest contentful paint>"`.

## Still to do (owner, deferred 2026-10-17)

- **Monthly project check.** `.github/workflows/projects-update.yml` runs `scripts/projects.mjs --yes` on the 1st of each month (or by hand from the Actions tab). If the Code page would change it opens a pull request, which is the approval; repositories waiting for a name are listed in the pull request or in an issue. To work, turn on Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" on GitHub. No deploy hook or secret is needed; if you made the old `CLOUDFLARE_DEPLOY_HOOK` secret or the Worker's deploy hook, delete them. GitHub turns off scheduled workflows after 60 days without commits and emails first; re-enable it from the Actions tab. (Not yet run.)
- **Owner checks not yet reported:** a real phone, and a screen reader pass if possible.

## Waiting on the owner

These need decisions or changes outside the repo; they're also in `ISSUES.md`.

- **GitHub repo description.** "My personal website, built with Astro" (personal-site) is out of date (`gh repo edit samfeldstein/personal-site --description "…"`). The lowercase "rss" stays. Project dates are repo creation dates unless `projects.json` `started` overrides them.
- **Photo captions (EXIF, in the photo editor, then `node scripts/photos.mjs`).** Alt-text typos: "it's head", "A group a people", "ocototillo with a mountains", "Robert's Western world", "Arches National Monument" (a National Park). Two Barksdale's photos share identical alt text.
- **Presswork's own structured data.** presswork.dev names its founder as a bare `Person`. Linking it to `{"@id": "https://samfeldstein.xyz/#person", "url": "https://samfeldstein.xyz/"}` would complete the connection from that side. That's in the presswork repo.
- **Contents numbering.** Chapters use 1–3, other links continue in lowercase roman (iv–viii). The design audit noted roman usually comes before arabic in a book. The owner chose the current scheme; revisit only if asked.
- **Gallery row size.** The design audit suggested smaller rows so three landscapes fit per row; kept larger because the owner asked for thumbnails at least twice the old size.

## Deploys

Decided 2026-10-17: keep Workers Builds (every push to `main` deploys after `npm run build` runs the checks). To make builds cheaper, drop the old image cache from history (see ROADMAP) and keep sharp and exiftool-vendored out of the build install.

## Optional follow-ups

- A Content-Security-Policy header (needs hashes for the two inline head scripts, which `scripts/sync.mjs` would compute).
- Redirects for the old `/_astro/*` gallery image URLs (87 rules), only for old image-search hits.
- A notification when a new repo is waiting for approval.
- The roadmap: an About the Author page, and résumés from the Find a Job project (`ROADMAP.md`).

## How the work was done

- **Plan, then build.** Plan before code, reviewed by subagents from separate angles; check every finding against the code before acting.
- **Verify in a browser.** Playwright with `/opt/node-tools/node_modules/playwright/index.mjs` and Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Lighthouse via `npx --yes lighthouse@12.8.2` with `CHROME_PATH` set. These paths are for the cloud container.
- **Subagents** worked in git worktrees on disjoint files; check that a worktree starts from this branch, not `main`.
- **Scratch files** go outside the repo; write screenshots with absolute paths.
