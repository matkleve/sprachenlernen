"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { OrbitDetailCard } from "@/features/words/OrbitDetailCard";
import { OrbitListPopover } from "@/features/words/OrbitListPopover";
import { VocabularyOrbitSvg } from "@/features/words/VocabularyOrbitSvg";
import { WordsSectionLabel } from "@/features/words/WordsSectionLabel";
import type { AtlasPoint } from "@/lib/vocabulary-snapshot";
import type { OrbitSegment, OrbitTickSegment, VocabularyOrbit } from "@/lib/vocabulary-orbit";

type DetailSegment = Exclude<OrbitSegment, OrbitTickSegment>;

type VocabularyOrbitFieldProps = {
  orbit: VocabularyOrbit;
  languageCode: string;
  atlas: readonly AtlasPoint[];
};

export function VocabularyOrbitField({ orbit, languageCode, atlas }: VocabularyOrbitFieldProps) {
  const t = useTranslations("words");
  const [selected, setSelected] = useState<DetailSegment | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const listTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <WordsSectionLabel>{t("orbitHeading")}</WordsSectionLabel>
          <p className="max-w-2xl text-base leading-relaxed text-muted">{t("orbitCaption")}</p>
        </div>
        <Button
          ref={listTriggerRef}
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted"
          aria-expanded={listOpen}
          onClick={() => setListOpen((open) => !open)}
        >
          {t('orbitShowList')}
        </Button>
      </div>

      <div className="mt-6 flex justify-center">
        <VocabularyOrbitSvg
          orbit={orbit}
          languageCode={languageCode}
          selectedId={selected?.id ?? null}
          onSelect={(segment) => {
            if (segment.kind !== "tick") setSelected(segment);
          }}
        />
      </div>

      {selected ? (
        <div className="mt-6" aria-live="polite">
          <OrbitDetailCard segment={selected} />
        </div>
      ) : null}

      <OrbitListPopover
        open={listOpen}
        onClose={() => setListOpen(false)}
        atlas={atlas}
        triggerRef={listTriggerRef}
      />
    </section>
  );
}
