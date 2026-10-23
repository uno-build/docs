import { createGetUrl } from 'fumadocs-core/source'
import { withBasePath } from './base-path.mjs'

export const appName = 'uno'
export const docsRoute = '/'
export const docsImageRoute = '/og/docs'

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'uno',
  repo: 'ui',
  branch: 'main',
}

const getImageUrl = createGetUrl(docsImageRoute)

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png']

  return { segments, url: withBasePath(getImageUrl(segments, page.locale)) }
}
