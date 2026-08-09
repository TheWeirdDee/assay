"use client";

import { Download, FileSpreadsheet } from "lucide-react";

export function ExportButton({ merchantId }: { merchantId: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <a
        href={`/api/export-log?merchantId=${merchantId}&format=json`}
        download="assay-audit-log.json"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:px-3"
      >
        <Download className="h-3.5 w-3.5 text-zinc-500" />
        <span className="hidden xl:inline">Export Audit Pack (JSON)</span><span className="sr-only xl:hidden">Export audit JSON</span>
      </a>

      <a
        href={`/api/export-log?merchantId=${merchantId}&format=csv`}
        download="assay-audit-log.csv"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:px-3"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" />
        <span className="hidden xl:inline">Export CSV Spreadsheet</span><span className="sr-only xl:hidden">Export audit CSV</span>
      </a>
    </div>
  );
}
