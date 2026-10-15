import { llmsGuides, readLlmsGuide } from '@/lib/llms';

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_req: Request, { params }: RouteContext<'/[name]/llms.txt'>) {
  const { name } = await params;

  return new Response(await readLlmsGuide(name));
}

export function generateStaticParams() {
  return Object.keys(llmsGuides).map((name) => ({ name }));
}
