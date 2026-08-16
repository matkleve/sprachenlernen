import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { logoPreviewSizes, type LogoDirection } from "@/lib/brand-mark";
import { cn } from "@/lib/utils";

import { page } from "./content";

type LogoSizePreviewsProps = {
  direction: LogoDirection;
};

export function LogoSizePreviews({ direction }: LogoSizePreviewsProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        {page.preview.sizes}
      </p>
      <ul className="flex flex-wrap items-end gap-4">
        {logoPreviewSizes.map((size) => (
          <li key={size.id} className="flex flex-col items-center gap-2">
            <div
              className="relative overflow-hidden rounded-card border border-line bg-canvas shadow-soft"
              style={{ width: size.px, height: size.px }}
            >
              <Image
                src={direction.markSrc}
                alt=""
                width={size.px}
                height={size.px}
                className="h-full w-full"
                aria-hidden
              />
              {size.id === "pwa" ? (
                <div
                  className="pointer-events-none absolute inset-0 rounded-card border-2 border-dashed border-accent/40"
                  style={{
                    margin: "10%",
                    borderRadius: "9999px",
                  }}
                  aria-hidden
                  title={page.preview.safeZone}
                />
              ) : null}
            </div>
            <span className="text-xs text-muted">
              {size.label} · {size.px}px
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type HeaderLockupPreviewProps = {
  direction: LogoDirection;
};

export function HeaderLockupPreview({ direction }: HeaderLockupPreviewProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        {page.preview.lockup}
      </p>
      <div className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-soft">
        <Image
          src={direction.monoSrc}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0"
          aria-hidden
        />
        <span className="font-serif text-base font-semibold text-ink">{page.preview.wordmark}</span>
      </div>
    </div>
  );
}

type LogoDirectionCardProps = {
  direction: LogoDirection;
  selected: boolean;
  onChoose: () => void;
};

export function LogoDirectionCard({ direction, selected, onChoose }: LogoDirectionCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card border bg-surface shadow-soft transition-[border-color,box-shadow] duration-150 ease-out-soft",
        selected ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-canvas" : "border-line",
      )}
    >
      <header className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">{direction.name}</h2>
            <p className="mt-1 text-sm text-muted">{direction.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {direction.shipped ? (
              <span className="rounded-pill bg-success-soft px-3 py-1 text-xs font-medium text-success">
                {page.shippedLabel}
              </span>
            ) : null}
            {selected ? (
              <span className="rounded-pill bg-accent-soft px-3 py-1 text-xs font-medium text-ink">
                {page.chosenLabel}
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{direction.rationale}</p>

        <p className="mt-3 rounded-pill border border-line bg-canvas px-2.5 py-1 text-xs text-muted">
          {page.chips.basis}: {direction.basis}
        </p>
      </header>

      <div className="flex flex-col gap-6 p-5">
        <LogoSizePreviews direction={direction} />
        <HeaderLockupPreview direction={direction} />
      </div>

      <footer className="border-t border-line px-5 py-4">
        <Button
          className="w-full"
          variant={selected ? "secondary" : "primary"}
          onClick={onChoose}
          aria-pressed={selected}
        >
          {selected ? page.chosenLabel : page.chooseLabel}
        </Button>
      </footer>
    </article>
  );
}
