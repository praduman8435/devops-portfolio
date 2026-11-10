"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/radar/actions";
import { buttonClass } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="container-page flex min-h-svh items-center justify-center py-16">
      <form action={action} className="hud-card w-full max-w-sm p-7" aria-describedby={state.error ? "login-error" : undefined}>
        <p className="font-mono text-xs text-dim">
          <span className="text-accent">~/</span>radar · restricted
        </p>
        <h1 className="mt-3 font-mono text-2xl font-bold tracking-[-0.04em]">Authenticate</h1>
        <p className="mt-2 text-sm text-muted">Private tool. Enter your passphrase to continue.</p>

        <label htmlFor="passphrase" className="mt-6 mb-2 block font-mono text-xs text-dim">
          # passphrase
        </label>
        <input
          id="passphrase"
          name="passphrase"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="w-full rounded-md border border-line-2 bg-bg/70 px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors focus:border-accent/60"
        />
        {state.error && (
          <p id="login-error" role="alert" className="mt-3 font-mono text-xs text-danger">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={buttonClass("primary", "md", "mt-6 w-full cursor-pointer")}>
          {pending ? "verifying…" : "unlock →"}
        </button>
      </form>
    </main>
  );
}
