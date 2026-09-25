export const basePath = '/docs';

/** @param {string} path */
export function withBasePath(path) {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${basePath}${path}`;
}
