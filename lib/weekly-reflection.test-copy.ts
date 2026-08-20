import type { WeeklyReflectionCopy } from "@/lib/weekly-reflection";

/** English copy for unit tests — mirrors messages/en.json progress.weeklyReflection. */
export const englishWeeklyReflectionCopy: WeeklyReflectionCopy = {
  idleTeaser: (language) => `This week in ${language} — nothing shifted yet`,
  idleHeadline: (language) =>
    `You did not review ${language} this week. Nothing changed in your measured vocabulary — that is expected after a light week. The queue will be larger when you return; the schedule is unchanged.`,
  movementHeadline: (count, language) =>
    count === 1
      ? `This week 1 word moved from shaky to held in ${language}.`
      : `This week ${count} words moved from shaky to held in ${language}.`,
  activityHeadline: (count, language) =>
    count === 1
      ? `You recorded 1 review answer in ${language} this week.`
      : `You recorded ${count} review answers in ${language} this week.`,
  horizonHeadline: (language) =>
    `Here is when your ${language} reviews are due over the next thirty days.`,
  readyTeaserMoved: (count, language) =>
    count === 1
      ? `1 word moved to held in ${language} this week`
      : `${count} words moved to held in ${language} this week`,
  readyTeaserActivity: (count, language) =>
    count === 1
      ? `1 review answer in ${language} this week`
      : `${count} review answers in ${language} this week`,
};
