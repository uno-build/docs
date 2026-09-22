import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'react' },
  },
  resolve: {
    dedupe: ['@uno/ui', 'react', 'react-reconciler'],
  },
})
