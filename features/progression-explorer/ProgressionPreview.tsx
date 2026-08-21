import { Menu } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { FilterPill } from "@/components/ui/FilterPill";
import { GradeButton } from "@/components/ui/GradeButton";
import { Input } from "@/components/ui/Input";
import { SkillTierBadge } from "@/features/method-menu/SkillTierBadge";
import { borderWeightClass } from "@/lib/design-themes";
import { chapterForStage, stageDetail, stageScopeStyle, stageSkinClass } from "@/lib/progression-stage";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { ProgressionStarField } from "./ProgressionStarField";

/**
 * The app's real surfaces under a chapter + stage scope. Contract:
 * docs/specs/page/progression-explorer.md
 *
 * Material skins (wood / plaster / night sky) are CSS-only approximations of
 * the reference board — swap in tile images from `public/design/progression/`
 * when available.
 */

type ProgressionPreviewProps = {
  stage: number;
  className?: string;
};

export function ProgressionPreview({ stage, className }: ProgressionPreviewProps) {
  const chapter = chapterForStage(stage);
  const detail = stageDetail(stage);
  const { preview } = page;

  return (
    <div
      className={cn(
        "progression-skin relative isolate overflow-hidden rounded-card border border-line",
        stageSkinClass(detail.skin),
        borderWeightClass(chapter.borderWeight),
        className,
      )}
      style={stageScopeStyle({ stage })}
    >
      <ProgressionStarField stage={stage} />

      {/* Warm pool from above — stage opacity, chapter accent colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: "var(--stage-glow)",
          background:
            "radial-gradient(120% 60% at 50% 0%, var(--color-accent) 0%, transparent 70%)",
        }}
      />

      {/* Fine pinstripe grain — material overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: "var(--stage-grain)",
          backgroundImage:
            "repeating-linear-gradient(93deg, var(--color-ink) 0 1px, transparent 1px 2.5px, var(--color-ink) 2.5px 4px, transparent 4px 9px)",
          maskImage: "radial-gradient(120% 100% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col gap-5 p-5">
        <div className="relative flex items-center justify-between gap-3 border-b border-line pb-3">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-accent"
            style={{ opacity: "var(--stage-rule)" }}
          />
          <span className="font-serif text-base font-semibold text-ink">
            {preview.shellTitle}
          </span>
          <span
            aria-hidden
            className="progression-card grid size-9 place-items-center rounded-card border border-line bg-surface text-ink"
          >
            <Menu className="size-4" />
          </span>
        </div>

        <article
          className="progression-card rounded-card border border-line bg-surface p-4 shadow-soft"
          style={{ boxShadow: "inset 0 var(--stage-bevel) 0 0 var(--color-surface-raised)" }}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                {preview.eyebrow}
              </p>
              <h3 className="mt-1 font-serif text-lg font-semibold text-ink">
                {preview.methodTitle}
              </h3>
              <p className="mt-1 text-sm text-muted">{preview.methodBody}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {preview.methodChips.map((chip) => (
                  <Chip key={chip}>{chip}</Chip>
                ))}
              </div>
            </div>
            <SkillTierBadge skill="listening" tier="silver" size="detail" />
          </div>
        </article>

        <article className="progression-card rounded-card border border-line bg-surface-raised p-4 shadow-raised">
          <p className="text-center font-serif text-2xl font-semibold text-ink">
            {preview.reviewPrompt}
          </p>
          <p className="mt-1 text-center text-xs text-muted">{preview.reviewHint}</p>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            <GradeButton grade="again">{preview.grades.again}</GradeButton>
            <GradeButton grade="hard">{preview.grades.hard}</GradeButton>
            <GradeButton grade="good">{preview.grades.good}</GradeButton>
            <GradeButton grade="easy">{preview.grades.easy}</GradeButton>
          </div>
        </article>

        <div className="progression-card rounded-card border border-line bg-surface p-4 shadow-soft">
          <div
            className="pb-2"
            style={{
              borderBottom: "2px solid var(--color-accent)",
              opacity: "calc(0.4 + var(--stage-rule) * 0.6)",
            }}
          >
            <p className="text-xs uppercase tracking-widest text-muted">{preview.statLabel}</p>
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-ink">{preview.statValue}</p>
          <p className="text-sm text-muted">{preview.statCaption}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {preview.navItems.map((item, index) => (
            <FilterPill key={item} current={index === 0} tabIndex={-1}>
              {item}
            </FilterPill>
          ))}
        </div>

        <Field label={preview.fieldLabel}>
          <Input
            className="progression-control"
            placeholder={preview.fieldPlaceholder}
            readOnly
            tabIndex={-1}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" tabIndex={-1}>
            {preview.primary}
          </Button>
          <Button className="progression-control" size="sm" variant="secondary" tabIndex={-1}>
            {preview.secondary}
          </Button>
        </div>
      </div>
    </div>
  );
}
