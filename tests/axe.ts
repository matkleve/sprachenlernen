import axe from "axe-core";
import { expect } from "vitest";

/**
 * Assert that a rendered container has no accessibility violations.
 *
 * `color-contrast` is disabled here on purpose: jsdom does no layout and
 * resolves no CSS custom properties, so the rule cannot see real colors and
 * would report nothing useful either way. Contrast is covered by
 * `npm run check:contrast`, which checks the tokens themselves.
 *
 * Remember what this can and cannot see (docs/TRAPS.md): it only inspects what
 * is currently rendered. If a surface opens in a dialog or menu, open it in the
 * test first — otherwise you are asserting that a closed dialog is accessible.
 */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });

  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.html).join("\n    ")}`,
  );

  expect(summary, `axe found ${summary.length} violation(s)`).toEqual([]);
}
