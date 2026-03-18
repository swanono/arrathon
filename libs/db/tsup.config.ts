import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    schema: 'src/schema/index.ts',
  },
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  bundle: true,
  platform: 'node',
  target: 'node20',
  dts: true,
})
