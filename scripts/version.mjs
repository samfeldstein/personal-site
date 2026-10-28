/*
  Writes the commit being deployed to site/version.txt, so CI can tell when the
  live site has caught up with main. Runs at the end of `npm run build`; does
  nothing outside Cloudflare Workers Builds (no WORKERS_CI_COMMIT_SHA).
*/
import { writeFileSync } from "node:fs";

const sha = process.env.WORKERS_CI_COMMIT_SHA;
if (sha) writeFileSync(new URL("../site/version.txt", import.meta.url), `${sha}\n`);
