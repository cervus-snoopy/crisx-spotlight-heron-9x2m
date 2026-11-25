// Spotlight @crisxai5 — make.fun entrypoint (Node 22, standard library only).
//
// The entry is the X post itself: the house reads the post's public counts
// from X. All this program does is hand the post file over — it reads
// POST.json from the repository, checks it really names an X post, and
// copies it into the output directory where the gate reads it.
//
// POST.json holds {"url": "https://x.com/<handle>/status/<id>"} and nothing
// else. The URL is filled in once the post is published; until then the
// file carries the placeholder shape and the program refuses to copy it.
//
// Run outside the grader's container with:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { chmodSync, copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([A-Za-z0-9_]+)\/(status|i\/web\/status)\/(\d+)\/?$/;

function die(message: string): never {
  console.error(`spotlight: ${message}`);
  process.exit(1);
}

function outputPath(name: string): string {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  return join(OUTPUT_DIR, name);
}

function readPost(): { url: string } {
  let raw: string;
  try {
    raw = readFileSync(join(BOT_DIR, 'POST.json'), 'utf8');
  } catch {
    die('POST.json is missing from the repository root');
  }
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || !('url' in parsed)) {
    die('POST.json must be an object with a url field');
  }
  const url = (parsed as { url: unknown }).url;
  if (typeof url !== 'string' || !POST_URL.test(url)) {
    die(`POST.json url is not an X post address: ${String(url)}`);
  }
  return { url };
}

const post = readPost();
const target = outputPath('POST.json');
copyFileSync(join(BOT_DIR, 'POST.json'), target);
chmodSync(target, 0o644);
console.log(`handed in ${post.url}`);
