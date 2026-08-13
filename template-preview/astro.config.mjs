import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  server: { port: 4333 },
  vite: {
    server: {
      fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
    },
  },
});
