import { Table, Td, Th } from "@/components/ui/Table";
import { qualityTier } from "@/lib/lexicon";

import { copy, noNextTier, tierCopy } from "./content";
import type { LoadedLanguages } from "./profiles";

/**
 * What the app claims for each shipped language, and why.
 * Contract: docs/specs/page/language-status.md
 *
 * Deliberately a Server Component with no state: every value is derived from
 * data at build time. There is nothing to hold, so there is nothing to get out
 * of sync — which is the right shape for a page whose subject is trust.
 */
export function LanguageStatus({ profiles, invalid }: LoadedLanguages) {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>

      <section className="mt-page-content">
        {profiles.length === 0 ? (
          <p className="max-w-2xl text-base leading-relaxed text-muted">{copy.empty}</p>
        ) : (
          <Table caption={copy.tableCaption}>
            <thead>
              <tr>
                <Th scope="col">{copy.columns.language}</Th>
                <Th scope="col">{copy.columns.tier}</Th>
                <Th scope="col">{copy.columns.claims}</Th>
                <Th scope="col">{copy.columns.notClaims}</Th>
                <Th scope="col">{copy.columns.nextTier}</Th>
                <Th scope="col">{copy.columns.frequency}</Th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => {
                // Derived here, every render. Reading a tier off the profile is
                // the exact failure UC-036 exists to prevent.
                const tier = qualityTier(profile);
                const { claims, notClaims, nextTier } = tierCopy[tier];

                return (
                  <tr key={profile.code}>
                    <Th scope="row">{profile.name}</Th>
                    <Td className="font-medium text-ink">{tier}</Td>
                    <Td>{claims}</Td>
                    <Td>{notClaims}</Td>
                    <Td>{nextTier === null ? noNextTier : nextTier}</Td>
                    <Td>
                      <span className="block text-ink">{profile.frequency.source}</span>
                      <span className="block">
                        {profile.frequency.corpus} · version {profile.frequency.version}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>

      {invalid.length > 0 && (
        <section className="mt-page-content">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
            {copy.invalidTitle}
          </h2>
          <Table caption={copy.invalidCaption}>
            <thead>
              <tr>
                <Th scope="col">{copy.invalidColumns.file}</Th>
                <Th scope="col">{copy.invalidColumns.errors}</Th>
              </tr>
            </thead>
            <tbody>
              {invalid.map((entry) => (
                <tr key={entry.file}>
                  <Th scope="row" className="font-mono">
                    {entry.file}
                  </Th>
                  <Td>{entry.errors.join("; ")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{copy.invalidNote}</p>
        </section>
      )}
    </div>
  );
}
