"use client";

import { useEffect, useRef } from "react";

import { renderWoodGrain, type WoodGrainOptions } from "@/lib/wood-grain-ridges";

type WoodGrainCanvasProps = {
  options: WoodGrainOptions;
};

/**
 * Renders procedural wood grain to a canvas at the element's rendered size —
 * multi-scale horizontal fibre layers, redrawn on resize.
 */
export function WoodGrainCanvas({ options }: WoodGrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      // jsdom (unit tests) has no canvas backend and throws here rather than
      // returning null — safe to no-op, this component is visual-only.
      let ctx: CanvasRenderingContext2D | null = null;
      try {
        ctx = canvas.getContext("2d");
      } catch {
        return;
      }
      if (!ctx) return;
      renderWoodGrain(ctx, width, height, options);
    };

    draw();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [options]);

  return <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />;
}
