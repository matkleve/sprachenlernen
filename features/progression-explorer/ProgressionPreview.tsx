import { Menu } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { FilterPill } from "@/components/ui/FilterPill";
import { GradeButton } from "@/components/ui/GradeButton";
import { Input } from "@/components/ui/Input";
import { SkillTierBadge } from "@/features/method-menu/SkillTierBadge";
import { borderWeightClass } from "@/lib/design-themes";
import { chapterForStage, stageScopeStyle } from "@/lib/progression-stage";
import { cn } from "@/lib/utils";

import { page } from "./content";

/**
 * The app's real surfaces under a chapter + stage scope. Contract:
 * docs/specs/page/progression-explorer.md
 *
 * Built from the shipped primitives on purpose. A mock of bespoke divs would
 * look however the mock's author wanted and would answer nothing — the whole
 * question is what a stage does to *these* components.
 *
 * The stage overlays are two absolutely positioned layers rather than
 * properties of the components, because that is the constraint the model
 * rests on: a stage may add light and texture over the surface, and may not
 * reach into a token that carries text.
 */

type ProgressionPreviewProps = {
  stage: number;
  className?: string;
};

export function ProgressionPreview({ stage, className }: ProgressionPreviewProps) {
  const chapter = chapterForStage(stage);
  const { preview } = page;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-card border border-line",
        borderWeightClass(chapter.borderWeight),
        className,
      )}
      style={stageScopeStyle({ stage })}
    >
      {/* Light — a warm pool from above. Opacity is the stage's, colour is the chapter's. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: "var(--stage-glow)",
          background:
            "radial-gradient(120% 60% at 50% 0%, var(--color-accent) 0%, transparent 70%)",
        }}
      />
      {/* Grain — the material of the room. Fades as the room gets finer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: "var(--stage-grain)",
          backgroundImage:
            "repeating-linear-gradient(93deg, var(--color-ink) 0 1px, transparent 1px 2.5px, var(--color-ink) 2.5px 4px, transparent 4px 9px)",
          // `black` here is an alpha value, not a colour: a mask uses only the
          // alpha channel, so no token applies and theming is unaffected. It
          // makes the grain strongest under the light and fade out below.
          maskImage: "radial-gradient(120% 100% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col gap-5 p-5">
        {/* Shell header */}
        {/*
          Two lines, not one: the hairline is structure and is always there, the
          brass rule over it is ornament and fades in with the stage. At stage 1
          there is only the hairline — a bare bench has no brass on it.
        */}
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
            className="grid size-9 place-items-center rounded-pill border border-line bg-surface text-ink"
          >
            <Menu className="size-4" />
          </span>
        </div>

        {/* Method card */}
        <article
          className="rounded-card border border-line bg-surface p-4 shadow-soft"
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

        {/* Review card — the surface a learner sees most */}
        <article className="rounded-card border border-line bg-surface-raised p-4 shadow-raised">
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

        {/* Progress stat + a rule whose weight is the stage's ornament */}
        <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
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

        {/* Nav pills */}
        <div className="flex flex-wrap gap-1">
          {preview.navItems.map((item, index) => (
            <FilterPill key={item} current={index === 0} tabIndex={-1}>
              {item}
            </FilterPill>
          ))}
        </div>

        {/* Field + actions */}
        <Field label={preview.fieldLabel}>
          <Input placeholder={preview.fieldPlaceholder} readOnly tabIndex={-1} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" tabIndex={-1}>
            {preview.primary}
          </Button>
          <Button size="sm" variant="secondary" tabIndex={-1}>
            {preview.secondary}
          </Button>
        </div>
      </div>
    </div>
  );
}
