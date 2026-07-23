"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

const inputCls =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition-colors focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20";
const labelCls = "mb-1.5 block text-sm font-medium text-brand-50";

export default function LoginForm() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className={labelCls}>E-mail</label>
        <input
          name="email"
          type="email"
          required
          autoFocus
          placeholder="seu@email.com"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Senha</label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className={inputCls}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 rounded-lg border border-red-300/40 bg-red-500/90 px-3 py-2 text-sm font-medium text-white shadow-sm">
          <span>⚠️</span> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-brand-700 shadow-lg transition-colors hover:bg-brand-50 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
