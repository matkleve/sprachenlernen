"use client";

import { useState } from "react";

import { GRAIN_REFERENCE_IMAGE, type GrainParams } from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { GrainPreview } from "./GrainPreview";

type GrainCompareProps = {
  params: GrainParams;
};

export function GrainCompare({ params }: GrainCompareProps) {
  const [referenceMissing, setReferenceMissing] = useState(false);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <figure className="flex flex-col gap-2">
        <figcaption className="text-xs font-medium uppercase tracking-widest text-muted">
          {page.referenceHeading}
        </figcaption>
        <div
          className={cn(
            "relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft",
            referenceMissing && "bg-surface-raised",
          )}
        >
          {referenceMissing ? (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted">
              {page.referenceMissing(GRAIN_REFERENCE_IMAGE)}
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- dev-only reference crop; owner asset may be absent.
            <img
              src={GRAIN_REFERENCE_IMAGE}
              alt={page.referenceAlt}
              className="size-full object-cover object-left-top"
              onError={() => setReferenceMissing(true)}
            />
          )}
        </div>
      </figure>

      <figure className="flex flex-col gap-2">
        <figcaption className="text-xs font-medium uppercase tracking-widest text-muted">
          {page.generatedHeading}
        </figcaption>
        <div
          className="relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft"
          aria-label={page.previewHeading}
        >
          <GrainPreview params={params} className="absolute inset-0" />
        </div>
      </figure>
    </div>
  );
}
