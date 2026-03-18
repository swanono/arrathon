import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  bundle: true,
  platform: 'node',
  target: 'node20',
})
