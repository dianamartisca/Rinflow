"use client";

import type { AuthUser } from "@/types/auth";
import { HeaderIdentity, ThemeToggle } from "../shared";
import type {
  ActionStatus,
  JobDescriptionRow,
  ManagerReviewFormState,
  ManagerReviewProfileRow,
  WidgetState,
} from "../types";
import { buildApiUrl, formatDateTime } from "../utils";

interface ManagerWorkspaceProps {
  user: AuthUser;
  reviewState: WidgetState | undefined;
  jobDescriptionState: WidgetState | undefined;
  reviewProfiles: ManagerReviewProfileRow[];
  jobDescriptions: JobDescriptionRow[];
  managerReviewForms: Record<number, ManagerReviewFormState>;
  managerReviewStatus: Record<number, ActionStatus>;
  managerAiStatus: Record<number, ActionStatus>;
  handleLogout: () => void;
  updateManagerReviewForm: (profileId: number, field: keyof ManagerReviewFormState, value: string) => void;
  generateManagerRequirements: (profile: ManagerReviewProfileRow) => void;
  submitManagerReject: (profile: ManagerReviewProfileRow) => void;
  submitManagerApprove: (profile: ManagerReviewProfileRow) => void;
}

export function ManagerWorkspace({
  user,
  reviewState,
  jobDescriptionState,
  reviewProfiles,
  jobDescriptions,
  managerReviewForms,
  managerReviewStatus,
  managerAiStatus,
  handleLogout,
  updateManagerReviewForm,
  generateManagerRequirements,
  submitManagerReject,
  submitManagerApprove,
}: ManagerWorkspaceProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel rise flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <HeaderIdentity user={user} title="Manager Workspace" />
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">1. Employee Profiles for Review</h2>
        {reviewState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{reviewState.error}</p> : null}
        {!reviewState || reviewState.loading ? <p className="mt-3 text-sm">Loading employee profiles...</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {reviewProfiles.map((profile) => {
            const form = managerReviewForms[profile.id] ?? { requirements: "", comments: "" };
            const status = managerReviewStatus[profile.id];
            const aiStatus = managerAiStatus[profile.id];

            return (
              <article key={profile.id} className="rounded-lg border border-[var(--line)] bg-white p-4">
                <p className="text-lg font-semibold">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{profile.role}</p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Start Date</dt>
                    <dd className="mt-1 font-medium">{profile.start_date}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Hardware</dt>
                    <dd className="mt-1 font-medium">{profile.hardware_tier}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Created</dt>
                    <dd className="mt-1 font-medium">{formatDateTime(profile.created_at)}</dd>
                  </div>
                </dl>

                <label className="mt-4 block text-sm">
                  <span className="mb-2 flex flex-wrap items-center justify-between gap-2 font-medium">
                    Job Requirements
                    <button
                      type="button"
                      onClick={() => generateManagerRequirements(profile)}
                      disabled={aiStatus?.loading}
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--accent)] disabled:opacity-70"
                    >
                      {aiStatus?.loading ? "Generating..." : "Generate with AI"}
                    </button>
                  </span>
                  <textarea
                    value={form.requirements}
                    onChange={(event) => updateManagerReviewForm(profile.id, "requirements", event.target.value)}
                    rows={5}
                    placeholder="Responsibilities, required skills, tools, access needs..."
                    className="w-full resize-y rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </label>
                {aiStatus?.error ? <p className="mt-2 text-xs text-[var(--alert)]">{aiStatus.error}</p> : null}
                {aiStatus?.message ? <p className="mt-2 text-xs text-[var(--accent-strong)]">{aiStatus.message}</p> : null}

                <label className="mt-4 block text-sm">
                  <span className="mb-2 block font-medium">Decision Comments</span>
                  <textarea
                    value={form.comments}
                    onChange={(event) => updateManagerReviewForm(profile.id, "comments", event.target.value)}
                    rows={3}
                    placeholder="Optional notes"
                    className="w-full resize-y rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </label>

                {status?.error ? <p className="mt-2 text-xs text-[var(--alert)]">{status.error}</p> : null}
                {status?.message ? <p className="mt-2 text-xs text-[var(--accent-strong)]">{status.message}</p> : null}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => submitManagerReject(profile)}
                    disabled={status?.loading}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:border-[var(--alert)] disabled:opacity-70"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => submitManagerApprove(profile)}
                    disabled={status?.loading}
                    className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
                  >
                    {status?.loading ? "Saving..." : "Approve"}
                  </button>
                </div>
              </article>
            );
          })}
          {!reviewProfiles.length && reviewState && !reviewState.loading ? <p className="text-sm">No employee profiles are waiting for manager review.</p> : null}
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">2. Created Job Descriptions</h2>
        {jobDescriptionState?.error ? <p className="mt-3 text-sm text-[var(--alert)]">{jobDescriptionState.error}</p> : null}
        {!jobDescriptionState || jobDescriptionState.loading ? <p className="mt-3 text-sm">Loading job descriptions...</p> : null}

        <div className="mt-4 max-h-[28rem] overflow-auto rounded-lg border border-[var(--line)]">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--paper)] text-left shadow-[0_1px_0_var(--line)]">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Created At</th>
                <th className="px-3 py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {jobDescriptions.map((jobDescription) => (
                <tr key={jobDescription.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-2">{jobDescription.employee_name ?? "Unknown employee"}</td>
                  <td className="px-3 py-2">{formatDateTime(jobDescription.created_at)}</td>
                  <td className="px-3 py-2">
                    <a
                      href={buildApiUrl(jobDescription.download_url ?? jobDescription.content)}
                      download
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--accent)]"
                    >
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))}
              {!jobDescriptions.length && jobDescriptionState && !jobDescriptionState.loading ? (
                <tr>
                  <td className="px-3 py-3 text-sm" colSpan={3}>No job descriptions created yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
