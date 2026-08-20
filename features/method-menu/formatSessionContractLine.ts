import type { SessionContract } from "@/lib/method-session-contract";

type ContractTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function formatSessionContractLine(
  t: ContractTranslator,
  contract: SessionContract,
): string {
  const volume = t(contract.volumeLabelKey, { count: contract.learningUnits });
  const feedback = t(contract.feedbackLabelKey);
  return t("sessionContract.line", {
    minutes: contract.wallEstimateMinutes,
    volume,
    feedback,
  });
}
