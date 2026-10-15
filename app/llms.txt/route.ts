import { docsLlms } from '@/lib/source';
import { withBasePath } from '@/lib/base-path.mjs';
import { llmsGuides, readLlmsGuide } from '@/lib/llms';

export const revalidate = false;

// Each guide starts with its `# title` and a `> summary` line.
export async function GET() {
  const guides = await Promise.all(
    Object.keys(llmsGuides).map(async (name) => {
      const [title, , summary] = (await readLlmsGuide(name)).split('\n');
      return `- [${title!.slice(2)}](${withBasePath(`/${name}/llms.txt`)}): ${summary!.slice(2)}`;
    }),
  );
  const index = (await docsLlms.index()).replace(/^# /, '## ');

  return new Response(
    `# uno\n\n> One guide per package for coding agents, followed by the index of every docs page.\n\n## Guides\n\n${guides.join('\n')}\n\n${index}`,
  );
}
