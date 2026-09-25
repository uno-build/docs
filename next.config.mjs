import { createMDX } from 'fumadocs-mdx/next';
import { basePath } from './lib/base-path.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  basePath,
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
};

export default withMDX(config);
