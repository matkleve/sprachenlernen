"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isDeployedVersionNewer, type AppVersionPayload } from "@/lib/app-version";
import { APP_PRIDE_VERSION } from "@/lib/pride-version";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

type AppUpdateContextValue = {
  stale: boolean;
  deployedLabel: string | null;
  reload: () => void;
  check: () => Promise<void>;
  checking: boolean;
  lastCheckedAt: number | null;
};

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);

/**
 * One update-check source for footer + profile — separate hook instances used
 * to drift (profile manual check did not repaint the footer label).
 * Contract: docs/specs/feature/app-update.md
 */
export function AppUpdateProvider({ children }: { children: ReactNode }) {
  const [stale, setStale] = useState(false);
  const [deployedLabel, setDeployedLabel] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/app-version", { cache: "no-store" });
      if (!response.ok) return;

      const payload = (await response.json()) as AppVersionPayload;
      const newer = isDeployedVersionNewer(APP_PRIDE_VERSION, payload.version);
      setStale(newer);
      setDeployedLabel(newer ? `v${payload.version}` : null);
      setLastCheckedAt(Date.now());
    } catch {
      // Fail silent — version label stays; no false prompt on offline.
    } finally {
      setChecking(false);
    }
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    void check();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void check();
      }
    };

    // iOS PWA resume often fires pageshow, not visibilitychange.
    const onPageShow = () => {
      void check();
    };

    const onFocus = () => {
      void check();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    const intervalId = window.setInterval(() => {
      void check();
    }, CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, [check]);

  const value = useMemo(
    () => ({ stale, deployedLabel, reload, check, checking, lastCheckedAt }),
    [stale, deployedLabel, reload, check, checking, lastCheckedAt],
  );

  return <AppUpdateContext.Provider value={value}>{children}</AppUpdateContext.Provider>;
}

export function useAppUpdateAvailable(): AppUpdateContextValue {
  const value = useContext(AppUpdateContext);
  if (!value) {
    throw new Error("useAppUpdateAvailable must be used within AppUpdateProvider");
  }
  return value;
}
