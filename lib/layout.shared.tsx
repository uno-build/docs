import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Globe } from 'lucide-react'
import { appName } from './shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (
        <span className="uno-docs-brand" aria-label={appName}>
          <img src="/brand/logo.png" alt="" width={32} height={32} />
          <span>Docs</span>
        </span>
      ),
    },
    githubUrl: 'https://github.com/uno',
    links: [
      {
        type: 'icon',
        text: 'Web',
        label: 'uno website',
        url: 'https://uno.build/',
        icon: <Globe size={18} aria-hidden="true" />,
        external: true,
      },
      {
        type: 'icon',
        text: 'X (Twitter)',
        label: 'uno on X (Twitter)',
        url: 'https://x.com/unojs',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
          </svg>
        ),
        external: true,
      },
    ],
  }
}
