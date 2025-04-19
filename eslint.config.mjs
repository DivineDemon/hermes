// @ts-nocheck
import { configs } from "@typescript-eslint/eslint-plugin";
import { parseForESLint } from "@typescript-eslint/parser";
import checkFile from "eslint-plugin-check-file";
import PluginN from "eslint-plugin-n";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

export default defineConfig({
  languageOptions: {
    parser: parseForESLint,
  },
  extends: [
    "next/core-web-vitals",
    "next/typescript",
    "prettier",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  plugins: {
    "check-file": checkFile,
    n: PluginN,
    "@typescript-eslint": configs,
    "unused-imports": unusedImports,
  },
  rules: {
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: ".*",
      },
    ],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    "no-console": ["error"],
    eqeqeq: ["error"],
    "prefer-arrow-callback": ["error"],
    "prefer-template": ["error"],
    semi: ["error"],
    quotes: ["error", "double"],
    "n/no-process-env": ["error"],
    "check-file/filename-naming-convention": [
      "error",
      {
        "**/*.{ts,tsx}": "KEBAB_CASE",
      },
      {
        ignoreMiddleExtensions: true,
      },
    ],
    "check-file/folder-naming-convention": [
      "error",
      {
        "src/**/!^[.*": "KEBAB_CASE",
      },
    ],
  },
});
