import {
  DM_Sans,
  Plus_Jakarta_Sans,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";

import { cn } from "@/lib/utils";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const bodyFonts = {
  baseline: "",
  "warm-scholar": dmSans.className,
  "nordic-clarity": dmSans.className,
  "bold-focus": spaceGrotesk.className,
  "calm-garden": plusJakarta.className,
} as const;

const displayFonts = {
  "warm-scholar": sourceSerif.className,
} as const;

export function themeBodyFontClass(themeId: string): string {
  return bodyFonts[themeId as keyof typeof bodyFonts] ?? "";
}

export function themeDisplayFontClass(themeId: string): string {
  return displayFonts[themeId as keyof typeof displayFonts] ?? "";
}
