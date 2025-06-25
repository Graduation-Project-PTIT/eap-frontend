// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended", // Add a11y recommendations
    "prettier", // Make sure this is always the last configuration in the extends array.
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "prettier.config.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react/react-in-jsx-scope": "off", // Not needed for React 17+ with new JSX transform
    "@typescript-eslint/no-explicit-any": "off", // Disable if you need more flexibility with `any`
  },
};
