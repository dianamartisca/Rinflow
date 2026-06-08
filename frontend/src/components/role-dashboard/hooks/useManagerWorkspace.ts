"use client";

import { useState } from "react";

import { apiRequest } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import type { RoleWidget } from "@/lib/role-config";

import type { ActionStatus, ManagerReviewFormState, ManagerReviewProfileRow, WidgetState } from "../types";
import { isJobDescriptionRow, isManagerReviewProfileRow } from "../utils";

interface UseManagerWorkspaceOptions {
  token: string;
  user: AuthUser | null;
  widgets: RoleWidget[];
  widgetsState: Record<string, WidgetState>;
  fetchWidget: (widget: RoleWidget) => Promise<void>;
}

export function useManagerWorkspace({ token, user, widgets, widgetsState, fetchWidget }: UseManagerWorkspaceOptions) {
  const [managerReviewForms, setManagerReviewForms] = useState<Record<number, ManagerReviewFormState>>({});
  const [managerReviewStatus, setManagerReviewStatus] = useState<Record<number, ActionStatus>>({});

  const reviewState = widgetsState["manager-review-profiles"];
  const jobDescriptionState = widgetsState["job-descriptions"];
  const reviewProfiles = (reviewState?.preview ?? []).filter(isManagerReviewProfileRow);
  const jobDescriptions = (jobDescriptionState?.preview ?? []).filter(isJobDescriptionRow);

  function updateManagerReviewForm(profileId: number, field: keyof ManagerReviewFormState, value: string) {
    const defaultForm: ManagerReviewFormState = { requirements: "", comments: "" };
    setManagerReviewForms((current) => ({
      ...current,
      [profileId]: {
        ...defaultForm,
        ...(current[profileId] ?? {}),
        [field]: value,
      },
    }));
  }

  async function refreshManagerWorkspace() {
    const reviewWidget = widgets.find((item) => item.key === "manager-review-profiles");
    const jobDescriptionWidget = widgets.find((item) => item.key === "job-descriptions");

    if (reviewWidget) {
      void fetchWidget(reviewWidget);
    }
    if (jobDescriptionWidget) {
      void fetchWidget(jobDescriptionWidget);
    }
  }

  async function submitManagerReject(profile: ManagerReviewProfileRow) {
    setManagerReviewStatus((current) => ({
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
            stage: "MANAGER_REVIEW",
            action: "REJECTED",
            comments: managerReviewForms[profile.id]?.comments.trim() || "Rejected by manager",
          },
        },
        token,
      );

      setManagerReviewStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: "Profile sent back for HR rework", error: null },
      }));
      await refreshManagerWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reject failed";
      setManagerReviewStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  async function submitManagerApprove(profile: ManagerReviewProfileRow) {
    const form = managerReviewForms[profile.id] ?? { requirements: "", comments: "" };

    if (!form.requirements.trim()) {
      setManagerReviewStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: "Job requirements are required" },
      }));
      return;
    }

    setManagerReviewStatus((current) => ({
      ...current,
      [profile.id]: { loading: true, message: null, error: null },
    }));

    try {
      await apiRequest(
        "/job-descriptions",
        {
          method: "POST",
          body: {
            onboarding_request_id: profile.onboarding_request_id,
            workflow_run: profile.workflow_run,
            reviewer_id: user?.id,
            requirements: form.requirements.trim(),
            comments: form.comments.trim() || "Approved by manager",
          },
        },
        token,
      );

      setManagerReviewForms((current) => ({
        ...current,
        [profile.id]: { requirements: "", comments: "" },
      }));
      setManagerReviewStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: "Approved and job description created", error: null },
      }));
      await refreshManagerWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Approve failed";
      setManagerReviewStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  return {
    reviewState,
    jobDescriptionState,
    reviewProfiles,
    jobDescriptions,
    managerReviewForms,
    managerReviewStatus,
    updateManagerReviewForm,
    submitManagerReject,
    submitManagerApprove,
  };
}
