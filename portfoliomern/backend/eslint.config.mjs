import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow unused vars that start with _ (common pattern for
      // Express middleware params like _req, _next)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow `any` with a warning — we'll tighten this over time
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Express type augmentation requires namespace syntax — allow it
  // in the types directory where declaration merging lives.
  {
    files: ["src/types/**/*.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  }
);
