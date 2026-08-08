"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A modal built on the native <dialog>. Contract: docs/specs/component/dialog.md
 *
 * `showModal()` gives us, from the platform: a focus trap, Escape to close,
 * the top layer (so no z-index fight is possible), `inert` on everything
 * behind it, and a styleable ::backdrop. Every one of those is a well-known
 * way to get a hand-rolled modal wrong, and none of them costs us a line here.
 */
export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions row. Put the confirming action last — it reads as the endpoint. */
  footer?: ReactNode;
  /** Clicking the backdrop closes. Turn off for destructive confirmations. */
  dismissOnBackdrop?: boolean;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissOnBackdrop = true,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // Drive the element from the prop rather than mirroring its state back:
    // one source of truth, so the DOM cannot disagree with React.
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  /*
   * FIGHTING: jsx-a11y does not model <dialog> as interactive, so the backdrop
   * click handler below trips two rules asking for a keyboard equivalent. One
   * already exists and the linter cannot see it — Escape is handled by the
   * platform, which emits `close`, which is wired to onClose. A keydown
   * listener here would be a second path to the same outcome.
   * REMOVE when jsx-a11y learns about <dialog>.
   */
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      // Fires for Escape too, which is why closing is handled here and not in
      // a keydown listener — the platform already emits the event.
      onClose={onClose}
      onClick={(event) => {
        if (!dismissOnBackdrop) return;
        // A backdrop click targets the <dialog> itself; a click on the content
        // targets a descendant. That comparison is the whole detection.
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line",
        "bg-surface p-6 text-ink shadow-raised",
        "backdrop:bg-ink/40",
        className,
      )}
    >
      <h2 id="dialog-title" className="text-lg font-semibold text-ink">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
      {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
    </dialog>
  );
}
