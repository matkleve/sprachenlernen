import type { FinitePerson } from "@/lib/sentence-realizer/types";

/** Present indicative — six finite cells for dev matrix display. */
export const SPANISH_PRESENT_PERSONS: readonly FinitePerson[] = [
  { id: "1sg", label: "1sg", pronoun: "Yo", cell: "ind.pres.1sg" },
  { id: "2sg", label: "2sg", pronoun: "Tú", cell: "ind.pres.2sg" },
  { id: "3sg", label: "3sg", pronoun: "Él", cell: "ind.pres.3sg" },
  { id: "1pl", label: "1pl", pronoun: "Nosotros", cell: "ind.pres.1pl" },
  { id: "2pl", label: "2pl", pronoun: "Vosotros", cell: "ind.pres.2pl" },
  { id: "3pl", label: "3pl", pronoun: "Ellos", cell: "ind.pres.3pl" },
];
