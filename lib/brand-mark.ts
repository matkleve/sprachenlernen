import directions from "@/data/brand/logo-directions.json";

export type LogoDirection = {
  id: string;
  name: string;
  tagline: string;
  rationale: string;
  basis: string;
  markSrc: string;
  monoSrc: string;
  shipped: boolean;
};

export const logoDirections = directions as LogoDirection[];

export const brandMarkStorageKey = "brand-explorer-choice";

/** Sizes shown in the explorer — favicon through Home Screen. */
export const logoPreviewSizes = [
  { id: "favicon", label: "Favicon", px: 32 },
  { id: "header", label: "Header", px: 40 },
  { id: "pwa", label: "Home Screen", px: 120 },
  { id: "store", label: "Store", px: 192 },
] as const;

export function logoDirectionById(id: string): LogoDirection | undefined {
  return logoDirections.find((direction) => direction.id === id);
}

export const shippedLogoDirection =
  logoDirections.find((direction) => direction.shipped) ?? logoDirections[0]!;
