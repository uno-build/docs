import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import type { Node } from 'fumadocs-core/page-tree';

const classPages = new Set([
  '/api/resources-webgpu',
  '/api/ui',
  '/api/ui-world-space',
  '/api/node',
]);

function labelClasses(node: Node): Node {
  if (node.type === 'folder') {
    return { ...node, children: node.children.map(labelClasses) };
  }
  if (node.type !== 'page' || !classPages.has(node.url.replace(/\/$/, ''))) {
    return node;
  }
  return {
    ...node,
    name: (
      <span key={node.url} className="inline-flex items-center gap-2">
        {node.name}
        <span className="rounded border border-fd-border px-1 font-mono text-[10px] font-normal text-fd-muted-foreground">
          class
        </span>
      </span>
    ),
  };
}

export default function Layout({ children }: LayoutProps<'/'>) {
  const tree = source.getPageTree();
  return (
    <DocsLayout tree={{ ...tree, children: tree.children.map(labelClasses) }} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
