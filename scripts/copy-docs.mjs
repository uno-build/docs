import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const [sourceArgument, targetArgument] = process.argv.slice(2);

if (!sourceArgument || !targetArgument) {
  throw new Error(
    'Usage: node scripts/copy-docs.mjs <source> <target>',
  );
}

const sourceDir = path.resolve(projectRoot, sourceArgument);
const targetDir = path.resolve(projectRoot, targetArgument);
const sectionTitle = path.basename(targetDir);
const contentDir = path.resolve(projectRoot, 'content');
const targetRelative = path.relative(contentDir, targetDir);

if (targetRelative.startsWith('..') || path.isAbsolute(targetRelative)) {
  throw new Error(`Target must be inside ${contentDir}`);
}
if (!(await stat(sourceDir)).isDirectory()) {
  throw new Error(`Source is not a directory: ${sourceDir}`);
}

function titleFromPath(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replaceAll('-', ' ')
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
}

function prepareMarkdown(markdown, filePath) {
  const frontmatter = markdown.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/,
  );
  if (frontmatter && /^title\s*:/m.test(frontmatter[1])) return markdown;

  const body = frontmatter ? markdown.slice(frontmatter[0].length) : markdown;
  const heading = body.match(/^#\s+(.+?)\s*$/m);
  const title = heading?.[1].trim() ?? titleFromPath(filePath);
  const content = (heading ? body.replace(heading[0], '') : body).trimStart();
  const existingFrontmatter = frontmatter ? `${frontmatter[1]}\n` : '';

  return `---\n${existingFrontmatter}title: ${JSON.stringify(title)}\n---\n\n${content.trimEnd()}\n`;
}

let documentCount = 0;

async function copyDirectory(fromDir, toDir, relativeDir = '') {
  await mkdir(toDir, { recursive: true });

  for (const entry of await readdir(fromDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    const sourcePath = path.join(fromDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, path.join(toDir, entry.name), relativePath);
      continue;
    }

    if (relativePath === 'meta.json') continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (extension === '.md' || extension === '.mdx') {
      const outputName = /^readme\.(md|mdx)$/i.test(entry.name)
        ? `index${extension}`
        : entry.name;
      const markdown = await readFile(sourcePath, 'utf8');
      await writeFile(
        path.join(toDir, outputName),
        prepareMarkdown(markdown, relativePath),
      );
      documentCount += 1;
      continue;
    }

    await copyFile(sourcePath, path.join(toDir, entry.name));
  }
}

const temporaryDir = await mkdtemp(path.join(contentDir, '.docs-copy-'));

try {
  await copyDirectory(sourceDir, temporaryDir);
  await writeFile(
    path.join(temporaryDir, 'meta.json'),
    `${JSON.stringify(
      {
        title: sectionTitle,
        root: true,
        pages: ['index', '...'],
      },
      null,
      2,
    )}\n`,
  );

  await rm(targetDir, { recursive: true, force: true });
  await rename(temporaryDir, targetDir);
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}

console.log(`Copied ${documentCount} documents from ${sourceDir} to ${targetDir}`);
