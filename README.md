# Sysco PAR Desk

Drop Jimmy John's **Inventory (V2)** reports and generate a printable Sysco order guide with PARs. Produce is excluded. Files are parsed in the browser.

## What it does

1. Accepts 1–4 weekly inventory exports (`.xls` / `.xlsx`).
2. Reads usage + adjusted sales for every non-produce item.
3. Calculates PAR with the Sysco workbook formula:
   - UPK = usage ÷ sales × 1000
   - needed = avg UPK × avg sales ÷ 1000 × (1 + buffer)
   - PAR = ROUNDUP(needed ÷ case size)
4. Lets managers tweak PARs, then downloads a PDF order guide (Item / PAR / Unit / Week 1–4) with no on-hand column.

Case sizes come from the 2025 Sysco PAR Calculator catalog when names match; otherwise the app infers from whole-number purchase patterns.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3851](http://127.0.0.1:3851).

```bash
npm test
npm run build
```
