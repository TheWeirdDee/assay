"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-zinc-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#84A93C]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-zinc-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#84A93C]"
        />
      </div>

      {state?.error && <p className="text-xs font-medium text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-[#84A93C] px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-[#96bc46] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        No account?{" "}
        <Link href="/signup" className="font-semibold text-[#84A93C] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
