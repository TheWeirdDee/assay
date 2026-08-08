import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { NewMerchantForm } from "./new-merchant-form";

export const dynamic = "force-dynamic";

export default async function NewMerchantPage() {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#080B09] text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <Link href="/app" className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-200">
          <ArrowLeft className="h-4 w-4" /> Back to merchants
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Create your treasury workspace</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Set your operating policy. Assay configures Cleanverse, Monad, aUSDC, and a managed sandbox wallet.
          </p>
        </div>
        <NewMerchantForm />
      </div>
    </div>
  );
}
