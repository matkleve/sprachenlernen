import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Dialog } from "./Dialog";

/**
 * The named check for docs/specs/component/dialog.md.
 *
 * What is NOT asserted here: focus trapping, Escape, `inert` behind the modal,
 * the backdrop. jsdom implements none of them and the shim in tests/setup.ts
 * deliberately does not fake them — a shim that pretended to would let a broken
 * modal pass this file. Those are browser-verified.
 */

const noop = () => {};

describe("Dialog", () => {
  it("is open when the prop says so, and closed when it does not", () => {
    const { rerender } = render(
      <Dialog open onClose={noop} title="Confirm">
        Body
      </Dialog>,
    );
    const dialog = document.querySelector("dialog")!;
    expect(dialog.open).toBe(true);

    rerender(
      <Dialog open={false} onClose={noop} title="Confirm">
        Body
      </Dialog>,
    );
    expect(dialog.open).toBe(false);
  });

  it("calls onClose when the element emits close (this is the Escape path)", () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Confirm" />);

    fireEvent(document.querySelector("dialog")!, new Event("close"));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on a backdrop click", async () => {
    // A backdrop click targets the <dialog> itself; content clicks target a
    // descendant. That comparison is the whole detection.
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Dialog open onClose={onClose} title="Confirm" />);

    await user.click(document.querySelector("dialog")!);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when the click lands on content", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Confirm">
        <p>Body text</p>
      </Dialog>,
    );

    await user.click(screen.getByText("Body text"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores the backdrop when dismissal is turned off", async () => {
    // Required for destructive confirmations: a stray click must never be the
    // thing that resolves "delete everything?".
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Dialog open onClose={onClose} title="Delete?" dismissOnBackdrop={false} />);

    await user.click(document.querySelector("dialog")!);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("is labelled by its title", () => {
    render(<Dialog open onClose={noop} title="Delete project" />);
    const dialog = document.querySelector("dialog")!;
    const labelId = dialog.getAttribute("aria-labelledby")!;

    expect(document.getElementById(labelId)?.textContent).toBe("Delete project");
  });

  it("is described by its description", () => {
    // The description is the sentence saying what the confirming action does.
    // Rendering it and not announcing it is the failure this component exists
    // to prevent, and nothing visual shows it.
    render(
      <Dialog open onClose={noop} title="Delete project" description="This cannot be undone." />,
    );
    const dialog = document.querySelector("dialog")!;
    const describedBy = dialog.getAttribute("aria-describedby")!;

    expect(document.getElementById(describedBy)?.textContent).toBe("This cannot be undone.");
  });

  it("omits aria-describedby entirely when there is no description", () => {
    // Absent, not empty — same rule Field applies to aria-invalid. An id
    // pointing at nothing makes some screen readers read the whole element.
    render(<Dialog open onClose={noop} title="Delete project" />);

    expect(document.querySelector("dialog")!.hasAttribute("aria-describedby")).toBe(false);
  });

  it("gives two mounted dialogs different title ids", () => {
    // Duplicate ids do not error. They make the accessible name ambiguous, so
    // one dialog ends up labelled by the other's title.
    render(
      <>
        <Dialog open onClose={noop} title="Delete project" />
        <Dialog open onClose={noop} title="Leave without saving" />
      </>,
    );
    const dialogs = document.querySelectorAll("dialog");
    const firstLabel = dialogs[0]!.getAttribute("aria-labelledby")!;
    const secondLabel = dialogs[1]!.getAttribute("aria-labelledby")!;

    expect(firstLabel).not.toBe(secondLabel);
    expect(document.getElementById(firstLabel)?.textContent).toBe("Delete project");
    expect(document.getElementById(secondLabel)?.textContent).toBe("Leave without saving");
  });

  it("has no accessibility violations while open", async () => {
    const { container } = render(
      <Dialog open onClose={noop} title="Confirm" description="This cannot be undone.">
        <p>Body</p>
      </Dialog>,
    );

    await expectNoA11yViolations(container);
  });
});
