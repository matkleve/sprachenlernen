/**
 * Shared interaction classes for every clickable primitive.
 * Contract: docs/specs/system/interaction-inventory.md
 *
 * One source for press, focus, motion, hit-target expansion, and pending
 * visuals — so a fix here fixes the whole app.
 */

/** Reliable `:active` on touch — no 300ms delay. */
export const touchTarget = "touch-manipulation";

/** Name the properties; never animate every CSS property at once. */
export const interactionMotion =
  "transition-[background-color,box-shadow,transform,border-color,color] duration-150 ease-out-soft";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** Default press — scale down slightly. */
export const pressScale = "active:translate-y-0 active:scale-[0.98]";

/** Stronger press for large surfaces and icon chips where scale alone is subtle. */
export const pressFill = "active:bg-accent-soft active:border-line-strong";

export const hoverLift = "hover:-translate-y-px hover:shadow-raised";

export const disabledState =
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0";

/** Async in flight — duplicate taps ignored. */
export const pendingBusy = "pointer-events-none opacity-70";

/** Navigation pending on icon-only controls — ring stays visible without a spinner. */
export const pendingNavRing =
  "ring-2 ring-accent ring-offset-2 ring-offset-canvas";

/** Relative positioning anchors the hit-area pseudo-element. */
export const hitAreaAnchor = "relative";

/** Transparent expansion to 44px target without changing the visual box. */
export const hitAreaPseudo = "after:absolute after:inset-x-0 after:content-['']";

export const hitAreaExpandSm = "after:-inset-y-1.5";
export const hitAreaExpandMd = "after:-inset-y-0.5";
/** Header / inline destination links — 44px+ target with side bleed into gaps. */
export const hitAreaExpandNav = "after:-inset-y-1.5 after:-inset-x-1";
/** Bottom pill segments — full column height plus horizontal bleed between segments. */
export const hitAreaExpandNavPill = "after:-inset-x-2 after:-inset-y-2";

/** Semibold label + heavier icon stroke on clickable controls. */
export const interactiveEmphasis = "font-semibold [&_svg]:stroke-[2.5]";

/** Accent fill when a nav link is the active route (`NavLink`, `ActionLink`). */
export const navCurrentFill =
  "bg-accent text-accent-ink shadow-soft hover:bg-accent-deep hover:text-accent-ink";

/** Accent fill for bordered icon chips (`IconLink` current / emphasized). */
export const iconChipCurrentFill =
  "bg-accent text-accent-ink border-accent shadow-soft hover:bg-accent-deep hover:text-accent-ink";

/** Composed stacks used by multiple primitives. */
export const interactiveBase = [
  hitAreaAnchor,
  touchTarget,
  interactionMotion,
  focusRing,
  pressScale,
  disabledState,
] as const;

export const cardInteractive = [
  touchTarget,
  interactionMotion,
  focusRing,
  pressScale,
  hoverLift,
] as const;

/** Card-shaped pressables — lift on hover, accent fill on press. Shared by SurfaceLink, PressableCard, LanguageListRow. */
export const cardPressable = [...cardInteractive, pressFill] as const;
