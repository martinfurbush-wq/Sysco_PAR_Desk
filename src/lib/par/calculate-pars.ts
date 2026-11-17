import { lookupCatalogEntry } from "./case-catalog";
import type {
  CasePack,
  InventoryReport,
  ParGuide,
  ParLine,
  WeeklyUsage,
} from "./types";

const SECTION_ORDER = [
  "Bread",
  "Food",
  "Sides",
  "Paper",
  "Beverage",
  "Catering",
];

export const DEFAULT_BUFFER = 0.2;

function isProduceSection(section: string): boolean {
  return section.trim().toLowerCase() === "produce";
}

function modePositive(values: number[]): number | null {
  // Prefer whole pack sizes; fractional purchase leftovers are not case packs.
  const usable = values.filter(
    (value) => value >= 1 && Number.isInteger(value),
  );
  const counts = new Map<number, number>();
  for (const value of usable) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best: number | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (
      count > bestCount ||
      (count === bestCount && best != null && value < best)
    ) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function resolveCasePack(
  itemName: string,
  purchaseSamples: number[],
  unitOfMeasure: string,
  override?: { caseSize: number; orderUnit: string } | null,
): CasePack {
  if (override && override.caseSize > 0) {
    return {
      caseSize: override.caseSize,
      orderUnit: override.orderUnit || "cs",
      source: "override",
    };
  }

  const catalog = lookupCatalogEntry(itemName);
  if (catalog) {
    return {
      caseSize: catalog.entry.caseSize,
      orderUnit: catalog.entry.orderUnit,
      source: "catalog",
    };
  }

  const inferred = modePositive(purchaseSamples);
  if (inferred != null) {
    return {
      caseSize: inferred,
      orderUnit: "cs",
      source: "inferred",
    };
  }

  return {
    caseSize: 1,
    orderUnit: unitOfMeasure || "ea",
    source: "default",
  };
}

export function calculateParUnits(
  avgUpk: number,
  avgSales: number,
  buffer: number,
  caseSize: number,
): { neededUnits: number; par: number } {
  const neededUnits = (avgUpk * avgSales) / 1000 * (1 + buffer);
  const par = caseSize > 0 ? Math.ceil(neededUnits / caseSize) : 0;
  return { neededUnits, par };
}

function sectionRank(section: string): number {
  const idx = SECTION_ORDER.findIndex(
    (name) => name.toLowerCase() === section.toLowerCase(),
  );
  return idx === -1 ? SECTION_ORDER.length + 1 : idx;
}

export type BuildParGuideOptions = {
  buffer?: number;
  caseOverrides?: Record<string, { caseSize: number; orderUnit: string }>;
  parOverrides?: Record<string, number | null>;
};

export function buildParGuide(
  reports: InventoryReport[],
  options: BuildParGuideOptions = {},
): ParGuide {
  if (!reports.length) {
    throw new Error("Upload at least one inventory report.");
  }

  const sorted = [...reports].sort((a, b) =>
    a.weekEnding.localeCompare(b.weekEnding),
  );
  const buffer = options.buffer ?? DEFAULT_BUFFER;
  const avgSales =
    sorted.reduce((sum, report) => sum + report.adjustedSales, 0) /
    sorted.length;

  const itemNames = new Map<
    string,
    { section: string; unitOfMeasure: string }
  >();
  let excludedProduceCount = 0;

  for (const report of sorted) {
    for (const item of report.items) {
      if (isProduceSection(item.section)) {
        excludedProduceCount += 1;
        continue;
      }
      if (!itemNames.has(item.name)) {
        itemNames.set(item.name, {
          section: item.section,
          unitOfMeasure: item.unitOfMeasure,
        });
      }
    }
  }

  // Count unique produce items once for the summary, not per-week rows.
  const produceNames = new Set<string>();
  for (const report of sorted) {
    for (const item of report.items) {
      if (isProduceSection(item.section)) produceNames.add(item.name);
    }
  }
  excludedProduceCount = produceNames.size;

  const lines: ParLine[] = [];

  for (const [name, meta] of itemNames) {
    const weeks: WeeklyUsage[] = sorted.map((report) => {
      const match = report.items.find((item) => item.name === name);
      const usage = match?.usage ?? null;
      const usable = usage == null ? null : Math.max(0, usage);
      const upk =
        usable == null || report.adjustedSales <= 0
          ? null
          : (usable / report.adjustedSales) * 1000;
      return {
        weekEnding: report.weekEnding,
        sales: report.adjustedSales,
        usage: usable,
        upk,
      };
    });

    const upks = weeks
      .map((week) => week.upk)
      .filter((value): value is number => value != null);
    const avgUpk = upks.length
      ? upks.reduce((sum, value) => sum + value, 0) / upks.length
      : null;

    const purchaseSamples = sorted.flatMap((report) => {
      const match = report.items.find((item) => item.name === name);
      return match?.totalPurchases != null ? [match.totalPurchases] : [];
    });

    const casePack = resolveCasePack(
      name,
      purchaseSamples,
      meta.unitOfMeasure,
      options.caseOverrides?.[name] ?? null,
    );

    let neededUnits: number | null = null;
    let calculatedPar: number | null = null;
    if (avgUpk != null) {
      const result = calculateParUnits(
        avgUpk,
        avgSales,
        buffer,
        casePack.caseSize,
      );
      neededUnits = result.neededUnits;
      calculatedPar = result.par;
    }

    const overridePar = options.parOverrides?.[name];
    const par =
      overridePar === undefined
        ? calculatedPar
        : overridePar;

    lines.push({
      name,
      section: meta.section,
      unitOfMeasure: meta.unitOfMeasure,
      weeks,
      avgUpk,
      neededUnits,
      casePack,
      calculatedPar,
      par,
    });
  }

  lines.sort((a, b) => {
    const sectionDiff = sectionRank(a.section) - sectionRank(b.section);
    if (sectionDiff !== 0) return sectionDiff;
    if (a.section !== b.section) return a.section.localeCompare(b.section);
    return a.name.localeCompare(b.name);
  });

  const latest = sorted[sorted.length - 1];

  return {
    storeLocation: latest.storeLocation || sorted[0].storeLocation,
    storeNumber: latest.storeNumber || sorted[0].storeNumber,
    weeks: sorted.map((report) => ({
      weekEnding: report.weekEnding,
      sales: report.adjustedSales,
      fileName: report.fileName,
    })),
    avgSales,
    buffer,
    lines,
    excludedProduceCount,
  };
}

export function formatWeekLabel(isoDate: string, index: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return `Week ${index + 1}`;
  const [, month, day] = isoDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
