import "./server-intl-mock";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
}));

/**
 * This setup file runs for every test, including the few that opt into the
 * `node` environment because they exercise something Next only accepts the
 * platform's own globals for (see features/app-shell/middleware-gate.test.ts).
 * There is no DOM there, so everything below is guarded rather than assumed.
 */
const hasDom = typeof window !== "undefined";

// Without this, a component from one test is still mounted during the next one
// and queries silently match the wrong element — which reads as a flaky test.
afterEach(() => {
  if (hasDom) cleanup();
});

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
  if (!hasDom) return;

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
