// eslint.config.js
import js from "@eslint/js";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default [
  js.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  // You can add custom rules or overrides here if you want
];
