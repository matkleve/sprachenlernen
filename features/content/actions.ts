"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readSourceDetail } from "@/features/content/reading";
import { GAP_SET_COOKIE, type GapSetCookie } from "@/lib/gap-set-cookie";
import { cardEngineSessionHref } from "@/lib/method-session";
import { routes } from "@/lib/routes";

export async function startGapSetAction(sourceId: string) {
  const outcome = await readSourceDetail(sourceId);
  if (outcome.status !== "ok" || outcome.reading.gap.kind !== "list") {
    redirect(routes.contentDetail(sourceId));
  }

  const payload: GapSetCookie = {
    sourceId,
    lemmas: outcome.reading.gap.lemmas.map((lemma) => lemma.lemma),
  };

  const cookieStore = await cookies();
  cookieStore.set(GAP_SET_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(cardEngineSessionHref());
}
