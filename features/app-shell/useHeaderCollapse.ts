"use client";

import { useEffect, useState } from "react";

import { shellHeaderCollapseValue } from "./shell-page-title-layout";

/**
 * 0 at the top of the page, 1 once `range` px of scroll have passed.
 * Drives title scale and header blur without swapping layout.
 */
export function useHeaderCollapse(range = 72): number {
  const [collapse, setCollapse] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const next = shellHeaderCollapseValue(window.scrollY, range);
      setCollapse((current) => (Math.abs(current - next) < 0.001 ? current : next));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [range]);

  return collapse;
}
