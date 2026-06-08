"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { RoleWidget } from "@/lib/role-config";
import type { AuthUser } from "@/types/auth";
import { HeaderIdentity } from "../shared";
import type {
  ActionStatus,
  EmployeeProfileRow,
  HrCreateProfileState,
  HrEditState,
  HrStartOnboardingState,
  OnboardingRequestRow,
  WidgetState,
} from "../types";
import { canUpdateEmployeeProfile, formatDateTime } from "../utils";

interface HrWorkspaceProps {
  user: AuthUser;
  employeeWidget: RoleWidget | undefined;
  employeeState: WidgetState | undefined;
  onboardingState: WidgetState | undefined;
  employeeProfiles: EmployeeProfileRow[];
  onboardingRequests: OnboardingRequestRow[];
  onboardingActionsReady: boolean;
  employeeNameMap: Map<number, string>;
  hrCreateProfileState: HrCreateProfileState;
  setHrCreateProfileState: Dispatch<SetStateAction<HrCreateProfileState>>;
  hrCreateProfileStatus: ActionStatus;
  hrEditState: HrEditState | null;
  setHrEditState: Dispatch<SetStateAction<HrEditState | null>>;
  hrEditStatus: ActionStatus;
  hrOnboardingForms: Record<number, HrStartOnboardingState>;
  hrOnboardingStatus: Record<number, ActionStatus>;
  hrResubmitStatus: Record<number, ActionStatus>;
  handleLogout: () => void;
  submitHrCreateProfile: (event: FormEvent<HTMLFormElement>) => void;
  submitHrEdit: (event: FormEvent<HTMLFormElement>, widget: RoleWidget) => void;
  startHrEdit: (profile: EmployeeProfileRow) => void;
  cancelHrEdit: () => void;
  updateHrOnboardingForm: (employeeId: number, key: keyof HrStartOnboardingState, value: string) => void;
  submitHrStartOnboarding: (profile: EmployeeProfileRow) => void;
  submitHrResubmitOnboarding: (profile: EmployeeProfileRow, onboardingRequest: OnboardingRequestRow) => void;
}

