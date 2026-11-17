import * as XLSX from "xlsx";
import type { InventoryItemRow, InventoryReport, InventorySection } from "./types";

const META_PREFIXES = [
  "beginning inventory",
  "item",
  "inventory",
  "week ending",
  "adjusted sales",
  "store location",
  "store #",
  "additional discounts",
  "subtotal",
  "total with discounts",
];

function cellString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function parseNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value).replace(/,/g, "").trim();
  if (!raw || /^(n\/a|na|#n\/a)$/i.test(raw)) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function excelSerialToIso(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const asText = cellString(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(asText)) return asText.slice(0, 10);
  const fallback = new Date(asText);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString().slice(0, 10);
  }
  return asText || "unknown-week";
}

function isSectionHeader(name: string, unitOfMeasure: string): boolean {
  return /\s\d{4}$/.test(name) && !unitOfMeasure;
}

function sectionLabel(name: string): InventorySection {
  return name.replace(/\s\d{4}$/, "").trim();
}

function isMetaRow(name: string): boolean {
  const lower = name.toLowerCase();
  return META_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function parseInventoryWorkbook(
  data: ArrayBuffer,
  fileName: string,
): InventoryReport {
  const workbook = XLSX.read(data, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error(`${fileName}: workbook has no sheets`);
  }
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(
    sheet,
    {
      header: 1,
      defval: null,
      raw: true,
    },
  );

  let weekEnding = "unknown-week";
  let adjustedSales = 0;
  let storeLocation = "";
  let storeNumber = "";
  let section: InventorySection | null = null;
  const items: InventoryItemRow[] = [];

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const col0 = cellString(row[0]);
    const col1 = cellString(row[1]);

    if (/^week ending/i.test(col0)) {
      weekEnding = excelSerialToIso(row[1]);
      continue;
    }
    if (/^adjusted sales/i.test(col0)) {
      adjustedSales = parseNumber(row[1]) ?? 0;
      continue;
    }
    if (/^store location/i.test(col0)) {
      storeLocation = col1;
      continue;
    }
    if (/^store #/i.test(col0)) {
      storeNumber = col1;
      continue;
    }

    if (!col0 || isMetaRow(col0)) continue;

    if (isSectionHeader(col0, col1)) {
      section = sectionLabel(col0);
      continue;
    }

    if (!section) continue;

    items.push({
      name: col0,
      section,
      unitOfMeasure: col1,
      totalPurchases: parseNumber(row[7]),
      usage: parseNumber(row[12]),
    });
  }

  if (!items.length) {
    throw new Error(
      `${fileName}: no inventory items found. Export the Jimmy John's Inventory (V2) report as .xls or .xlsx.`,
    );
  }

  if (!adjustedSales) {
    throw new Error(`${fileName}: Adjusted Sales is missing or zero.`);
  }

  return {
    fileName,
    weekEnding,
    adjustedSales,
    storeLocation,
    storeNumber,
    items,
  };
}

export async function parseInventoryFile(file: File): Promise<InventoryReport> {
  const buffer = await file.arrayBuffer();
  return parseInventoryWorkbook(buffer, file.name);
}
