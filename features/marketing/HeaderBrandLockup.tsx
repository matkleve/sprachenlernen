"use client";

import Image from "next/image";

import { TextLink } from "@/components/ui/TextLink";
import { routes } from "@/lib/routes";

/** Header lockup: fanned-pages mark + wordmark. */
export function HeaderBrandLockup({ wordmark }: { wordmark: string }) {
  return (
    <TextLink
      href={routes.landing}
      tone="ink"
      size="sm"
      className="inline-flex items-center gap-2.5 no-underline hover:underline"
    >
      <Image
        src="/design/logo/directions/fanned-pages-mono.svg"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0"
        aria-hidden
      />
      <span className="font-serif text-base font-semibold">{wordmark}</span>
    </TextLink>
  );
}
