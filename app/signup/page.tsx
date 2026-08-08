import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#080B09] px-6 text-zinc-100">
      <Link href="/">
        <Image src="/assay-logo.svg" alt="Assay" width={150} height={36} className="h-8 w-auto" />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
        <h1 className="mb-6 text-lg font-bold text-zinc-100">Create your Assay account</h1>
        <SignupForm />
      </div>
    </div>
  );
}
