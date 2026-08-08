"use client";

import { useTransition } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncInboundAction } from "@/app/actions/payments";

export function SyncInboundButton({ merchantId }: { merchantId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => syncInboundAction(merchantId))}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      Sync inbound transfers
    </button>
  );
}
