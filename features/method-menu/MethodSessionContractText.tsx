"use client";

import { useTranslations } from "next-intl";

import type { SessionContract } from "@/lib/method-session-contract";
import { cn } from "@/lib/utils";

import { formatSessionContractLine } from "./formatSessionContractLine";

export type MethodSessionContractTextProps = {
  contract: SessionContract;
  className?: string;
};

export function MethodSessionContractText({ contract, className }: MethodSessionContractTextProps) {
  const t = useTranslations("methodMenu");

  return (
    <p
      className={cn("text-sm leading-relaxed text-muted", className)}
      data-testid="session-contract"
    >
      {formatSessionContractLine(t, contract)}
    </p>
  );
}
