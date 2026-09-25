import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './examples-gallery.module.css';
import { withBasePath } from '@/lib/base-path.mjs';

export function ExamplesGallery({ children }: { children: ReactNode }) {
  return <div className={`not-prose ${styles.gallery}`}>{children}</div>;
}

export function ExampleCard({ title, href, image, alt }: {
  title: string;
  href: string;
  image: string;
  alt?: string;
}) {
  return (
    <a className={styles.card} href={href} target="_blank" rel="noopener noreferrer">
      <div className={styles.preview}>
        <img
          src={withBasePath(image)}
          alt={alt ?? `${title} example with background UI, an engine scene, and foreground UI`}
          width={1440}
          height={900}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={styles.caption}>
        <span className={styles.title}>{title}</span>
        <span className={styles.action}>
          Open demo <ArrowUpRight size={16} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
      </div>
    </a>
  );
}
