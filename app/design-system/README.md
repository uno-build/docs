# UNO documentation theme

Source: `uno/design/uno-design-system` (local design-system export).

`app/global.css` imports the UNO tokens, followed by `docs.css`, which maps the
semantic tokens to Fumadocs and adapts the documentation components.

- Token CSS is preserved from the source, except the remote font imports in
  `typography.css`. The provided IBM Plex Sans and JetBrains Mono variable fonts
  are self-hosted in `public/fonts`, with their OFL licenses.
- Current tokens and the radius specimen take precedence over outdated README
  examples: radii are 1/2/3/4/5/6px. IBM Plex Sans is both display and body.
- The theme provider sets both `class` (Fumadocs and syntax highlighting) and
  `data-theme` (UNO). System preference and the existing theme controls work
  together. Elevation loads before dark semantics to preserve dark shadows.
- The original gradient logo appears in the responsive navigation. There is no
  additional decorative gradient in the reading surface.
- The Fumadocs layout, navigation, search, keyboard interactions and MDX content
  are retained. Demo scenes retain their own example styling.

Edit semantic tokens for palette changes, `typography.css` for the type scale,
and `docs.css` for the integration with Fumadocs. Do not edit `node_modules`.
