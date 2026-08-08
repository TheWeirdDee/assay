"use client";

import { useTransition } from "react";
import { updatePolicyAction } from "@/app/actions/merchants";

interface Props {
  merchantId: string;
  initial: { solvencyRule: boolean; anomalyTolerance: "low" | "medium" | "high"; escalateTo: string };
}

export function SettingsForm({ merchantId, initial }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updatePolicyAction(merchantId, formData))}
      className="flex flex-col gap-4"
    >
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" name="solvencyRule" defaultChecked={initial.solvencyRule} />
        Hold outbound payouts that would exceed cleared inflows
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="anomalyTolerance" className="text-xs font-semibold text-zinc-400">
          Anomaly tolerance
        </label>
        <select
          id="anomalyTolerance"
          name="anomalyTolerance"
          defaultValue={initial.anomalyTolerance}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100"
        >
          <option value="low">Low — escalate aggressively</option>
          <option value="medium">Medium — balanced</option>
          <option value="high">High — escalate rarely</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="escalateTo" className="text-xs font-semibold text-zinc-400">
          Escalate to
        </label>
        <input
          id="escalateTo"
          name="escalateTo"
          defaultValue={initial.escalateTo}
          required
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-xl bg-[#84A93C] px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-[#96bc46] disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save policy"}
      </button>
    </form>
  );
}
