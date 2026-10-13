import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative paths work on GitHub Pages, including project repositories.
  base: './',
  // GitHub Pages can publish this folder from main /docs (no Actions required).
  build: { outDir: 'docs', emptyOutDir: true },
});
