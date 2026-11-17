export type CatalogEntry = {
  caseSize: number;
  orderUnit: string;
  aliases?: string[];
};

/** Case packs from the 2025 Sysco PAR Calculator workbook, plus inventory-name aliases. */
export const CASE_CATALOG: Record<string, CatalogEntry> = {
  "French Bread": { caseSize: 32, orderUnit: "cs" },
  Wheat: { caseSize: 16, orderUnit: "cs", aliases: ["Wheat Loaf"] },
  Capocollo: { caseSize: 36, orderUnit: "cs" },
  Salami: { caseSize: 36, orderUnit: "cs" },
  Ham: { caseSize: 40, orderUnit: "cs" },
  Turkey: { caseSize: 20, orderUnit: "cs" },
  Beef: { caseSize: 28, orderUnit: "cs" },
  Bacon: { caseSize: 600, orderUnit: "cs" },
  Chicken: { caseSize: 20, orderUnit: "cs", aliases: ["Shredded Chicken"] },
  Cheese: { caseSize: 36, orderUnit: "cs", aliases: ["Provolone Cheese"] },
  "Parmesean Cheese": {
    caseSize: 12,
    orderUnit: "cs",
    aliases: ["Shaved Parmesan Cheese", "Parmesan Cheese"],
  },
  Mayonnaise: { caseSize: 4, orderUnit: "cs" },
  Oil: { caseSize: 6, orderUnit: "gal" },
  Vinegar: { caseSize: 4, orderUnit: "gal" },
  Avocado: { caseSize: 12, orderUnit: "cs" },
  "Peppers Cherry": {
    caseSize: 4,
    orderUnit: "cs",
    aliases: ["Cherry Peppers"],
  },
  "Soy Sauce": { caseSize: 1, orderUnit: "gal" },
  "Tuna Chunk": { caseSize: 6, orderUnit: "cs", aliases: ["Tuna Pouch"] },
  "Pam Spray": { caseSize: 6, orderUnit: "ea", aliases: ["Pan Spray"] },
  Oregano: { caseSize: 1, orderUnit: "ea" },
  Basil: { caseSize: 1, orderUnit: "ea" },
  Buttermilk: { caseSize: 1, orderUnit: "ea" },
  "Mayo Packets": { caseSize: 1, orderUnit: "box" },
  "Mustard Packets": { caseSize: 1, orderUnit: "box" },
  "Kickin' Ranch Mix": {
    caseSize: 18,
    orderUnit: "ea",
    aliases: ["Kickin' Ranch"],
  },
  "Flour Wraps": {
    caseSize: 96,
    orderUnit: "sleeve",
    aliases: ["Flour Tortilla"],
  },
  "Garlic Wraps": {
    caseSize: 72,
    orderUnit: "ea",
    aliases: ["Garlic Herb Tortilla"],
  },
  "Red Pepper Flakes": { caseSize: 13, orderUnit: "oz" },
  Croutons: { caseSize: 320, orderUnit: "oz" },
  "Cripsy Jalapeno": { caseSize: 10, orderUnit: "sleeve" },
  "Ceasar Dressing": {
    caseSize: 2,
    orderUnit: "ea",
    aliases: ["Sysco Caesar Dressing", "Caesar Dressing"],
  },
  "Jalapeno Ranch": { caseSize: 4, orderUnit: "ea" },
  "Mustard Yellow": {
    caseSize: 6,
    orderUnit: "cs",
    aliases: ["Yellow Mustard"],
  },
  Pickles: {
    caseSize: 60,
    orderUnit: "bucket",
    aliases: ["Pickles Whole"],
  },
  "Chip JJ Reg": {
    caseSize: 72,
    orderUnit: "ea",
    aliases: ["Potato Chip Regular"],
  },
  "Chip JJ BBQ": {
    caseSize: 72,
    orderUnit: "ea",
    aliases: ["Potato Chip BBQ"],
  },
  "Chip JJ Jalapeno": {
    caseSize: 72,
    orderUnit: "ea",
    aliases: ["Potato Chip Jalapeno"],
  },
  "Chip JJ S&V": {
    caseSize: 72,
    orderUnit: "ea",
    aliases: ["Potato Chip Salt & Vinegar"],
  },
  "Chip JJ Skinny": { caseSize: 72, orderUnit: "ea" },
  Brownies: { caseSize: 42, orderUnit: "cs", aliases: ["Fudge Brownie"] },
  "Potato Salad": { caseSize: 16, orderUnit: "cs" },
  "Pasta Salad": {
    caseSize: 9,
    orderUnit: "cs",
    aliases: ["Bowtie Pasta Salad"],
  },
  "Oatmeal Raisin Cookie": { caseSize: 56, orderUnit: "ea" },
  "Chocolate Chunk Cookie": {
    caseSize: 56,
    orderUnit: "ea",
    aliases: ["Chocolate Chip Cookie"],
  },
  "Cup 22oz": { caseSize: 1000, orderUnit: "sleeve", aliases: ["Cup 22oz JJ"] },
  "Lid 22oz": { caseSize: 1000, orderUnit: "sleeve", aliases: ["Lid 22oz JJ"] },
  "Cup 30 oz": { caseSize: 750, orderUnit: "sleeve", aliases: ["Cup 30oz JJ"] },
  "Lid 30 oz": {
    caseSize: 1000,
    orderUnit: "sleeve",
    aliases: ["Lid 30oz JJ"],
  },
  "Cup Clear 2 oz": {
    caseSize: 200,
    orderUnit: "sleeve",
    aliases: ["2 oz Side Portion Cup"],
  },
  "Lid Plastic 2 oz": {
    caseSize: 100,
    orderUnit: "sleeve",
    aliases: ["2 oz Side Portion Lid"],
  },
  "8X10 Portion Paper": {
    caseSize: 12,
    orderUnit: "box",
    aliases: ["Portion Papers"],
  },
  "Napkins (Case 12)": {
    caseSize: 12,
    orderUnit: "pack",
    aliases: ["Napkin Pack"],
  },
  "Bags #8": { caseSize: 1, orderUnit: "cs", aliases: ["Bags 8# JJ"] },
  Mylar: { caseSize: 1, orderUnit: "ea" },
  "Pan Liners": { caseSize: 1, orderUnit: "cs" },
  "Straws (Box 300)": {
    caseSize: 24,
    orderUnit: "box",
    aliases: ["Straws"],
  },
  "Wrap Sandwich": {
    caseSize: 3,
    orderUnit: "box",
    aliases: ["Sandwich Wraps"],
  },
  "Syrup Coke": { caseSize: 5, orderUnit: "box" },
  "Syrup Diet Coke": { caseSize: 5, orderUnit: "box" },
  "Syrup Sprite": { caseSize: 5, orderUnit: "box" },
  "Syrup Fanta Orange": { caseSize: 2.5, orderUnit: "box" },
  "Syrup Lemonade": { caseSize: 2.5, orderUnit: "box" },
  "Syrup Dr. Pepper": { caseSize: 5, orderUnit: "box" },
  "Syrup Cherry Coke": { caseSize: 2.5, orderUnit: "box" },
  "Syrup Root Beer": {
    caseSize: 2.5,
    orderUnit: "box",
    aliases: ["Syrup Root Beer 5gal"],
  },
  "Coke Bottle": {
    caseSize: 24,
    orderUnit: "cs",
    aliases: ["Coke (20 oz bottle)"],
  },
  "Diet Coke Bottle": {
    caseSize: 24,
    orderUnit: "cs",
    aliases: ["Diet Coke (20 oz bottle)"],
  },
  "Sprite Bottle": {
    caseSize: 24,
    orderUnit: "cs",
    aliases: ["Sprite"],
  },
  "Tea Bag Lipton": { caseSize: 24, orderUnit: "ea", aliases: ["Tea Bag"] },
  "Water (bottle)": {
    caseSize: 32,
    orderUnit: "ea",
    aliases: ["Bottled Dasani"],
  },
  'Foam Plates 8"': {
    caseSize: 500,
    orderUnit: "sleeve",
    aliases: ["Foam Plates"],
  },
  "Plastic Forks": {
    caseSize: 1000,
    orderUnit: "sleeve",
    aliases: ["Plastic Fork"],
  },
  "Serving Sporks": { caseSize: 144, orderUnit: "ea" },
  "Small Containers 6oz": { caseSize: 500, orderUnit: "cs" },
  "Small Lids 6oz": { caseSize: 500, orderUnit: "cs" },
  "Big Containers": { caseSize: 500, orderUnit: "cs" },
  "Big Lid": { caseSize: 500, orderUnit: "cs" },
  "Catering Bags": {
    caseSize: 100,
    orderUnit: "cs",
    aliases: ["Paper Catering Bag"],
  },
  "Box - Mini Jimmy 12 CT": {
    caseSize: 25,
    orderUnit: "ea",
    aliases: ["Mini Jimmy 12 Count"],
  },
  "JJ Lunch Box": {
    caseSize: 125,
    orderUnit: "cs",
    aliases: ["Box Lunch JJ"],
  },
  "Box Sandwich Catering 18 PC": {
    caseSize: 25,
    orderUnit: "cs",
    aliases: ["18 Piece Party Box"],
  },
  "Box Sandwich Catering 30 PC": {
    caseSize: 25,
    orderUnit: "cs",
    aliases: ["30 Piece Party Box"],
  },
  "Pickle Container W/Lid": { caseSize: 250, orderUnit: "cs" },
};

const aliasIndex = new Map<string, string>();

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const [canonical, entry] of Object.entries(CASE_CATALOG)) {
  aliasIndex.set(normalizeKey(canonical), canonical);
  for (const alias of entry.aliases ?? []) {
    aliasIndex.set(normalizeKey(alias), canonical);
  }
}

export function lookupCatalogEntry(itemName: string): {
  canonical: string;
  entry: CatalogEntry;
} | null {
  const canonical = aliasIndex.get(normalizeKey(itemName));
  if (!canonical) return null;
  return { canonical, entry: CASE_CATALOG[canonical] };
}
