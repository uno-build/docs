import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './examples-gallery.module.css';
import { withBasePath } from '@/lib/base-path.mjs';

export function ExamplesGallery({ children }: { children: ReactNode }) {
  return <div className={`not-prose ${styles.gallery}`}>{children}</div>;
}

export function ExampleCard({ title, href, sourceHref, image, alt }: {
  title: string;
  href: string;
  sourceHref: string;
  image: string;
  alt?: string;
}) {
  return (
    <div className={styles.card}>
      <a className={styles.preview} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} demo (opens in a new tab)`}>
        <img
          src={withBasePath(image)}
          alt={alt ?? `${title} example with background UI, an engine scene, and foreground UI`}
          width={1440}
          height={900}
          loading="lazy"
          decoding="async"
        />
      </a>
      <div className={styles.caption}>
        <span className={styles.title}>{title}</span>
        <a className={styles.action} href={sourceHref} target="_blank" rel="noopener noreferrer">
          Source code <ArrowUpRight size={16} aria-hidden="true" />
          <span className="sr-only"> for {title} (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
