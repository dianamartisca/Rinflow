"use client";

import { HeaderIdentity, PreviewRecord, ThemeToggle } from "./shared";
import { getActionKey } from "./utils";
import { useAdminWorkspace } from "./hooks/useAdminWorkspace";
import { useDashboardData } from "./hooks/useDashboardData";
import { useFinanceWorkspace } from "./hooks/useFinanceWorkspace";
import { useHrWorkspace } from "./hooks/useHrWorkspace";
import { useItWorkspace } from "./hooks/useItWorkspace";
import { useManagerWorkspace } from "./hooks/useManagerWorkspace";
import { useWidgetActions } from "./hooks/useWidgetActions";
import { AdminWorkspace } from "./workspaces/AdminWorkspace";
import { FinanceWorkspace } from "./workspaces/FinanceWorkspace";
import { HrWorkspace } from "./workspaces/HrWorkspace";
import { ItWorkspace } from "./workspaces/ItWorkspace";
import { ManagerWorkspace } from "./workspaces/ManagerWorkspace";

export function RoleDashboard() {
  const { user, token, widgets, widgetActions, widgetsState, fetchWidget, handleLogout } = useDashboardData();
  const widgetActionState = useWidgetActions({ token, fetchWidget });
  const admin = useAdminWorkspace({ token, widgets, widgetsState, fetchWidget });
  const hr = useHrWorkspace({ token, widgets, widgetsState, fetchWidget });
  const manager = useManagerWorkspace({ token, user, widgets, widgetsState, fetchWidget });
  const finance = useFinanceWorkspace({ token, widgets, widgetsState, fetchWidget });
  const it = useItWorkspace({ token, widgets, widgetsState, fetchWidget });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="mono text-sm text-[var(--muted)]">Checking session...</p>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <AdminWorkspace
        user={user}
        usersState={admin.usersState}
        employeeState={admin.employeeState}
        onboardingState={admin.onboardingState}
        approvalHistoryState={admin.approvalHistoryState}
        users={admin.users}
        employeeProfiles={admin.employeeProfiles}
        onboardingRequests={admin.onboardingRequests}
        approvalHistoryEntries={admin.approvalHistoryEntries}
        employeeById={admin.employeeById}
        userById={admin.userById}
        adminUserEditState={admin.adminUserEditState}
        setAdminUserEditState={admin.setAdminUserEditState}
        adminUserStatus={admin.adminUserStatus}
        adminEmployeeStatus={admin.adminEmployeeStatus}
        adminOnboardingStatus={admin.adminOnboardingStatus}
        handleLogout={handleLogout}
        submitAdminUserEdit={(event) => void admin.submitAdminUserEdit(event)}
        startAdminUserEdit={admin.startAdminUserEdit}
        deleteAdminUser={(row) => void admin.deleteAdminUser(row)}
        deleteAdminEmployee={(profile) => void admin.deleteAdminEmployee(profile)}
        deleteAdminOnboardingRequest={(request) => void admin.deleteAdminOnboardingRequest(request)}
      />
    );
  }

  if (user.role === "IT") {
    return (
      <ItWorkspace
        user={user}
        pendingState={it.pendingState}
        provisioningState={it.provisioningState}
        pendingProfiles={it.pendingProfiles}
        createdProvisionings={it.createdProvisionings}
        itProvisioningForms={it.itProvisioningForms}
        itProvisioningStatus={it.itProvisioningStatus}
        handleLogout={handleLogout}
        updateItProvisioningForm={it.updateItProvisioningForm}
        submitItReject={(profile) => void it.submitItReject(profile)}
        submitItProvisioning={(profile) => void it.submitItProvisioning(profile)}
      />
    );
  }

  if (user.role === "FINANCE") {
    return (
      <FinanceWorkspace
        user={user}
        pendingState={finance.pendingState}
        approvedState={finance.approvedState}
        pendingProfiles={finance.pendingProfiles}
        approvedProfiles={finance.approvedProfiles}
        financeDecisionForms={finance.financeDecisionForms}
        financeApprovalStatus={finance.financeApprovalStatus}
        handleLogout={handleLogout}
        updateFinanceDecisionForm={finance.updateFinanceDecisionForm}
        submitFinanceDecision={(profile, action) => void finance.submitFinanceDecision(profile, action)}
      />
    );
  }

  if (user.role === "MANAGER") {
    return (
      <ManagerWorkspace
        user={user}
        reviewState={manager.reviewState}
        jobDescriptionState={manager.jobDescriptionState}
        reviewProfiles={manager.reviewProfiles}
        jobDescriptions={manager.jobDescriptions}
        managerReviewForms={manager.managerReviewForms}
        managerReviewStatus={manager.managerReviewStatus}
        managerAiStatus={manager.managerAiStatus}
        handleLogout={handleLogout}
        updateManagerReviewForm={manager.updateManagerReviewForm}
        generateManagerRequirements={(profile) => void manager.generateManagerRequirements(profile)}
        submitManagerReject={(profile) => void manager.submitManagerReject(profile)}
        submitManagerApprove={(profile) => void manager.submitManagerApprove(profile)}
      />
    );
  }

  if (user.role === "HR") {
    return (
      <HrWorkspace
        user={user}
        employeeWidget={hr.employeeWidget}
        employeeState={hr.employeeState}
        onboardingState={hr.onboardingState}
        employeeProfiles={hr.employeeProfiles}
        onboardingRequests={hr.onboardingRequests}
        onboardingActionsReady={hr.onboardingActionsReady}
        employeeNameMap={hr.employeeNameMap}
        hrCreateProfileState={hr.hrCreateProfileState}
        setHrCreateProfileState={hr.setHrCreateProfileState}
        hrCreateProfileStatus={hr.hrCreateProfileStatus}
        hrEditState={hr.hrEditState}
        setHrEditState={hr.setHrEditState}
        hrEditStatus={hr.hrEditStatus}
        hrOnboardingForms={hr.hrOnboardingForms}
        hrOnboardingStatus={hr.hrOnboardingStatus}
        hrResubmitStatus={hr.hrResubmitStatus}
        handleLogout={handleLogout}
        submitHrCreateProfile={(event) => void hr.submitHrCreateProfile(event)}
        submitHrEdit={(event, widget) => void hr.submitHrEdit(event, widget)}
        startHrEdit={hr.startHrEdit}
        cancelHrEdit={hr.cancelHrEdit}
        updateHrOnboardingForm={hr.updateHrOnboardingForm}
        submitHrStartOnboarding={(profile) => void hr.submitHrStartOnboarding(profile)}
        submitHrResubmitOnboarding={(profile, onboardingRequest) => void hr.submitHrResubmitOnboarding(profile, onboardingRequest)}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel rise flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <HeaderIdentity user={user} title={`${user.role} Workspace`} />
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

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget, index) => {
          const state = widgetsState[widget.key];
          const isLoading = !state || state.loading;
          const actions = widgetActions[widget.key] ?? [];
          const delayClass = index % 2 === 0 ? "[animation-delay:100ms]" : "[animation-delay:180ms]";
          const previewListClassName =
            widget.key === "onboarding-requests"
              ? "mt-4 space-y-2 pr-1"
              : "mt-4 max-h-72 space-y-2 overflow-auto pr-1";

          return (
            <article key={widget.key} className={`panel rise p-5 ${delayClass}`}>
              <h2 className="text-lg font-semibold">{widget.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{widget.description}</p>

              <div className="mt-4 rounded-lg border border-[var(--line)] bg-white px-3 py-2">
                {isLoading ? <p className="mono text-xs">Loading...</p> : null}
                {!isLoading && state?.error ? <p className="text-xs text-[var(--alert)]">{state.error}</p> : null}
                {!isLoading && !state?.error ? <p className="mono text-xs">Records: {state.itemCount ?? 0}</p> : null}
              </div>

              {!isLoading && !state?.error && state?.preview?.length ? (
                <div className={previewListClassName}>
                  {state.preview.map((row, rowIndex) => (
                    <div key={`${widget.key}-${rowIndex}`} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2">
                      <PreviewRecord data={row} />
                    </div>
                  ))}
                </div>
              ) : null}

              {actions.length ? (
                <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-4">
                  <p className="mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Quick Actions</p>
                  {actions.map((action) => {
                    const compositeKey = getActionKey(widget.key, action.key);
                    const currentValues = widgetActionState.actionForms[compositeKey] ?? {};
                    const status = widgetActionState.actionStatus[compositeKey];

                    return (
                      <form
                        key={action.key}
                        className="space-y-2 rounded-lg border border-[var(--line)] p-3"
                        onSubmit={(event) => void widgetActionState.submitAction(event, widget, action)}
                      >
                        <p className="text-sm font-semibold">{action.label}</p>
                        {action.fields.map((field) => (
                          <label key={field.key} className="block text-xs">
                            <span className="mb-1 block text-[var(--muted)]">{field.label}</span>
                            {field.options?.length ? (
                              <select
                                value={currentValues[field.key] ?? ""}
                                onChange={(event) => widgetActionState.updateActionForm(widget.key, action.key, field.key, event.target.value)}
                                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                              >
                                <option value="">Select...</option>
                                {field.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type ?? "text"}
                                value={currentValues[field.key] ?? ""}
                                onChange={(event) => widgetActionState.updateActionForm(widget.key, action.key, field.key, event.target.value)}
                                placeholder={field.placeholder}
                                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                              />
                            )}
                          </label>
                        ))}

                        {status?.error ? <p className="text-xs text-[var(--alert)]">{status.error}</p> : null}
                        {status?.message ? <p className="text-xs text-[var(--accent-strong)]">{status.message}</p> : null}

                        <button
                          type="submit"
                          disabled={status?.loading}
                          className="w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-70"
                        >
                          {status?.loading ? `${action.label}...` : action.label}
                        </button>
                      </form>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
