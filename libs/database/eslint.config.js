import globals from "globals";
import eslintJs from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import eslintImport from "eslint-plugin-import";

export default tseslint.config(
  {
    files: ["**/*.{js, cjs, mjs, ts, cts, mts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  eslintJs.configs.recommended, // base default eslintjs rules
  eslintImport.flatConfigs.recommended, //order imports
  { rules: { "import/no-unresolved": "off" } }, // conlicts with import using .js for ts files
  sonarjs.configs.recommended, // experimenting with this
  unicorn.configs.recommended, // experimenting with this one
  tseslint.configs.recommended, // ts eslint rules, might be shit
  eslintPluginPrettier, // to put last to overrride everything
  { ignores: ["dist", "node_modules"] },
);
