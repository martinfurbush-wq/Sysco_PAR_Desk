import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatWeekLabel, money } from "./calculate-pars";
import type { ParGuide } from "./types";

type AutoTableDoc = jsPDF & {
  lastAutoTable?: { finalY: number };
};

export function downloadOrderGuidePdf(guide: ParGuide): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  }) as AutoTableDoc;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 36;
  let y = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Sysco Order Guide", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    [
      guide.storeLocation || `Store ${guide.storeNumber || ""}`,
      guide.storeNumber ? `Store # ${guide.storeNumber}` : "",
    ]
      .filter(Boolean)
      .join("  ·  "),
    margin,
    y,
  );
  y += 14;

  const weekBits = guide.weeks
    .map(
      (week, index) =>
        `${formatWeekLabel(week.weekEnding, index)} (${money(week.sales)})`,
    )
    .join("  ·  ");
  doc.text(
    `Weeks: ${weekBits || "—"}  ·  Avg sales ${money(guide.avgSales)}  ·  Buffer ${(guide.buffer * 100).toFixed(0)}%`,
    margin,
    y,
    { maxWidth: pageWidth - margin * 2 },
  );
  y += 18;

  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    "PAR = ROUNDUP(((Avg UPK × Avg Sales) / 1000) × (1 + buffer) ÷ case size). Produce excluded. Week columns are blank for writing orders.",
    margin,
    y,
    { maxWidth: pageWidth - margin * 2 },
  );
  doc.setTextColor(0);
  y += 16;

  const weekHeaders = guide.weeks.map((week, index) =>
    formatWeekLabel(week.weekEnding, index),
  );
  while (weekHeaders.length < 4) {
    weekHeaders.push(`Week ${weekHeaders.length + 1}`);
  }

  const body: Array<
    | Array<string>
    | Array<{
        content: string;
        colSpan: number;
        styles: {
          fillColor: [number, number, number];
          textColor: [number, number, number];
          fontStyle: "bold";
          fontSize: number;
        };
      }>
  > = [];

  let lastSection = "";
  for (const line of guide.lines) {
    if (line.section !== lastSection) {
      lastSection = line.section;
      body.push([
        {
          content: line.section.toUpperCase(),
          colSpan: 7,
          styles: {
            fillColor: [28, 25, 23],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ]);
    }
    body.push([
      line.name,
      line.par == null ? "—" : String(line.par),
      line.casePack.orderUnit,
      "",
      "",
      "",
      "",
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Item", "PAR", "Unit", ...weekHeaders.slice(0, 4)]],
    body,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [210, 205, 198],
      lineWidth: 0.4,
      textColor: [28, 25, 23],
      valign: "middle",
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 190 },
      1: { cellWidth: 36, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 40, halign: "center" },
      3: { cellWidth: 56 },
      4: { cellWidth: 56 },
      5: { cellWidth: 56 },
      6: { cellWidth: 56 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      const page = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Sysco Order Guide · page ${page}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 18,
        { align: "center" },
      );
      doc.setTextColor(0);
    },
  });

  const storeSlug = (guide.storeNumber || "store").replace(/\W+/g, "");
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`Sysco-Order-Guide-${storeSlug}-${stamp}.pdf`);
}
