"use client";

import type { AuthUser } from "@/types/auth";
import { HeaderIdentity } from "../shared";
import type {
  ActionStatus,
  FinanceProfileRow,
  ItProvisioningFormState,
  ItProvisioningRow,
  WidgetState,
} from "../types";

interface ItWorkspaceProps {
  user: AuthUser;
  pendingState: WidgetState | undefined;
  provisioningState: WidgetState | undefined;
  pendingProfiles: FinanceProfileRow[];
  createdProvisionings: ItProvisioningRow[];
  itProvisioningForms: Record<number, ItProvisioningFormState>;
  itProvisioningStatus: Record<number, ActionStatus>;
  handleLogout: () => void;
  updateItProvisioningForm: (profileId: number, field: keyof ItProvisioningFormState, value: string) => void;
  submitItReject: (profile: FinanceProfileRow) => void;
  submitItProvisioning: (profile: FinanceProfileRow) => void;
}

export function ItWorkspace({
  user,
  pendingState,
  provisioningState,
  pendingProfiles,
  createdProvisionings,
  itProvisioningForms,
  itProvisioningStatus,
  handleLogout,
  updateItProvisioningForm,
  submitItReject,
  submitItProvisioning,
}: ItWorkspaceProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel rise flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <HeaderIdentity user={user} title="IT Workspace" />
        <button
          onClick={handleLogout}
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Log out
        </button>
      </header>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">1. Employee Profiles for Provisioning</h2>
        {pendingState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{pendingState.error}</p> : null}
        {!pendingState || pendingState.loading ? <p className="mt-3 text-sm">Loading employee profiles...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pendingProfiles.map((profile) => {
            const form = itProvisioningForms[profile.id] ?? { company_email: "", laptop_model: "", configuration_notes: "", comments: "" };
            const status = itProvisioningStatus[profile.id];

            return (
              <article key={profile.id} className="rounded-lg border border-[var(--line)] bg-white p-4">
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
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Hardware</p>
                    <p className="mt-1 font-medium">{profile.hardware_tier}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Requirements</p>
                    <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2">
                      {profile.requirements || "No requirements available."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    value={form.company_email}
                    onChange={(event) => updateItProvisioningForm(profile.id, "company_email", event.target.value)}
                    placeholder="Company email"
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    value={form.laptop_model}
                    onChange={(event) => updateItProvisioningForm(profile.id, "laptop_model", event.target.value)}
                    placeholder="Laptop model"
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                  />
                  <textarea
                    value={form.configuration_notes}
                    onChange={(event) => updateItProvisioningForm(profile.id, "configuration_notes", event.target.value)}
                    placeholder="Configuration notes"
                    rows={3}
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm sm:col-span-2"
                  />
                  <textarea
                    value={form.comments}
                    onChange={(event) => updateItProvisioningForm(profile.id, "comments", event.target.value)}
                    placeholder="Optional decision comments for approval history"
                    rows={3}
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm sm:col-span-2"
                  />
                </div>

                {status?.error ? <p className="mt-3 text-xs text-[var(--alert)]">{status.error}</p> : null}
                {status?.message ? <p className="mt-3 text-xs text-[var(--accent-strong)]">{status.message}</p> : null}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => submitItReject(profile)}
                    disabled={status?.loading}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--alert)] disabled:opacity-70"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => submitItProvisioning(profile)}
                    disabled={status?.loading}
                    className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
                  >
                    {status?.loading ? "Creating..." : "Create IT Provisioning"}
                  </button>
                </div>
              </article>
            );
          })}
          {!pendingProfiles.length && pendingState && !pendingState.loading ? <p className="text-sm">No employee profiles are waiting for IT provisioning.</p> : null}
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">2. Created IT Provisionings</h2>
        {provisioningState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{provisioningState.error}</p> : null}
        {!provisioningState || provisioningState.loading ? <p className="mt-3 text-sm">Loading IT provisionings...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {createdProvisionings.map((provisioning) => (
            <article key={provisioning.id} className="rounded-lg border border-[var(--line)] bg-white p-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-lg font-semibold">{provisioning.employee_name ?? "Unknown employee"}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{provisioning.role ?? "Role unavailable"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Start Date</p>
                  <p className="mt-1 font-medium">{provisioning.start_date ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Hardware</p>
                  <p className="mt-1 font-medium">{provisioning.hardware_tier ?? "-"}</p>
                </div>
                <p><span className="font-semibold">Company Email:</span> {provisioning.company_email}</p>
                <p><span className="font-semibold">Username:</span> {provisioning.username}</p>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Requirements</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2">
                    {provisioning.requirements || "No requirements available."}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Configuration Notes</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2">
                    {provisioning.configuration_notes || "-"}
                  </p>
                </div>
              </div>
            </article>
          ))}
          {!createdProvisionings.length && provisioningState && !provisioningState.loading ? <p className="text-sm">No IT provisionings created yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
