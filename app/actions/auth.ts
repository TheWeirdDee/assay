"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

const CredentialsSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim().toLowerCase(),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
});

export type AuthFormState = { error?: string } | undefined;

export async function signupAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = CredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, password } = parsed.data;

  const existing = await sql`select id from users where email = ${email}`;
  if (existing.length > 0) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const rows = await sql<{ id: string }[]>`
    insert into users (email, password_hash) values (${email}, ${passwordHash}) returning id
  `;
  await createSession(rows[0].id);
  redirect("/app");
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = CredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }
  const { email, password } = parsed.data;

  const rows = await sql<{ id: string; password_hash: string }[]>`
    select id, password_hash from users where email = ${email}
  `;
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
