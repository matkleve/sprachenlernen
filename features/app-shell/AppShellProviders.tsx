"use client";

import type { ReactNode } from "react";

import { AppUpdateProvider } from "./AppUpdateProvider";

/** Client providers for the signed-in shell. */
export function AppShellProviders({ children }: { children: ReactNode }) {
  return <AppUpdateProvider>{children}</AppUpdateProvider>;
}
