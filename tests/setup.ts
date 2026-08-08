import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

// Without this, a component from one test is still mounted during the next one
// and queries silently match the wrong element — which reads as a flaky test.
afterEach(cleanup);

/**
 * jsdom does not implement `<dialog>`'s `showModal()` / `close()` — the methods
 * are simply absent, so calling one throws "not a function".
 *
 * This is a gap in the test environment, not a reason to avoid the native
 * element in production: `showModal()` is what gives us the focus trap, Escape
 * handling, the top layer and `inert` behind the modal, for free.
 *
 * The shim below covers only what the tests observe — the `open` attribute and
 * the `close` event. It deliberately does NOT emulate focus trapping or the
 * backdrop, because a shim that pretended to would let a broken modal pass.
 * Those belong in a browser test (docs/TRAPS.md § automated a11y checks).
 */
beforeAll(() => {
  // TypeScript types these methods as always present — that is the lib.dom
  // declaration, not a fact about jsdom. Widening to Partial is what lets us
  // ask whether the runtime actually has them.
  const proto = window.HTMLDialogElement?.prototype as Partial<HTMLDialogElement> | undefined;
  if (!proto || typeof proto.showModal === "function") return;

  const open = function (this: HTMLDialogElement) {
    this.open = true;
  };

  proto.showModal = open;
  proto.show = open;
  proto.close = function (this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return;
    this.open = false;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event("close"));
  };
});
