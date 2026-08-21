"use client";

import Image from "next/image";

import { MethodCard } from "@/features/method-menu/MethodCard";
import { MethodCardHeader } from "@/features/method-menu/MethodCardHeader";
import { SkillTierBadge } from "@/features/method-menu/SkillTierBadge";
import { sectionGraphicSrc } from "@/features/method-menu/section-graphic";
import { methodSectionSurface } from "@/features/method-menu/section-surface";
import { skillTierBadgeSrc } from "@/features/method-menu/skill-tier-badges";
import type { MethodEntry, Section, Skill } from "@/lib/method-catalogue";
import type { SkillTier } from "@/lib/skill-tier";
import { cn } from "@/lib/utils";

const SKILLS: Skill[] = ["reading", "listening", "speaking", "writing"];
const TIERS: SkillTier[] = ["wood", "bronze", "silver", "gold", "platinum"];
const SECTIONS: Section[] = [
  "listening",
  "writing",
  "speaking",
  "reading",
  "form",
  "vocabulary",
  "world",
  "commitments",
];

const SAMPLE_METHODS: MethodEntry[] = [
  {
    id: "background-listening",
    name: "Leaving it on in the background",
    summary: "Leave it playing while you do something else",
    type: "method",
    section: "listening",
    trains: "very little",
    skills: ["listening"],
    targetSignal: null,
    evidence: "C",
    demanding: false,
    hosted: false,
    intensity: 1,
    durations: [20, 45],
    requires: { sound: ["speaker", "headphones"] },
    offerEveryDays: null,
    doesNotDo: "Honestly: barely anything.",
  },
  {
    id: "build-sentence",
    name: "Build a sentence with a target word",
    summary: "Write one sentence that uses a given word",
    type: "method",
    section: "writing",
    trains: "writing",
    skills: ["writing"],
    targetSignal: null,
    evidence: "B",
    demanding: false,
    hosted: true,
    intensity: 2,
    durations: [3, 15],
    requires: { writingSurface: ["keyboard", "touch"] },
    offerEveryDays: null,
    doesNotDo: "Does not teach grammar rules.",
  },
  {
    id: "role-play",
    name: "Role play or drama",
    summary: "Act out a situation with someone else",
    type: "method",
    section: "speaking",
    trains: "speaking",
    skills: ["speaking"],
    targetSignal: null,
    evidence: "B",
    demanding: true,
    hosted: false,
    intensity: 3,
    durations: [20, 45],
    requires: { voice: ["aloud"], company: ["speakers", "others"] },
    offerEveryDays: null,
    doesNotDo: "Not a substitute for real conversation.",
  },
];

function AssetFrame({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className="relative border-2 border-dashed border-accent bg-canvas/50">{children}</div>
      <figcaption className="text-xs text-muted">{label}</figcaption>
    </figure>
  );
}

function ShieldNativeGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TIERS.map((tier) => (
        <div key={tier} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">{tier}</h3>
          <div className="grid grid-cols-2 gap-3">
            {SKILLS.map((skill) => {
              const src = skillTierBadgeSrc(skill, tier);
              return (
                <AssetFrame
                  key={`${skill}-${tier}`}
                  label={`${skill} · 256px native + margin guide`}
                >
                  <div className="relative mx-auto size-64 bg-[repeating-conic-gradient(#e8e4dc_0%_25%,#f7f4ef_0%_50%)] bg-[length:16px_16px]">
                    <Image
                      src={src}
                      alt=""
                      width={256}
                      height={256}
                      unoptimized
                      className="size-full object-contain"
                    />
                    <div
                      className="pointer-events-none absolute inset-[21%] border-2 border-good-ink/60"
                      aria-hidden
                      title="~50% content fill target in slice script"
                    />
                  </div>
                </AssetFrame>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShieldCardSizes() {
  return (
    <div className="flex flex-wrap gap-8">
      {(["listening", "writing", "speaking"] as const).flatMap((skill) =>
        (["wood", "bronze", "platinum"] as const).map((tier) => (
          <div key={`${skill}-${tier}`} className="space-y-2">
            <p className="text-xs font-medium text-ink">{skill} {tier}</p>
            <div className="flex items-end gap-4">
              <AssetFrame label="SkillTierBadge card">
                <div className="p-4">
                  <SkillTierBadge skill={skill} tier={tier} size="card" />
                </div>
              </AssetFrame>
              <AssetFrame label="Raw img 56px (old cap)">
                <div className="p-4">
                  <Image
                    src={skillTierBadgeSrc(skill, tier)}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="size-14 object-contain"
                  />
                </div>
              </AssetFrame>
            </div>
          </div>
        )),
      )}
    </div>
  );
}

function SectionBannerLab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {SECTIONS.slice(0, 4).map((section) => (
        <div key={section} className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">{section}</h3>
          <AssetFrame label="Full WebP asset (natural aspect)">
            <div className="bg-section-listening-soft p-2">
              <Image
                src={sectionGraphicSrc[section]}
                alt=""
                width={800}
                height={250}
                unoptimized
                className="h-auto w-full"
              />
            </div>
          </AssetFrame>
          <AssetFrame label="MethodCardHeader (production component)">
            <div className={methodSectionSurface(section, "max-w-sm")}>
              <MethodCardHeader section={section} />
              <div className="p-3 text-xs text-muted">card body placeholder</div>
            </div>
          </AssetFrame>
        </div>
      ))}
    </div>
  );
}

export function MethodCardAssetLab() {
  return (
    <div className="space-y-page-content">
      <section className="max-w-3xl space-y-4 rounded-card border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">What was going wrong</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted">
          <li>
            <strong className="text-ink">Header image column:</strong> square grid cells were
            letterbox-padded to 3.2∶1, so the motif sat in a narrow centre strip.{" "}
            <code className="text-ink">object-cover</code> then showed only that strip — tiny and
            centred.
          </li>
          <li>
            <strong className="text-ink">Shield clipping:</strong> ornate tiers are wider than tall;
            a fixed 48×48 box + <code className="text-ink">max-h-11</code> squeezed them. Wood row
            plaques are horizontal — same problem.
          </li>
          <li>
            <strong className="text-ink">Not CSS overflow:</strong> PNGs have ~21% transparent margin
            (green guide below). If tips clip here, the slice crop or fill % is wrong — not the card.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">1 · Shield PNGs (sliced output)</h2>
        <p className="max-w-3xl text-sm text-muted">
          Checkerboard = transparency. Dashed inner square = 50% fill target from{" "}
          <code>slice-skill-tier-badges.py</code>. Tips must stay inside the checkerboard.
        </p>
        <ShieldNativeGrid />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">2 · Card size vs raw 56px</h2>
        <ShieldCardSizes />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">3 · Section banners</h2>
        <p className="max-w-3xl text-sm text-muted">
          Top: exported WebP. Bottom: live header — should fill width, motif in upper band.
        </p>
        <SectionBannerLab />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">4 · Live method cards</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_METHODS.map((method) => (
            <li key={method.id}>
              <MethodCard method={method} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
