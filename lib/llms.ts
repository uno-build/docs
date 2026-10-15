import { readFile } from 'node:fs/promises';
import path from 'node:path';

// The handwritten guide of each package for coding agents: served at /<name>/llms.txt and listed in /llms.txt.
export const llmsGuides: Record<string, string> = {
  ui: 'content/(ui)/llms.txt',
};

export function readLlmsGuide(name: string) {
  return readFile(path.join(process.cwd(), llmsGuides[name]!), 'utf8');
}
