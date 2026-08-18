"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearListeningDefer,
  readListeningDeferExpiry,
  startListeningDefer,
} from "@/lib/listening-defer";

export function useListeningDefer() {
  const [expiry, setExpiry] = useState<number | null>(null);

  const sync = useCallback(() => {
    setExpiry(readListeningDeferExpiry());
  }, []);

  useEffect(() => {
    sync();
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [sync]);

  const deferred = expiry !== null;

  const startDefer = useCallback(() => {
    setExpiry(startListeningDefer());
  }, []);

  const clearDefer = useCallback(() => {
    clearListeningDefer();
    setExpiry(null);
  }, []);

  return { deferred, expiry, startDefer, clearDefer };
}
