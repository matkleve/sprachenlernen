import { DM_Sans, Source_Serif_4 } from "next/font/google";

/** Warm Scholar — body: DM Sans, headings: Source Serif 4. */
export const bodyFont = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const headingFont = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

export const fontClassNames = `${bodyFont.variable} ${headingFont.variable} ${bodyFont.className}`;
