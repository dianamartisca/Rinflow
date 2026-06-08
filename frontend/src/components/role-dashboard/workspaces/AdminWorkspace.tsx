"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { AuthUser } from "@/types/auth";
import { HeaderIdentity, UserAvatar } from "../shared";
import type {
  ActionStatus,
  AdminEmployeeProfileRow,
  AdminUserEditState,
  AdminUserRow,
  ApprovalHistoryRow,
  OnboardingRequestRow,
  WidgetState,
} from "../types";
import { buildApiUrl, formatDateTime } from "../utils";

interface AdminWorkspaceProps {
  user: AuthUser;
  usersState: WidgetState | undefined;
  employeeState: WidgetState | undefined;
  onboardingState: WidgetState | undefined;
  approvalHistoryState: WidgetState | undefined;
  users: AdminUserRow[];
  employeeProfiles: AdminEmployeeProfileRow[];
  onboardingRequests: OnboardingRequestRow[];
  approvalHistoryEntries: ApprovalHistoryRow[];
  employeeById: Map<number, AdminEmployeeProfileRow>;
  userById: Map<number, AdminUserRow>;
  adminUserEditState: AdminUserEditState | null;
  setAdminUserEditState: Dispatch<SetStateAction<AdminUserEditState | null>>;
  adminUserStatus: Record<number, ActionStatus>;
  adminEmployeeStatus: Record<number, ActionStatus>;
  adminOnboardingStatus: Record<number, ActionStatus>;
  handleLogout: () => void;
  submitAdminUserEdit: (event: FormEvent<HTMLFormElement>) => void;
  startAdminUserEdit: (userRow: AdminUserRow) => void;
  deleteAdminUser: (userRow: AdminUserRow) => void;
  deleteAdminEmployee: (profile: AdminEmployeeProfileRow) => void;
  deleteAdminOnboardingRequest: (request: OnboardingRequestRow) => void;
}

