import { APP_VERSION_LABEL } from "@/lib/pride-version";

/**
 * Tiny build label under the mobile destination pill.
 * Contract: docs/specs/feature/mobile-nav-v2.md, docs/VERSIONING.md
 */
export function AppVersionLabel() {
  return (
    <p className="text-shell-version leading-none text-muted tabular-nums">{APP_VERSION_LABEL}</p>
  );
}
