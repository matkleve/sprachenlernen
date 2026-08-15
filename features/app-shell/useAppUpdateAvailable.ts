"use client";

import { useCallback, useEffect, useState } from "react";

import { isDeployedVersionNewer, type AppVersionPayload } from "@/lib/app-version";
import { APP_PRIDE_VERSION } from "@/lib/pride-version";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/** Contract: docs/specs/feature/app-update.md */
export function useAppUpdateAvailable() {
  const [stale, setStale] = useState(false);
  const [deployedLabel, setDeployedLabel] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/app-version", { cache: "no-store" });
      if (!response.ok) return;

      const payload = (await response.json()) as AppVersionPayload;
      const newer = isDeployedVersionNewer(APP_PRIDE_VERSION, payload.version);
      setStale(newer);
      setDeployedLabel(newer ? `v${payload.version}` : null);
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

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void check();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    const intervalId = window.setInterval(() => {
      void check();
    }, CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [check]);

  return { stale, deployedLabel, reload, check, checking };
}
