"use client";

import { Download, FileSpreadsheet } from "lucide-react";

export function ExportButton({ merchantId }: { merchantId: string }) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={`/api/export-log?merchantId=${merchantId}&format=json`}
        download="assay-audit-log.json"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
      >
        <Download className="h-3.5 w-3.5 text-zinc-500" />
        Export Audit Pack (JSON)
      </a>

      <a
        href={`/api/export-log?merchantId=${merchantId}&format=csv`}
        download="assay-audit-log.csv"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" />
        Export CSV Spreadsheet
      </a>
    </div>
  );
}
