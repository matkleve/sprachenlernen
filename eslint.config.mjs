import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended"),
  {
    rules: {
      // An icon-only button with no accessible name is invisible to screen
      // readers, and it is the single easiest a11y bug to ship.
      "jsx-a11y/control-has-associated-label": "warn",

      // File length is not a style preference — it is a measured cause of
      // hard-to-diagnose bugs. In the codebase these limits come from, a
      // retrospective put roughly two thirds of the difficulty of a long bug
      // hunt down to file length alone: state ends up distributed across a file
      // nobody can hold in their head, and the scope of each branch stops being
      // obvious. 300 is where that started biting there.
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": [
        "warn",
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    // Tests are legitimately long: one case per acceptance criterion, and
    // splitting them to satisfy a limit hides which spec they cover.
    files: ["**/*.test.{ts,tsx}", "tests/**"],
    rules: { "max-lines": "off", "max-lines-per-function": "off" },
  },
];

export default config;
