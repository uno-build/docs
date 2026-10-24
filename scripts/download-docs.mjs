import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Copies the ui docs from skills/uno-ui of the ui repo into content/(ui), without the agent skill.
// Usage: node scripts/download-docs.mjs [git ref of uno-build/ui, default main | local ui checkout, e.g. ../ui]
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET_DIR = path.join(PROJECT_ROOT, 'content/(ui)');
const source = process.argv[2] ?? 'main';
const temporary_dir = await mkdtemp(path.join(PROJECT_ROOT, '.uno-ui-'));

try {
  let repo_dir = path.resolve(PROJECT_ROOT, source);

  if (!source.startsWith('.') && !path.isAbsolute(source)) {
    const response = await fetch(`https://codeload.github.com/uno-build/ui/tar.gz/${source}`);
    if (!response.ok) throw new Error(`Cannot download uno-build/ui@${source}: ${response.status}`);

    const tar = spawnSync('tar', ['-xz', '-C', temporary_dir], {
      input: Buffer.from(await response.arrayBuffer()),
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    if (tar.status !== 0) throw new Error(`Cannot extract uno-build/ui@${source}`);

    const [top_dir] = await readdir(temporary_dir);
    repo_dir = path.join(temporary_dir, top_dir);
  }

  const staging_dir = path.join(temporary_dir, 'docs');
  await cp(path.join(repo_dir, 'skills/uno-ui'), staging_dir, {
    recursive: true,
    filter: (file_path) => path.basename(file_path) !== 'SKILL.md',
  });
  await rm(TARGET_DIR, { recursive: true, force: true });
  await rename(staging_dir, TARGET_DIR);
} finally {
  await rm(temporary_dir, { recursive: true, force: true });
}

console.log(`Copied the ui docs from ${source} to ${TARGET_DIR}`);
