"use client";

import type { ReactNode } from "react";

import type { AuthUser } from "@/types/auth";
import { HeaderIdentity } from "../shared";
import type { ActionStatus, FinanceDecisionFormState, FinanceProfileRow, WidgetState } from "../types";

interface FinanceWorkspaceProps {
  user: AuthUser;
  pendingState: WidgetState | undefined;
  approvedState: WidgetState | undefined;
  pendingProfiles: FinanceProfileRow[];
  approvedProfiles: FinanceProfileRow[];
  financeDecisionForms: Record<number, FinanceDecisionFormState>;
  financeApprovalStatus: Record<number, ActionStatus>;
  handleLogout: () => void;
  updateFinanceDecisionForm: (profileId: number, field: keyof FinanceDecisionFormState, value: string) => void;
  submitFinanceDecision: (profile: FinanceProfileRow, action: "APPROVED" | "REJECTED") => void;
}

function FinanceProfileCard({
  profile,
  children,
}: {
  profile: FinanceProfileRow;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-4">
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-lg font-semibold">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{profile.role}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Start Date</p>
          <p className="mt-1 font-medium">{profile.start_date}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Requirements</p>
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2">
            {profile.requirements || "No requirements available."}
          </p>
        </div>
      </div>
      {children}
    </article>
  );
}

export function FinanceWorkspace({
  user,
  pendingState,
  approvedState,
  pendingProfiles,
  approvedProfiles,
  financeDecisionForms,
  financeApprovalStatus,
  handleLogout,
  updateFinanceDecisionForm,
  submitFinanceDecision,
}: FinanceWorkspaceProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel rise flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <HeaderIdentity user={user} title="Finance Workspace" />
        <button
          onClick={handleLogout}
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Log out
        </button>
      </header>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">1. Premium Hardware Approvals</h2>
        {pendingState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{pendingState.error}</p> : null}
        {!pendingState || pendingState.loading ? <p className="mt-3 text-sm">Loading premium hardware approvals...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pendingProfiles.map((profile) => {
            const form = financeDecisionForms[profile.id] ?? { comments: "" };
            const status = financeApprovalStatus[profile.id];

            return (
              <FinanceProfileCard key={profile.id} profile={profile}>
                <label className="mt-4 block text-sm">
                  <span className="mb-2 block font-medium">Decision Comments</span>
                  <textarea
                    value={form.comments}
                    onChange={(event) => updateFinanceDecisionForm(profile.id, "comments", event.target.value)}
                    rows={3}
                    placeholder="Optional notes for approval history"
                    className="w-full resize-y rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </label>

                {status?.error ? <p className="mt-3 text-xs text-[var(--alert)]">{status.error}</p> : null}
                {status?.message ? <p className="mt-3 text-xs text-[var(--accent-strong)]">{status.message}</p> : null}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => submitFinanceDecision(profile, "REJECTED")}
                    disabled={status?.loading}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--alert)] disabled:opacity-70"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => submitFinanceDecision(profile, "APPROVED")}
                    disabled={status?.loading}
                    className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
                  >
                    {status?.loading ? "Saving..." : "Approve"}
                  </button>
                </div>
              </FinanceProfileCard>
            );
          })}
          {!pendingProfiles.length && pendingState && !pendingState.loading ? <p className="text-sm">No premium hardware approvals are waiting for finance.</p> : null}
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">2. My Approved Premium Hardware</h2>
        {approvedState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{approvedState.error}</p> : null}
        {!approvedState || approvedState.loading ? <p className="mt-3 text-sm">Loading your approvals...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {approvedProfiles.map((profile) => (
            <FinanceProfileCard key={`${profile.onboarding_request_id}-${profile.workflow_run}`} profile={profile} />
          ))}
          {!approvedProfiles.length && approvedState && !approvedState.loading ? <p className="text-sm">You have not approved any premium hardware requests yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
