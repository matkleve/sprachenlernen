"use client";

import Image from "next/image";

import { logoDirections } from "@/lib/brand-mark";

/** Temporary: all brand marks in the public header for side-by-side comparison. */
export function HeaderLogoStrip() {
  return (
    <div
      className="flex flex-wrap items-end gap-3"
      aria-label="Logo directions preview"
      data-testid="header-logo-strip"
    >
      {logoDirections.map((direction) => (
        <div key={direction.id} className="flex flex-col items-center gap-1">
          <Image
            src={direction.markSrc}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-md shadow-soft"
            aria-hidden
          />
          <span className="max-w-16 truncate text-center text-[10px] leading-tight text-muted">
            {direction.name}
            {direction.shipped ? " · shipped" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
