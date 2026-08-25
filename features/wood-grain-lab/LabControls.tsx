import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LabSectionProps = {
  title: string;
  children: ReactNode;
};

export function LabSection({ title, children }: LabSectionProps) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-soft">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}
