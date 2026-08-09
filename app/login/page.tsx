import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#080B09] px-6 text-zinc-100">
      <Link href="/">
        <Image src="/assay-logo.svg" alt="Assay" width={150} height={36} className="h-8 w-auto" />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
        <h1 className="mb-6 text-lg font-bold text-zinc-100">Sign in to Assay</h1>
        <LoginForm />
        <div className="mt-6 border-t border-zinc-800 pt-5 text-center">
          <p className="mb-3 text-xs text-zinc-500">New to Assay?</p>
          <a href="/signup" className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#84A93C]/60 px-4 text-sm font-bold text-[#a8d14a] transition-colors hover:bg-[#84A93C]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a8d14a]">
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
