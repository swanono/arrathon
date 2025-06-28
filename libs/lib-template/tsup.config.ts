import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  tsconfig: "./tsconfig.build.json",
});
