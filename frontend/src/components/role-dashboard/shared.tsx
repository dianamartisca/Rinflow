"use client";

import Image from "next/image";

import type { AuthUser } from "@/types/auth";
import type { AdminUserRow } from "./types";
import { buildApiUrl } from "./utils";

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

export function HeaderIdentity({ user, title }: { user: AuthUser; title: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-4">
        <Image src="/logo.svg" alt="Rinflow logo" width={48} height={48} className="shrink-0" priority />
        <h1 className="headline text-3xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <UserAvatar user={user} />
        <p className="text-sm text-[var(--muted)]">{user.email}</p>
      </div>
    </div>
  );
}
