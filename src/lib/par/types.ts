export type InventorySection =
  | "Bread"
  | "Food"
  | "Sides"
  | "Paper"
  | "Produce"
  | "Beverage"
  | "Catering"
  | string;

export type InventoryItemRow = {
  name: string;
  section: InventorySection;
  unitOfMeasure: string;
  usage: number | null;
  totalPurchases: number | null;
};

export type InventoryReport = {
  fileName: string;
  weekEnding: string;
  adjustedSales: number;
  storeLocation: string;
  storeNumber: string;
  items: InventoryItemRow[];
};

export type CasePack = {
  caseSize: number;
  orderUnit: string;
  source: "catalog" | "inferred" | "default" | "override";
};

export type WeeklyUsage = {
  weekEnding: string;
  sales: number;
  usage: number | null;
  upk: number | null;
};

export type ParLine = {
  name: string;
  section: InventorySection;
  unitOfMeasure: string;
  weeks: WeeklyUsage[];
  avgUpk: number | null;
  neededUnits: number | null;
  casePack: CasePack;
  calculatedPar: number | null;
  par: number | null;
};

export type ParGuide = {
  storeLocation: string;
  storeNumber: string;
  weeks: Array<{ weekEnding: string; sales: number; fileName: string }>;
  avgSales: number;
  buffer: number;
  lines: ParLine[];
  excludedProduceCount: number;
};
