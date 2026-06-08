"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { getStoredAuth, storeAuth } from "@/lib/auth-storage";
import type { LoginResponse } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingAuth = getStoredAuth();
    if (existingAuth?.token) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = await apiRequest<LoginResponse>("/users/login", {
        method: "POST",
        body: { email, password },
      });

      storeAuth(payload);
      router.replace("/dashboard");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel rise w-full max-w-md p-8 sm:p-10">
      <div className="flex items-center gap-3">
        <Image src="/logo.svg" alt="Rinflow logo" width={48} height={48} className="shrink-0" priority />
        <h1 className="headline text-4xl font-semibold">Rinflow</h1>
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Sign in with your email and password to continue.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            placeholder="Enter your password"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-[var(--alert)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
