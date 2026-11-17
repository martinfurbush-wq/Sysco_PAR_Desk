import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { buildParGuide, calculateParUnits, resolveCasePack } from "./calculate-pars";
import { parseInventoryWorkbook } from "./parse-inventory";

const samplesDir = join(process.cwd(), "public", "samples");

function loadSample(name: string) {
  const buffer = readFileSync(join(samplesDir, name));
  return parseInventoryWorkbook(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    name,
  );
}

describe("calculateParUnits", () => {
  it("matches the Sysco workbook ROUNDUP formula", () => {
    const result = calculateParUnits(59.2, 16904.58, 0.2, 32);
    assert.equal(result.par, 38);
  });
});

describe("resolveCasePack", () => {
  it("uses catalog aliases for inventory names", () => {
    const pack = resolveCasePack("Potato Chip Regular", [], "ea");
    assert.equal(pack.caseSize, 72);
    assert.equal(pack.orderUnit, "ea");
    assert.equal(pack.source, "catalog");
  });

  it("infers case size from purchase mode when uncataloged", () => {
    const pack = resolveCasePack("Mystery Item", [10, 10, 20], "lb");
    assert.equal(pack.caseSize, 10);
    assert.equal(pack.source, "inferred");
  });
});

describe("parse + buildParGuide with sample inventory reports", () => {
  it("parses four weeks, excludes produce, and builds French Bread PAR", () => {
    const reports = [
      loadSample("Inventory Report - 0501 - S-11.xls"),
      loadSample("Inventory Report - 0501 - S-10.xls"),
      loadSample("Inventory Report - 0501 - S-9.xls"),
      loadSample("Inventory Report - 0501 - S-8.xls"),
    ];

    assert.equal(reports[0].storeNumber, "0501");
    assert.ok(reports[0].items.some((item) => item.section === "Produce"));

    const guide = buildParGuide(reports);
    assert.equal(guide.excludedProduceCount, 5);
    assert.ok(guide.lines.every((line) => line.section.toLowerCase() !== "produce"));

    const french = guide.lines.find((line) => line.name === "French Bread");
    assert.ok(french);
    assert.equal(french.casePack.caseSize, 32);
    assert.equal(french.par, 38);

    const lettuce = guide.lines.find((line) => line.name === "Lettuce");
    assert.equal(lettuce, undefined);
  });
});
