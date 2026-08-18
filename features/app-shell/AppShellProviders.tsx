"use client";

import type { ReactNode } from "react";

import { NavigationHistoryTracker } from "./NavigationHistoryTracker";
import { AppUpdateProvider } from "./AppUpdateProvider";

/** Client providers for the signed-in shell. */
export function AppShellProviders({ children }: { children: ReactNode }) {
  return (
    <AppUpdateProvider>
      <NavigationHistoryTracker />
      {children}
    </AppUpdateProvider>
  );
}
