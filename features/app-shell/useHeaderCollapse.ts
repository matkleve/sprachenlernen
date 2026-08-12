"use client";

import { useEffect, useState } from "react";

/**
 * 0 at the top of the page, 1 once `range` px of scroll have passed.
 * Drives title scale and header blur without swapping layout.
 */
export function useHeaderCollapse(range = 72): number {
  const [collapse, setCollapse] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCollapse(Math.min(1, Math.max(0, y / range)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [range]);

  return collapse;
}
