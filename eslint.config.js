import js from "@eslint/js";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default [
  {
    languageOptions: {
      globals: {
        console: "readonly",
        // Add other globals as needed
      },
    },
  },
  js.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
];
