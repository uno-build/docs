import { createMDX } from 'fumadocs-mdx/next';
import { fileURLToPath } from 'node:url';
import { basePath } from './lib/base-path.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  basePath,
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
};

export default withMDX(config);
