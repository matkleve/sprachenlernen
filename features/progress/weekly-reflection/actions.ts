"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { REFLECTION_SEEN_COOKIE, reflectionSeenValue } from "@/lib/reflection-seen";
import { routes } from "@/lib/routes";

/**
 * Marks the current week's reflection as read. Contract:
 * docs/specs/feature/weekly-reflection.md
 */
export async function markReflectionSeenAction(
  isoWeek: string,
  languageCode: string,
): Promise<void> {
  const jar = await cookies();
  jar.set(REFLECTION_SEEN_COOKIE, reflectionSeenValue(isoWeek, languageCode), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 400,
  });
  revalidatePath(routes.progress);
}
