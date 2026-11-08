import { describe, expect, it } from "vitest";
import {
  clampPage,
  EMPTY_HISTORY_FILTERS,
  getTotalPages,
  hasActiveFilters,
  historyFiltersToParams,
  parseHistoryFilters,
  updateHistoryFilters,
} from "./filters";

describe("parseHistoryFilters", () => {
  it("usa valores por defecto con parámetros vacíos", () => {
    expect(parseHistoryFilters(new URLSearchParams())).toEqual(
      EMPTY_HISTORY_FILTERS,
    );
  });

  it("lee filtros válidos y normaliza espacios", () => {
    const filters = parseHistoryFilters(
      new URLSearchParams({
        accountId: " acc-1 ",
        type: "transfer",
        category: " rent ",
        status: "completed",
        search: "  alquiler ",
        page: "3",
      }),
    );

    expect(filters).toEqual({
      accountId: "acc-1",
      type: "transfer",
      category: "rent",
      status: "completed",
      search: "alquiler",
      page: 3,
    });
  });

  it("descarta enums desconocidos y páginas inválidas", () => {
    const filters = parseHistoryFilters(
      new URLSearchParams({
        type: "unknown",
        status: "otro",
        page: "-2",
      }),
    );

    expect(filters.type).toBe("");
    expect(filters.status).toBe("");
    expect(filters.page).toBe(1);
  });

  it("recorta búsquedas demasiado largas", () => {
    const filters = parseHistoryFilters(
      new URLSearchParams({ search: "a".repeat(200) }),
    );
    expect(filters.search).toHaveLength(120);
  });
});

describe("historyFiltersToParams", () => {
  it("omite valores por defecto", () => {
    expect(historyFiltersToParams(EMPTY_HISTORY_FILTERS).toString()).toBe("");
  });

  it("hace round-trip de todos los filtros", () => {
    const filters = {
      accountId: "acc-2",
      type: "income" as const,
      category: "salary",
      status: "pending" as const,
      search: "sueldo",
      page: 2,
    };

    expect(parseHistoryFilters(historyFiltersToParams(filters))).toEqual(
      filters,
    );
  });
});

describe("updateHistoryFilters", () => {
  it("vuelve a la página 1 cuando cambia un filtro", () => {
    const next = updateHistoryFilters(
      { ...EMPTY_HISTORY_FILTERS, page: 4 },
      { category: "rent" },
    );
    expect(next.page).toBe(1);
    expect(next.category).toBe("rent");
  });

  it("conserva la página cuando solo pagina", () => {
    const next = updateHistoryFilters(
      { ...EMPTY_HISTORY_FILTERS, page: 2 },
      { page: 3 },
    );
    expect(next.page).toBe(3);
  });

  it("detecta si hay filtros activos", () => {
    expect(hasActiveFilters(EMPTY_HISTORY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_HISTORY_FILTERS, search: "x" })).toBe(
      true,
    );
    expect(hasActiveFilters({ ...EMPTY_HISTORY_FILTERS, page: 2 })).toBe(false);
  });
});

describe("paginación", () => {
  it("calcula el total de páginas", () => {
    expect(getTotalPages(0)).toBe(1);
    expect(getTotalPages(10)).toBe(1);
    expect(getTotalPages(11)).toBe(2);
    expect(getTotalPages(21)).toBe(3);
  });

  it("usa el tamaño de página indicado", () => {
    expect(getTotalPages(10, 5)).toBe(2);
    expect(getTotalPages(1, 5)).toBe(1);
  });

  it("limita la página al rango disponible", () => {
    expect(clampPage(1, 21)).toBe(1);
    expect(clampPage(9, 21)).toBe(3);
    expect(clampPage(0, 21)).toBe(1);
  });
});
