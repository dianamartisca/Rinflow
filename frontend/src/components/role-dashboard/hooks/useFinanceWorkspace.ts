"use client";

import { useState } from "react";

import { apiRequest } from "@/lib/api";
import type { RoleWidget } from "@/lib/role-config";

import type { ActionStatus, FinanceDecisionFormState, FinanceProfileRow, WidgetState } from "../types";
import { isFinanceProfileRow } from "../utils";

interface UseFinanceWorkspaceOptions {
  token: string;
  widgets: RoleWidget[];
  widgetsState: Record<string, WidgetState>;
  fetchWidget: (widget: RoleWidget) => Promise<void>;
}

export function useFinanceWorkspace({ token, widgets, widgetsState, fetchWidget }: UseFinanceWorkspaceOptions) {
  const [financeApprovalStatus, setFinanceApprovalStatus] = useState<Record<number, ActionStatus>>({});
  const [financeDecisionForms, setFinanceDecisionForms] = useState<Record<number, FinanceDecisionFormState>>({});

  const pendingState = widgetsState["finance-approval-profiles"];
  const approvedState = widgetsState["finance-approved-profiles"];
  const pendingProfiles = (pendingState?.preview ?? []).filter(isFinanceProfileRow);
  const approvedProfiles = (approvedState?.preview ?? []).filter(isFinanceProfileRow);

  function updateFinanceDecisionForm(profileId: number, field: keyof FinanceDecisionFormState, value: string) {
    const defaultForm: FinanceDecisionFormState = { comments: "" };
    setFinanceDecisionForms((current) => ({
      ...current,
      [profileId]: {
        ...defaultForm,
        ...(current[profileId] ?? {}),
        [field]: value,
      },
    }));
  }

  async function refreshFinanceWorkspace() {
    const pendingWidget = widgets.find((item) => item.key === "finance-approval-profiles");
    const approvedWidget = widgets.find((item) => item.key === "finance-approved-profiles");

    if (pendingWidget) {
      void fetchWidget(pendingWidget);
    }
    if (approvedWidget) {
      void fetchWidget(approvedWidget);
    }
  }

  async function submitFinanceDecision(profile: FinanceProfileRow, action: "APPROVED" | "REJECTED") {
    const form = financeDecisionForms[profile.id] ?? { comments: "" };
    setFinanceApprovalStatus((current) => ({
      ...current,
      [profile.id]: { loading: true, message: null, error: null },
    }));

    try {
      await apiRequest(
        "/approval-history",
        {
          method: "POST",
          body: {
            onboarding_request_id: profile.onboarding_request_id,
            workflow_run: profile.workflow_run,
            stage: "FINANCE_APPROVAL",
            action,
            comments: form.comments.trim() || (action === "APPROVED" ? "Approved by finance" : "Rejected by finance"),
          },
        },
        token,
      );

      setFinanceApprovalStatus((current) => ({
        ...current,
        [profile.id]: {
          loading: false,
          message: action === "APPROVED" ? "Premium hardware approved" : "Sent back for HR rework",
          error: null,
        },
      }));
      setFinanceDecisionForms((current) => ({
        ...current,
        [profile.id]: { comments: "" },
      }));
      await refreshFinanceWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : `${action === "APPROVED" ? "Approve" : "Reject"} failed`;
      setFinanceApprovalStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  return {
    pendingState,
    approvedState,
    pendingProfiles,
    approvedProfiles,
    financeDecisionForms,
    financeApprovalStatus,
    updateFinanceDecisionForm,
    submitFinanceDecision,
  };
}