export function HrWorkspace({
  user,
  employeeWidget,
  employeeState,
  onboardingState,
  employeeProfiles,
  onboardingRequests,
  onboardingActionsReady,
  employeeNameMap,
  hrCreateProfileState,
  setHrCreateProfileState,
  hrCreateProfileStatus,
  hrEditState,
  setHrEditState,
  hrEditStatus,
  hrOnboardingForms,
  hrOnboardingStatus,
  hrResubmitStatus,
  handleLogout,
  submitHrCreateProfile,
  submitHrEdit,
  startHrEdit,
  cancelHrEdit,
  updateHrOnboardingForm,
  submitHrStartOnboarding,
  submitHrResubmitOnboarding,
}: HrWorkspaceProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel rise flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <HeaderIdentity user={user} title="HR Workspace" />
        <button
          onClick={handleLogout}
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Log out
        </button>
      </header>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">1. Create Employee Profile</h2>
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submitHrCreateProfile}>
          <input
            value={hrCreateProfileState.first_name}
            onChange={(event) => setHrCreateProfileState((current) => ({ ...current, first_name: event.target.value }))}
            placeholder="First name"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <input
            value={hrCreateProfileState.last_name}
            onChange={(event) => setHrCreateProfileState((current) => ({ ...current, last_name: event.target.value }))}
            placeholder="Last name"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <input
            value={hrCreateProfileState.role}
            onChange={(event) => setHrCreateProfileState((current) => ({ ...current, role: event.target.value }))}
            placeholder="Role"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={hrCreateProfileState.start_date}
            onChange={(event) => setHrCreateProfileState((current) => ({ ...current, start_date: event.target.value }))}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <select
            value={hrCreateProfileState.hardware_tier}
            onChange={(event) => setHrCreateProfileState((current) => ({ ...current, hardware_tier: event.target.value }))}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm sm:col-span-2"
          >
            <option value="STANDARD">STANDARD</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>

          {hrCreateProfileStatus.error ? <p className="text-xs text-[var(--alert)] sm:col-span-2">{hrCreateProfileStatus.error}</p> : null}
          {hrCreateProfileStatus.message ? <p className="text-xs text-[var(--accent-strong)] sm:col-span-2">{hrCreateProfileStatus.message}</p> : null}

          <button
            type="submit"
            disabled={hrCreateProfileStatus.loading}
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70 sm:col-span-2"
          >
            {hrCreateProfileStatus.loading ? "Creating..." : "Create Employee Profile"}
          </button>
        </form>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">2. Created Employee Profiles</h2>
        {employeeState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{employeeState.error}</p> : null}
        {!employeeState || employeeState.loading ? <p className="mt-3 text-sm">Loading employee profiles...</p> : null}

        <div className="mt-4 max-h-[30rem] space-y-3 overflow-auto pr-1">
          {employeeProfiles.map((profile) => {
            const onboardingForm = hrOnboardingForms[profile.id] ?? { manager_email: "", it_email: "", finance_email: "" };
            const onboardingStatus = hrOnboardingStatus[profile.id];
            const resubmitStatus = hrResubmitStatus[profile.id];
            const onboardingRequest = onboardingRequests.find((request) => request.employee_id === profile.id);
            const canStartOnboarding = onboardingActionsReady && !onboardingRequest;
            const canUpdateProfile = onboardingActionsReady && canUpdateEmployeeProfile(onboardingRequest);
            const canResubmitOnboarding = onboardingActionsReady && onboardingRequest?.current_stage === "HR_REWORK";
            const needsHrAction = canStartOnboarding || canResubmitOnboarding;
            const showFinanceEmail = profile.hardware_tier === "PREMIUM";

            return (
              <article
                key={profile.id}
                className={`rounded-lg border p-4 ${
                  needsHrAction
                    ? "border-[var(--alert)] bg-red-50 shadow-[inset_4px_0_0_var(--alert)]"
                    : "border-[var(--line)] bg-white"
                }`}
              >
                <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <p className="flex flex-wrap items-center gap-2">
                    <span>
                      <span className="font-semibold">Name:</span> {profile.first_name} {profile.last_name}
                    </span>
                    {needsHrAction ? (
                      <span className="rounded-md bg-[var(--alert)] px-2 py-0.5 text-xs font-semibold text-white">
                        Action needed
                      </span>
                    ) : null}
                  </p>
                  <p><span className="font-semibold">Role:</span> {profile.role}</p>
                  <p><span className="font-semibold">Start Date:</span> {profile.start_date}</p>
                  <p><span className="font-semibold">Hardware Tier:</span> {profile.hardware_tier}</p>
                  <p className="sm:col-span-2 lg:col-span-2"><span className="font-semibold">Created At:</span> {formatDateTime(profile.created_at)}</p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {!onboardingActionsReady ? (
                    <p className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--muted)]">
                      Loading onboarding status...
                    </p>
                  ) : canUpdateProfile ? (
                    <button
                      onClick={() => startHrEdit(profile)}
                      className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]"
                    >
                      Update Employee
                    </button>
                  ) : (
                    <p className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--muted)]">
                      Updates are locked while onboarding is in {onboardingRequest?.current_stage}.
                    </p>
                  )}
                </div>

                {hrEditState?.id === profile.id && canUpdateProfile ? (
                  <form className="mt-3 space-y-2 rounded-lg border border-[var(--line)] p-3" onSubmit={(event) => submitHrEdit(event, employeeWidget ?? { key: "employee-profiles", title: "", description: "", endpoint: "/employee-profiles" })}>
                    <p className="text-sm font-semibold">Update Profile #{hrEditState.id}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input value={hrEditState.first_name} onChange={(event) => setHrEditState((current) => (current ? { ...current, first_name: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                      <input value={hrEditState.last_name} onChange={(event) => setHrEditState((current) => (current ? { ...current, last_name: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                      <input value={hrEditState.role} onChange={(event) => setHrEditState((current) => (current ? { ...current, role: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                      <input type="date" value={hrEditState.start_date} onChange={(event) => setHrEditState((current) => (current ? { ...current, start_date: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
                      <select value={hrEditState.hardware_tier} onChange={(event) => setHrEditState((current) => (current ? { ...current, hardware_tier: event.target.value } : current))} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm sm:col-span-2">
                        <option value="STANDARD">STANDARD</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </div>
                    {hrEditStatus.error ? <p className="text-xs text-[var(--alert)]">{hrEditStatus.error}</p> : null}
                    {hrEditStatus.message ? <p className="text-xs text-[var(--accent-strong)]">{hrEditStatus.message}</p> : null}
                    <div className="grid grid-cols-2 gap-2">
                      <button type="submit" disabled={hrEditStatus.loading} className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70">
                        {hrEditStatus.loading ? "Updating..." : "Save Update"}
                      </button>
                      <button type="button" onClick={cancelHrEdit} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}

                <div className="mt-4 rounded-lg border border-[var(--line)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Start Onboarding</p>
                  {!onboardingActionsReady ? (
                    <p className="mt-2 text-xs text-[var(--muted)]">Loading onboarding status...</p>
                  ) : canStartOnboarding ? (
                    <>
                      <div className={`mt-2 grid gap-2 ${showFinanceEmail ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                        <input
                          type="email"
                          value={onboardingForm.manager_email}
                          onChange={(event) => updateHrOnboardingForm(profile.id, "manager_email", event.target.value)}
                          placeholder="Manager email"
                          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                        />
                        <input
                          type="email"
                          value={onboardingForm.it_email}
                          onChange={(event) => updateHrOnboardingForm(profile.id, "it_email", event.target.value)}
                          placeholder="IT email"
                          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                        />
                        {showFinanceEmail ? (
                          <input
                            type="email"
                            value={onboardingForm.finance_email}
                            onChange={(event) => updateHrOnboardingForm(profile.id, "finance_email", event.target.value)}
                            placeholder="Finance email"
                            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                          />
                        ) : null}
                      </div>
                      {onboardingStatus?.error ? <p className="mt-2 text-xs text-[var(--alert)]">{onboardingStatus.error}</p> : null}
                      {onboardingStatus?.message ? <p className="mt-2 text-xs text-[var(--accent-strong)]">{onboardingStatus.message}</p> : null}
                      <button
                        onClick={() => submitHrStartOnboarding(profile)}
                        disabled={onboardingStatus?.loading}
                        className="mt-3 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
                      >
                        {onboardingStatus?.loading ? "Starting..." : "Start Onboarding"}
                      </button>
                    </>
                  ) : canResubmitOnboarding && onboardingRequest ? (
                    <>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Onboarding request is waiting for HR rework.
                      </p>
                      {resubmitStatus?.error ? <p className="mt-2 text-xs text-[var(--alert)]">{resubmitStatus.error}</p> : null}
                      {resubmitStatus?.message ? <p className="mt-2 text-xs text-[var(--accent-strong)]">{resubmitStatus.message}</p> : null}
                      <button
                        onClick={() => submitHrResubmitOnboarding(profile, onboardingRequest)}
                        disabled={resubmitStatus?.loading}
                        className="mt-3 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
                      >
                        {resubmitStatus?.loading ? "Resubmitting..." : "Resubmit Onboarding"}
                      </button>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Onboarding request already exists at {onboardingRequest?.current_stage}.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
          {!employeeProfiles.length && employeeState && !employeeState.loading ? <p className="text-sm">No employee profiles yet.</p> : null}
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">3. Onboarding Requests</h2>
        {onboardingState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{onboardingState.error}</p> : null}
        {!onboardingState || onboardingState.loading ? <p className="mt-3 text-sm">Loading onboarding requests...</p> : null}

        <div className="mt-4 max-h-[32rem] overflow-auto rounded-lg border border-[var(--line)]">
          <table className="w-full min-w-[740px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--paper)] text-left shadow-[0_1px_0_var(--line)]">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Current Stage</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created At</th>
                <th className="px-3 py-2">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {onboardingRequests.map((request) => (
                <tr key={request.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-2">{employeeNameMap.get(request.employee_id) ?? `Employee #${request.employee_id}`}</td>
                  <td className="px-3 py-2">{request.current_stage}</td>
                  <td className="px-3 py-2">{request.status}</td>
                  <td className="px-3 py-2">{formatDateTime(request.created_at)}</td>
                  <td className="px-3 py-2">{formatDateTime(request.updated_at)}</td>
                </tr>
              ))}
              {!onboardingRequests.length && onboardingState && !onboardingState.loading ? (
                <tr>
                  <td className="px-3 py-3 text-sm" colSpan={5}>No onboarding requests yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
