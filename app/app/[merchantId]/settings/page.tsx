import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireMerchant } from "@/lib/auth/dal";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function MerchantSettingsPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  const { merchant } = await requireMerchant(merchantId);

  return (
    <div className="flex min-h-screen flex-col bg-[#080B09] text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <Link
          href={`/app/${merchantId}`}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {merchant.name}
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Operating policy</h1>
          <p className="mt-1 text-sm text-zinc-400">
            This is the explicit, merchant-set policy the judgment engine reasons against — not a hidden default.
          </p>
        </div>

        <SettingsForm
          merchantId={merchantId}
          initial={{
            solvencyRule: merchant.policy_solvency_rule,
            anomalyTolerance: merchant.policy_anomaly_tolerance,
            escalateTo: merchant.policy_escalate_to,
          }}
        />

        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-xs text-zinc-400">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Configuration (read-only)</h2>
          <div>
            Chain: <span className="font-mono text-zinc-300">{merchant.chain}</span>
          </div>
          <div>
            A-Token: <span className="font-mono text-zinc-300">{merchant.atoken_address}</span>
          </div>
          <div>
            Signing wallet: <span className="font-mono text-zinc-300">{merchant.merchant_wallet_address}</span>
          </div>
          <div>
            Cleanverse API: <span className="font-mono text-zinc-300">{merchant.cleanverse_api_base_url}</span>
          </div>
          <p className="pt-2 text-[11px] text-zinc-500">
            Credential rotation isn&apos;t built yet — to change the Cleanverse API key or wallet, connect this
            merchant again with new values.
          </p>
        </div>
      </div>
    </div>
  );
}
