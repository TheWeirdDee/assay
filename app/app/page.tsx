import Image from "next/image";
import Link from "next/link";
import { Plus, ShieldCheck, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listMerchantsForUser } from "@/lib/merchants/store";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function MerchantsPage() {
  const user = await requireUser();
  const merchants = await listMerchantsForUser(user.id);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <Image src="/assay-icon.svg" alt="Assay" width={36} height={36} className="rounded-xl" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Assay</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your merchants
            </h2>
            <Link
              href="/app/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" /> Connect merchant
            </Link>
          </div>

          {merchants.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
              <ShieldCheck className="h-8 w-8 text-zinc-400" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No merchants connected yet. Add one with your Cleanverse credentials and a signing wallet to start
                operating a real treasury.
              </p>
              <Link
                href="/app/new"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#84A93C] px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-[#96bc46]"
              >
                <Plus className="h-3.5 w-3.5" /> Connect your first merchant
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {merchants.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/app/${m.id}`}
                    className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-50">{m.name}</span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {m.chain}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {m.merchant_wallet_address.slice(0, 8)}…{m.merchant_wallet_address.slice(-6)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
