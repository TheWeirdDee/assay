"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { generateApassAction } from "@/app/actions/merchants";

/**
 * Issues the wallet's Cleanverse A-Pass via generate_apass (no ID/passport upload) instead of
 * sending the merchant to the SumSub document-upload magic-link.
 */
export function VerifyIdentityButton({ merchantId }: { merchantId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setResult(await generateApassAction(merchantId));
          })
        }
        className="inline-flex items-center gap-2 rounded-lg bg-[#a8d14a] px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-[#96bc46] disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Verify identity
      </button>
      {result && (
        <p
          className={`flex items-start gap-1.5 text-xs font-medium ${result.ok ? "text-emerald-400" : "text-red-400"}`}
        >
          {!result.ok && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          {result.message}
        </p>
      )}
    </div>
  );
}
