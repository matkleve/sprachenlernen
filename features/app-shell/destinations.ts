import { BookOpen, Copy, Library, TrendingUp, type LucideIcon } from "lucide-react";

import { routes } from "@/lib/routes";

import { copy } from "./content";

export type ShellDestination = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** ADR-0009's three destinations plus temporary Safari debug mirror (study/29). */
export const shellDestinations: ShellDestination[] = [
  { href: routes.methods, label: copy.destinations.methods, icon: Library },
  { href: routes.methodsMirror, label: copy.destinations.methodsMirror, icon: Copy },
  { href: routes.words, label: copy.destinations.words, icon: BookOpen },
  { href: routes.progress, label: copy.destinations.progress, icon: TrendingUp },
];

export function isDestinationCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
