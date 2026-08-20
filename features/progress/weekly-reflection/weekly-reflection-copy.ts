import type { useTranslations } from "next-intl";

import type { WeeklyReflectionCopy } from "@/lib/weekly-reflection";

type WeeklyReflectionTranslator = ReturnType<typeof useTranslations<"progress.weeklyReflection">>;

/** Maps next-intl keys to the framework-free weekly reflection builder. */
export function weeklyReflectionCopyFromT(t: WeeklyReflectionTranslator): WeeklyReflectionCopy {
  return {
    idleTeaser: (language) => t("idleTeaser", { language }),
    idleHeadline: (language) => t("idleHeadline", { language }),
    movementHeadline: (count, language) =>
      count === 1
        ? t("movementHeadlineOne", { language })
        : t("movementHeadline", { count, language }),
    activityHeadline: (count, language) =>
      count === 1
        ? t("activityHeadlineOne", { language })
        : t("activityHeadline", { count, language }),
    horizonHeadline: (language) => t("horizonHeadline", { language }),
    readyTeaserMoved: (count, language) =>
      count === 1
        ? t("readyTeaserMovedOne", { language })
        : t("readyTeaserMoved", { count, language }),
    readyTeaserActivity: (count, language) =>
      count === 1
        ? t("readyTeaserActivityOne", { language })
        : t("readyTeaserActivity", { count, language }),
  };
}
