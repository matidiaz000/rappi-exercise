export const CATEGORY_OPTIONS = [
  { id: "salary", label: "Sueldo" },
  { id: "freelance", label: "Freelance" },
  { id: "rent", label: "Alquiler" },
  { id: "groceries", label: "Supermercado" },
  { id: "transport", label: "Transporte" },
  { id: "entertainment", label: "Entretenimiento" },
  { id: "utilities", label: "Servicios" },
  { id: "health", label: "Salud" },
  { id: "transfer", label: "Transferencia" },
  { id: "other", label: "Otros" },
] as const;

export type CategoryId = (typeof CATEGORY_OPTIONS)[number]["id"];

const CATEGORY_LABELS = new Map<string, string>(
  CATEGORY_OPTIONS.map((category) => [category.id, category.label]),
);

export function getCategoryLabel(category: string | null): string {
  if (!category) return "Sin categoría";
  return CATEGORY_LABELS.get(category) ?? category;
}

export function isKnownCategory(value: string): boolean {
  return CATEGORY_LABELS.has(value);
}
