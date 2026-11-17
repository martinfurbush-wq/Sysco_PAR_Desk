"use client";

import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Download, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildParGuide,
  DEFAULT_BUFFER,
  formatWeekLabel,
  money,
} from "@/lib/par/calculate-pars";
import { downloadOrderGuidePdf } from "@/lib/par/generate-order-guide-pdf";
import {
  parseInventoryFile,
  parseInventoryWorkbook,
} from "@/lib/par/parse-inventory";
import type { InventoryReport, ParGuide } from "@/lib/par/types";
import { cn } from "@/lib/utils";

const SAMPLE_FILES = [
  "Inventory Report - 0501 - S-11.xls",
  "Inventory Report - 0501 - S-10.xls",
  "Inventory Report - 0501 - S-9.xls",
  "Inventory Report - 0501 - S-8.xls",
];

type LoadedReport = InventoryReport & { id: string };

function reportId(report: InventoryReport): string {
  return `${report.weekEnding}::${report.fileName}`;
}

export function ParOrderGuide() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reports, setReports] = useState<LoadedReport[]>([]);
  const [bufferPct, setBufferPct] = useState(20);
  const [parOverrides, setParOverrides] = useState<Record<string, number | null>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const guide: ParGuide | null = useMemo(() => {
    if (!reports.length) return null;
    try {
      return buildParGuide(reports, {
        buffer: bufferPct / 100,
        parOverrides,
      });
    } catch {
      return null;
    }
  }, [reports, bufferPct, parOverrides]);

  async function ingestFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) =>
      /\.(xls|xlsx)$/i.test(file.name),
    );
    if (!files.length) {
      setError("Drop Jimmy John's Inventory (V2) .xls or .xlsx files.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const parsed = await Promise.all(files.map((file) => parseInventoryFile(file)));
      setReports((current) => {
        const next = [...current];
        for (const report of parsed) {
          const id = reportId(report);
          const existing = next.findIndex((item) => item.id === id);
          const loaded = { ...report, id };
          if (existing >= 0) next[existing] = loaded;
          else next.push(loaded);
        }
        return next.sort((a, b) => a.weekEnding.localeCompare(b.weekEnding));
      });
      setParOverrides({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse inventory file.");
    } finally {
      setBusy(false);
    }
  }

  async function loadSamples() {
    setError(null);
    setBusy(true);
    try {
      const parsed = await Promise.all(
        SAMPLE_FILES.map(async (name) => {
          const response = await fetch(`/samples/${encodeURIComponent(name)}`);
          if (!response.ok) throw new Error(`Could not load sample ${name}`);
          const buffer = await response.arrayBuffer();
          return parseInventoryWorkbook(buffer, name);
        }),
      );
      setReports(
        parsed
          .map((report) => ({ ...report, id: reportId(report) }))
          .sort((a, b) => a.weekEnding.localeCompare(b.weekEnding)),
      );
      setParOverrides({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load samples.");
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setReports([]);
    setParOverrides({});
    setError(null);
  }

  function updatePar(name: string, value: string) {
    if (value.trim() === "") {
      setParOverrides((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
      return;
    }
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return;
    setParOverrides((current) => ({ ...current, [name]: Math.round(num) }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[1.5rem] border border-[var(--brand-line)] bg-[var(--brand-panel)] px-6 py-8 shadow-[0_20px_60px_rgba(28,25,23,0.06)] sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 0% 0%, rgba(15,118,110,0.12), transparent 42%), radial-gradient(circle at 100% 20%, rgba(180,83,9,0.10), transparent 36%), linear-gradient(135deg, rgba(255,255,255,0.4), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-5">
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-ink)] sm:text-5xl">
              Sysco PAR Desk
            </p>
          </div>
          <p className="max-w-2xl text-base text-[var(--brand-ink-soft)] sm:text-lg">
            Drop weekly inventory reports. We calculate a PAR for every item
            except produce and print a Sysco order guide PDF — no on-hand column.
            Parsing stays in the browser.
          </p>
        </div>
      </header>

      <section
        onDragEnter={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragOver(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void ingestFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-[1.25rem] border-2 border-dashed px-6 py-10 transition-colors sm:px-10",
          dragOver
            ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
            : "border-[var(--brand-line)] bg-white/70",
        )}
      >
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              Drop inventory reports
            </h2>
            <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
              Upload 1–4 weeks of Inventory (V2) exports (.xls / .xlsx). Four weeks
              gives the strongest PAR average.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              Choose files
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void loadSamples()}
            >
              Load store 0501 samples
            </Button>
            {reports.length > 0 ? (
              <Button type="button" variant="outline" onClick={clearAll}>
                <Trash2 />
                Clear
              </Button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void ingestFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {reports.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-5">
            <h3 className="font-[family-name:var(--font-display)] text-xl">
              Loaded weeks
            </h3>
            <ul className="mt-4 space-y-3">
              {reports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-start gap-3 rounded-xl bg-[var(--brand-wash-1)] px-3 py-3"
                >
                  <FileSpreadsheet className="mt-0.5 h-4 w-4 text-[var(--brand-accent)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{report.fileName}</p>
                    <p className="text-xs text-[var(--brand-ink-soft)]">
                      Week ending {report.weekEnding} · Sales{" "}
                      {money(report.adjustedSales)} · {report.items.length} items
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-[var(--brand-ink-soft)] hover:text-red-600"
                    onClick={() =>
                      setReports((current) =>
                        current.filter((item) => item.id !== report.id),
                      )
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-5">
            <h3 className="font-[family-name:var(--font-display)] text-xl">
              PAR settings
            </h3>
            <label className="mt-4 block text-sm text-[var(--brand-ink-soft)]">
              Buffer
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={bufferPct}
                  onChange={(event) => setBufferPct(Number(event.target.value))}
                  className="w-full accent-[var(--brand-accent)]"
                />
                <span className="w-12 text-right font-medium text-[var(--brand-ink)]">
                  {bufferPct}%
                </span>
              </div>
            </label>
            {guide ? (
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[var(--brand-wash-2)] px-3 py-3">
                  <dt className="text-[var(--brand-ink-soft)]">Store</dt>
                  <dd className="font-medium">{guide.storeNumber || "—"}</dd>
                </div>
                <div className="rounded-xl bg-[var(--brand-wash-2)] px-3 py-3">
                  <dt className="text-[var(--brand-ink-soft)]">Avg sales</dt>
                  <dd className="font-medium">{money(guide.avgSales)}</dd>
                </div>
                <div className="rounded-xl bg-[var(--brand-wash-2)] px-3 py-3">
                  <dt className="text-[var(--brand-ink-soft)]">PAR lines</dt>
                  <dd className="font-medium">{guide.lines.length}</dd>
                </div>
                <div className="rounded-xl bg-[var(--brand-wash-2)] px-3 py-3">
                  <dt className="text-[var(--brand-ink-soft)]">Produce skipped</dt>
                  <dd className="font-medium">{guide.excludedProduceCount}</dd>
                </div>
              </dl>
            ) : null}
            <Button
              type="button"
              className="mt-5 w-full"
              disabled={!guide || busy}
              onClick={() => guide && downloadOrderGuidePdf(guide)}
            >
              <Download />
              Download order guide PDF
            </Button>
            <p className="mt-3 text-xs text-[var(--brand-ink-soft)]">
              Default buffer is {(DEFAULT_BUFFER * 100).toFixed(0)}%, matching the
              Sysco PAR Calculator workbook.
            </p>
          </div>
        </section>
      ) : null}

      {guide ? (
        <section className="overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white/85">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--brand-line)] px-5 py-4">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl">
                Order guide preview
              </h3>
              <p className="text-sm text-[var(--brand-ink-soft)]">
                Edit any PAR before downloading. Week columns stay blank on the PDF
                for handwritten orders.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--brand-ink)] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">PAR</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Case</th>
                  {guide.weeks.map((week, index) => (
                    <th key={week.weekEnding} className="px-4 py-3 font-medium">
                      {formatWeekLabel(week.weekEnding, index)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.lines.map((line, index) => {
                  const prev = guide.lines[index - 1];
                  const showSection = !prev || prev.section !== line.section;
                  return (
                    <FragmentRows
                      key={line.name}
                      showSection={showSection}
                      section={line.section}
                      colSpan={4 + Math.max(guide.weeks.length, 1)}
                      name={line.name}
                      par={line.par}
                      calculatedPar={line.calculatedPar}
                      orderUnit={line.casePack.orderUnit}
                      caseSize={line.casePack.caseSize}
                      caseSource={line.casePack.source}
                      weekCount={guide.weeks.length}
                      onParChange={(value) => updatePar(line.name, value)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function FragmentRows({
  showSection,
  section,
  colSpan,
  name,
  par,
  calculatedPar,
  orderUnit,
  caseSize,
  caseSource,
  weekCount,
  onParChange,
}: {
  showSection: boolean;
  section: string;
  colSpan: number;
  name: string;
  par: number | null;
  calculatedPar: number | null;
  orderUnit: string;
  caseSize: number;
  caseSource: string;
  weekCount: number;
  onParChange: (value: string) => void;
}) {
  return (
    <>
      {showSection ? (
        <tr className="border-t border-[var(--brand-line)] bg-[var(--brand-wash-1)]">
          <td
            colSpan={colSpan}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]"
          >
            {section}
          </td>
        </tr>
      ) : null}
      <tr className="border-t border-[var(--brand-line)] hover:bg-[var(--brand-wash-2)]/50">
        <td className="px-4 py-2 font-medium text-[var(--brand-ink)]">{name}</td>
        <td className="px-4 py-2">
          <input
            type="number"
            min={0}
            step={1}
            value={par ?? ""}
            onChange={(event) => onParChange(event.target.value)}
            className="w-16 rounded-md border border-[var(--brand-line)] bg-white px-2 py-1 text-center"
            title={
              calculatedPar != null
                ? `Calculated PAR: ${calculatedPar}`
                : "No usage data"
            }
          />
        </td>
        <td className="px-4 py-2 text-[var(--brand-ink-soft)]">{orderUnit}</td>
        <td className="px-4 py-2 text-xs text-[var(--brand-ink-soft)]">
          {caseSize}
          {caseSource !== "catalog" ? ` (${caseSource})` : ""}
        </td>
        {Array.from({ length: weekCount }).map((_, index) => (
          <td key={index} className="px-4 py-2 text-[var(--brand-ink-soft)]">
            —
          </td>
        ))}
      </tr>
    </>
  );
}
