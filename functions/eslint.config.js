const js = require("@eslint/js");
const {FlatCompat} = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.config({
    env: {
      es6: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 2018,
    },
    extends: ["eslint:recommended", "google"],
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", {allowTemplateLiterals: true}],
    },
    overrides: [
      {
        files: ["**/*.spec.*"],
        env: {
          mocha: true,
        },
        rules: {},
      },
    ],
    globals: {},
  }),
];

