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
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      Sync inbound transfers
    </button>
  );
}
