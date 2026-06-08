"use client";

import { useState } from "react";

import { apiRequest } from "@/lib/api";
import type { RoleWidget } from "@/lib/role-config";

import type { ActionStatus, ItProvisioningFormState, ItProvisioningProfileRow, WidgetState } from "../types";
import { isFinanceProfileRow, isItProvisioningRow } from "../utils";

interface UseItWorkspaceOptions {
  token: string;
  widgets: RoleWidget[];
  widgetsState: Record<string, WidgetState>;
  fetchWidget: (widget: RoleWidget) => Promise<void>;
}

export function useItWorkspace({ token, widgets, widgetsState, fetchWidget }: UseItWorkspaceOptions) {
  const [itProvisioningForms, setItProvisioningForms] = useState<Record<number, ItProvisioningFormState>>({});
  const [itProvisioningStatus, setItProvisioningStatus] = useState<Record<number, ActionStatus>>({});

  const pendingState = widgetsState["it-provisioning-profiles"];
  const provisioningState = widgetsState["it-provisioning"];
  const pendingProfiles = (pendingState?.preview ?? []).filter(isFinanceProfileRow);
  const createdProvisionings = (provisioningState?.preview ?? []).filter(isItProvisioningRow);

  function updateItProvisioningForm(profileId: number, field: keyof ItProvisioningFormState, value: string) {
    const defaultForm: ItProvisioningFormState = { company_email: "", laptop_model: "", configuration_notes: "", comments: "" };
    setItProvisioningForms((current) => ({
      ...current,
      [profileId]: {
        ...defaultForm,
        ...(current[profileId] ?? {}),
        [field]: value,
      },
    }));
  }

  async function refreshItWorkspace() {
    const pendingWidget = widgets.find((item) => item.key === "it-provisioning-profiles");
    const provisioningWidget = widgets.find((item) => item.key === "it-provisioning");

    if (pendingWidget) {
      void fetchWidget(pendingWidget);
    }
    if (provisioningWidget) {
      void fetchWidget(provisioningWidget);
    }
  }

  async function submitItReject(profile: ItProvisioningProfileRow) {
    setItProvisioningStatus((current) => ({
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
            stage: "IT_PROVISIONING",
            action: "REJECTED",
            comments: itProvisioningForms[profile.id]?.comments.trim() || "Rejected by IT",
          },
        },
        token,
      );

      setItProvisioningStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: "Sent back for HR rework", error: null },
      }));
      await refreshItWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reject failed";
      setItProvisioningStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  async function submitItProvisioning(profile: ItProvisioningProfileRow) {
    const form = itProvisioningForms[profile.id] ?? { company_email: "", laptop_model: "", configuration_notes: "", comments: "" };

    if (!form.company_email.trim()) {
      setItProvisioningStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: "Company email is required" } }));
      return;
    }

    if (!form.configuration_notes.trim()) {
      setItProvisioningStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: "Configuration notes are required" } }));
      return;
    }

    if (!form.laptop_model.trim()) {
      setItProvisioningStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: "Laptop model is required" } }));
      return;
    }

    setItProvisioningStatus((current) => ({
      ...current,
      [profile.id]: { loading: true, message: null, error: null },
    }));

    try {
      await apiRequest(
        "/it-provisioning",
        {
          method: "POST",
          body: {
            onboarding_request_id: profile.onboarding_request_id,
            workflow_run: profile.workflow_run,
            company_email: form.company_email.trim(),
            laptop_model: form.laptop_model.trim(),
            configuration_notes: form.configuration_notes.trim(),
            comments: form.comments.trim() || "Provisioned by IT",
          },
        },
        token,
      );

      setItProvisioningForms((current) => ({
        ...current,
        [profile.id]: { company_email: "", laptop_model: "", configuration_notes: "", comments: "" },
      }));
      setItProvisioningStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: "IT provisioning created", error: null },
      }));
      await refreshItWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create IT provisioning";
      setItProvisioningStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  return {
    pendingState,
    provisioningState,
    pendingProfiles,
    createdProvisionings,
    itProvisioningForms,
    itProvisioningStatus,
    updateItProvisioningForm,
    submitItReject,
    submitItProvisioning,
  };
}