export function AdminWorkspace({
  user,
  usersState,
  employeeState,
  onboardingState,
  approvalHistoryState,
  users,
  employeeProfiles,
  onboardingRequests,
  approvalHistoryEntries,
  employeeById,
  userById,
  adminUserEditState,
  setAdminUserEditState,
  adminUserStatus,
  adminEmployeeStatus,
  adminOnboardingStatus,
  handleLogout,
  submitAdminUserEdit,
  startAdminUserEdit,
  deleteAdminUser,
  deleteAdminEmployee,
  deleteAdminOnboardingRequest,
}: AdminWorkspaceProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel rise flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <HeaderIdentity user={user} title="Admin Workspace" />
        <button
          onClick={handleLogout}
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Log out
        </button>
      </header>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">1. Users</h2>
        {usersState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{usersState.error}</p> : null}
        {!usersState || usersState.loading ? <p className="mt-3 text-sm">Loading users...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {users.map((row) => {
            const status = adminUserStatus[row.id];

            return (
              <article key={row.id} className="rounded-lg border border-[var(--line)] bg-white p-4">
                {adminUserEditState?.id === row.id ? (
                  <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitAdminUserEdit}>
                    <input value={adminUserEditState.username} onChange={(event) => setAdminUserEditState((current) => (current ? { ...current, username: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                    <input type="email" value={adminUserEditState.email} onChange={(event) => setAdminUserEditState((current) => (current ? { ...current, email: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                    <input value={adminUserEditState.first_name} onChange={(event) => setAdminUserEditState((current) => (current ? { ...current, first_name: event.target.value } : current))} placeholder="First name" className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                    <input value={adminUserEditState.last_name} onChange={(event) => setAdminUserEditState((current) => (current ? { ...current, last_name: event.target.value } : current))} placeholder="Last name" className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                    <select value={adminUserEditState.role} onChange={(event) => setAdminUserEditState((current) => (current ? { ...current, role: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm sm:col-span-2">
                      <option value="ADMIN">ADMIN</option>
                      <option value="HR">HR</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="IT">IT</option>
                    </select>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(event) => setAdminUserEditState((current) => (current ? { ...current, profile_picture: event.target.files?.[0] ?? null } : current))}
                      className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm sm:col-span-2"
                    />
                    {status?.error ? <p className="text-xs text-[var(--alert)] sm:col-span-2">{status.error}</p> : null}
                    <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                      <button type="submit" disabled={status?.loading} className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70">
                        {status?.loading ? "Saving..." : "Save"}
                      </button>
                      <button type="button" onClick={() => setAdminUserEditState(null)} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <UserAvatar user={row} />
                      <div>
                        <p className="font-semibold">{[row.first_name, row.last_name].filter(Boolean).join(" ") || row.username}</p>
                        <p className="text-xs text-[var(--muted)]">{row.email}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p><span className="font-semibold">Name:</span> {[row.first_name, row.last_name].filter(Boolean).join(" ") || "-"}</p>
                      <p><span className="font-semibold">Role:</span> {row.role}</p>
                      <p><span className="font-semibold">Username:</span> {row.username}</p>
                      <p><span className="font-semibold">Email:</span> {row.email}</p>
                    </div>
                    {status?.error ? <p className="mt-3 text-xs text-[var(--alert)]">{status.error}</p> : null}
                    {status?.message ? <p className="mt-3 text-xs text-[var(--accent-strong)]">{status.message}</p> : null}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => startAdminUserEdit(row)} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">
                        Edit
                      </button>
                      <button onClick={() => deleteAdminUser(row)} disabled={status?.loading} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--alert)] disabled:opacity-70">
                        {status?.loading ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
          {!users.length && usersState && !usersState.loading ? <p className="text-sm">No users found.</p> : null}
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">2. Employee Profiles</h2>
        {employeeState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{employeeState.error}</p> : null}
        {!employeeState || employeeState.loading ? <p className="mt-3 text-sm">Loading employee profiles...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {employeeProfiles.map((profile) => {
            const status = adminEmployeeStatus[profile.id];
            const itProvisioning = profile.it_provisioning;

            return (
              <article key={profile.id} className="rounded-lg border border-[var(--line)] bg-white p-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <p><span className="font-semibold">Name:</span> {profile.first_name} {profile.last_name}</p>
                  <p><span className="font-semibold">Role:</span> {profile.role}</p>
                  <p><span className="font-semibold">Start Date:</span> {profile.start_date}</p>
                  <p><span className="font-semibold">Hardware:</span> {profile.hardware_tier}</p>
                  <p><span className="font-semibold">Stage:</span> {profile.onboarding_stage ?? "Not started"}</p>
                  <p><span className="font-semibold">Status:</span> {profile.onboarding_status ?? "-"}</p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {profile.job_description_url ? (
                    <a href={buildApiUrl(profile.job_description_url)} download className="rounded-lg border border-[var(--line)] px-3 py-2 text-center text-xs font-semibold hover:border-[var(--accent)]">
                      Download Job Description
                    </a>
                  ) : (
                    <p className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">No job description file</p>
                  )}
                  <div className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs">
                    <p className="font-semibold">IT Provisioning</p>
                    {itProvisioning ? (
                      <div className="mt-2 space-y-1 text-[var(--muted)]">
                        <p>Email: {itProvisioning.company_email}</p>
                        <p>Username: {itProvisioning.username}</p>
                        <p>Laptop: {itProvisioning.laptop_model ?? "-"}</p>
                        <p>Notes: {itProvisioning.configuration_notes ?? "-"}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-[var(--muted)]">No IT provisioning details</p>
                    )}
                  </div>
                </div>

                {status?.error ? <p className="mt-3 text-xs text-[var(--alert)]">{status.error}</p> : null}
                {status?.message ? <p className="mt-3 text-xs text-[var(--accent-strong)]">{status.message}</p> : null}
                <button onClick={() => deleteAdminEmployee(profile)} disabled={status?.loading} className="mt-4 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--alert)] disabled:opacity-70">
                  {status?.loading ? "Deleting..." : "Delete"}
                </button>
              </article>
            );
          })}
          {!employeeProfiles.length && employeeState && !employeeState.loading ? <p className="text-sm">No employee profiles found.</p> : null}
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">3. Onboarding Requests</h2>
        {onboardingState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{onboardingState.error}</p> : null}
        {approvalHistoryState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{approvalHistoryState.error}</p> : null}
        {!onboardingState || onboardingState.loading ? <p className="mt-3 text-sm">Loading onboarding requests...</p> : null}

        <div className="mt-4 space-y-4">
          {onboardingRequests.map((request) => {
            const employee = employeeById.get(request.employee_id);
            const historyEntries = approvalHistoryEntries.filter((entry) => entry.onboarding_request_id === request.id);
            const status = adminOnboardingStatus[request.id];

            return (
              <article key={request.id} className="rounded-lg border border-[var(--line)] bg-white p-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
                  <p><span className="font-semibold">Employee:</span> {employee ? `${employee.first_name} ${employee.last_name}` : "Unknown"}</p>
                  <p><span className="font-semibold">Role:</span> {employee?.role ?? "-"}</p>
                  <p><span className="font-semibold">Status:</span> {request.status}</p>
                  <p><span className="font-semibold">Stage:</span> {request.current_stage}</p>
                  <p><span className="font-semibold">Created:</span> {formatDateTime(request.created_at)}</p>
                </div>

                <div className="mt-4 border-t border-[var(--line)] pt-4">
                  <p className="mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Approval History</p>
                  {approvalHistoryState && approvalHistoryState.loading ? <p className="mt-3 text-sm">Loading approval history...</p> : null}
                  <div className="mt-3 space-y-2">
                    {historyEntries.map((entry) => {
                      const reviewer = userById.get(entry.reviewer_id);
                      const reviewerName = reviewer
                        ? [reviewer.first_name, reviewer.last_name].filter(Boolean).join(" ") || reviewer.username
                        : "Unknown reviewer";

                      return (
                        <div key={entry.id} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs">
                          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                            <p><span className="font-semibold">Stage:</span> {entry.stage}</p>
                            <p><span className="font-semibold">Action:</span> {entry.action}</p>
                            <p><span className="font-semibold">Reviewer:</span> {reviewerName}</p>
                            <p><span className="font-semibold">Created:</span> {formatDateTime(entry.created_at ?? undefined)}</p>
                          </div>
                          {entry.comments ? <p className="mt-2 text-[var(--muted)]">{entry.comments}</p> : null}
                        </div>
                      );
                    })}
                    {!historyEntries.length && approvalHistoryState && !approvalHistoryState.loading ? (
                      <p className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">No approval history entries yet.</p>
                    ) : null}
                  </div>
                </div>

                {status?.error ? <p className="mt-3 text-xs text-[var(--alert)]">{status.error}</p> : null}
                {status?.message ? <p className="mt-3 text-xs text-[var(--accent-strong)]">{status.message}</p> : null}
                <button
                  onClick={() => deleteAdminOnboardingRequest(request)}
                  disabled={status?.loading}
                  className="mt-4 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--alert)] disabled:opacity-70"
                >
                  {status?.loading ? "Deleting..." : "Delete Onboarding Request"}
                </button>
              </article>
            );
          })}
          {!onboardingRequests.length && onboardingState && !onboardingState.loading ? <p className="text-sm">No onboarding requests found.</p> : null}
        </div>
      </section>
    </div>
  );
}
