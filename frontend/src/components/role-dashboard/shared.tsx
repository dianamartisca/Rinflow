"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { AuthUser } from "@/types/auth";
import type { AdminUserRow } from "./types";
import { buildApiUrl } from "./utils";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreviewRecord({ data }: { data: unknown }) {
  if (!data || typeof data !== "object") {
    return <p className="text-xs text-[var(--muted)]">No details available.</p>;
  }

  const pairs = Object.entries(data).slice(0, 4);

  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {pairs.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="font-medium text-[var(--muted)]">{key}</dt>
          <dd className="truncate">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function UserAvatar({ user, size = 48 }: { user: AuthUser | AdminUserRow; size?: number }) {
  const initialsSource = user.username || user.email || "?";

  if (user.profile_picture) {
    return (
      <Image
        src={buildApiUrl(user.profile_picture)}
        alt={`${user.username} profile picture`}
        width={size}
        height={size}
        unoptimized
        className="shrink-0 rounded-full border border-[var(--line)] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-sm font-semibold text-[var(--muted)]"
      style={{ width: size, height: size }}
    >
      {initialsSource.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/logo.svg"
        alt="Rinflow logo"
        width={size}
        height={size}
        className="theme-logo-light shrink-0"
        priority
      />
      <Image
        src="/logo-white.svg"
        alt="Rinflow logo"
        width={size}
        height={size}
        className="theme-logo-dark shrink-0"
        priority
      />
    </span>
  );
}

export function HeaderIdentity({ user, title }: { user: AuthUser; title: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4">
        <Logo />
        <h1 className="headline text-3xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <UserAvatar user={user} />
        <p className="text-sm text-[var(--muted)]">{user.email}</p>
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      return nextTheme;
    });
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white hover:border-[var(--accent)]"
    >
      <Image
        src="/moon-icon.svg"
        alt=""
        width={18}
        height={18}
        className="theme-icon-light"
        aria-hidden="true"
      />
      <Image
        src="/moon-icon-white.svg"
        alt=""
        width={18}
        height={18}
        className="theme-icon-dark"
        aria-hidden="true"
      />
    </button>
  );
}
