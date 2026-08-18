import { ShellPageLoading } from "@/features/app-shell/ShellPageLoading";

/**
 * Shown inside the signed-in shell while a page's server component loads.
 * The shell header stays visible — only the main region is pending.
 * Contract: docs/specs/feature/page-layout.transitions.md
 */
export default function AppLoading() {
  return <ShellPageLoading />;
}
