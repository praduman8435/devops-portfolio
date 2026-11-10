"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, isOwner, verifyPassword } from "@/lib/radar/auth";
import { clearUpworkTokens } from "@/lib/radar/upwork";

export interface LoginState {
  error?: string;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const passphrase = String(formData.get("passphrase") ?? "");
  if (!passphrase) return { error: "Enter your passphrase." };
  const result = await verifyPassword(passphrase);
  if (!result.ok) return { error: result.reason };
  await createSession();
  redirect("/radar");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/radar");
}

export async function disconnectUpwork(): Promise<void> {
  if (!(await isOwner())) return;
  await clearUpworkTokens();
  revalidatePath("/radar");
}
