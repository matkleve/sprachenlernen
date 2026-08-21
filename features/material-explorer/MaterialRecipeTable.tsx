import type { MaterialRecipe } from "@/lib/material-recipes";

import { page } from "./content";

type MaterialRecipeTableProps = {
  recipe: MaterialRecipe;
};

export function MaterialRecipeTable({ recipe }: MaterialRecipeTableProps) {
  const rows: { label: string; value: string }[] = [
    { label: page.recipeRows.material, value: recipe.material },
    { label: page.recipeRows.base, value: recipe.base },
    { label: page.recipeRows.texture, value: recipe.texture },
    { label: page.recipeRows.edges, value: recipe.edges },
    { label: page.recipeRows.lighting, value: recipe.lighting },
    { label: page.recipeRows.roughness, value: recipe.roughness.toFixed(2) },
    { label: page.recipeRows.grain, value: recipe.grain.toFixed(2) },
    { label: page.recipeRows.radius, value: `${recipe.radius}px` },
    { label: page.recipeRows.specular, value: recipe.specular.toFixed(2) },
  ];

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        {page.recipeHeading}
      </p>
      <p className="mt-1 font-serif text-base font-semibold text-ink">{recipe.name}</p>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="pb-2 pr-4 font-medium text-muted">{page.recipeColumns.property}</th>
            <th className="pb-2 font-medium text-muted">{page.recipeColumns.value}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line/60">
              <td className="py-2 pr-4 text-muted">{row.label}</td>
              <td className="py-2 tabular-nums text-ink">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
