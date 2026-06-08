"use client";

import { FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";
import type { RoleWidget } from "@/lib/role-config";

import type {
  ActionStatus,
  EmployeeProfileRow,
  HrCreateProfileState,
  HrEditState,
  HrStartOnboardingState,
  OnboardingRequestRow,
  WidgetState,
} from "../types";
import { isEmployeeProfileRow, isFutureWorkday, isOnboardingRequestRow, sortOnboardingRequests } from "../utils";

interface UseHrWorkspaceOptions {
  token: string;
  widgets: RoleWidget[];
  widgetsState: Record<string, WidgetState>;
  fetchWidget: (widget: RoleWidget) => Promise<void>;
}

export function useHrWorkspace({ token, widgets, widgetsState, fetchWidget }: UseHrWorkspaceOptions) {
  const [hrEditState, setHrEditState] = useState<HrEditState | null>(null);
  const [hrEditStatus, setHrEditStatus] = useState<ActionStatus>({ loading: false, message: null, error: null });
  const [hrCreateProfileState, setHrCreateProfileState] = useState<HrCreateProfileState>({
    first_name: "",
    last_name: "",
    role: "",
    start_date: "",
    hardware_tier: "STANDARD",
  });
  const [hrCreateProfileStatus, setHrCreateProfileStatus] = useState<ActionStatus>({
    loading: false,
    message: null,
    error: null,
  });
  const [hrOnboardingForms, setHrOnboardingForms] = useState<Record<number, HrStartOnboardingState>>({});
  const [hrOnboardingStatus, setHrOnboardingStatus] = useState<Record<number, ActionStatus>>({});
  const [hrResubmitStatus, setHrResubmitStatus] = useState<Record<number, ActionStatus>>({});

  const employeeWidget = widgets.find((item) => item.key === "employee-profiles");
  const employeeState = widgetsState["employee-profiles"];
  const onboardingState = widgetsState["onboarding-requests"];
  const onboardingRequests = sortOnboardingRequests((onboardingState?.preview ?? []).filter(isOnboardingRequestRow));
  const onboardingRequestByEmployeeId = new Map(onboardingRequests.map((request) => [request.employee_id, request]));
  const employeeProfiles = (employeeState?.preview ?? []).filter(isEmployeeProfileRow).sort((first, second) => {
    const firstRequest = onboardingRequestByEmployeeId.get(first.id);
    const secondRequest = onboardingRequestByEmployeeId.get(second.id);
    const firstNeedsAction = !firstRequest || firstRequest.current_stage === "HR_REWORK";
    const secondNeedsAction = !secondRequest || secondRequest.current_stage === "HR_REWORK";

    if (firstNeedsAction !== secondNeedsAction) {
      return firstNeedsAction ? -1 : 1;
    }

    const secondCreatedAt = new Date(second.created_at ?? "").getTime();
    const firstCreatedAt = new Date(first.created_at ?? "").getTime();
    return (Number.isNaN(secondCreatedAt) ? 0 : secondCreatedAt) - (Number.isNaN(firstCreatedAt) ? 0 : firstCreatedAt);
  });
  const onboardingActionsReady = Boolean(onboardingState && !onboardingState.loading && !onboardingState.error);
  const employeeNameMap = new Map<number, string>();
  employeeProfiles.forEach((profile) => {
    employeeNameMap.set(profile.id, `${profile.first_name} ${profile.last_name}`);
  });

  function startHrEdit(profile: EmployeeProfileRow) {
    setHrEditState({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      start_date: profile.start_date,
      hardware_tier: profile.hardware_tier,
    });
    setHrEditStatus({ loading: false, message: null, error: null });
  }

  function cancelHrEdit() {
    setHrEditState(null);
    setHrEditStatus({ loading: false, message: null, error: null });
  }

  async function submitHrEdit(event: FormEvent<HTMLFormElement>, widget: RoleWidget) {
    event.preventDefault();

    if (!hrEditState) {
      return;
    }

    setHrEditStatus({ loading: true, message: null, error: null });

    if (!isFutureWorkday(hrEditState.start_date)) {
      setHrEditStatus({
        loading: false,
        message: null,
        error: "Start date must be a future working day, Monday-Friday",
      });
      return;
    }

    try {
      await apiRequest(
        `/employee-profiles/${hrEditState.id}`,
        {
          method: "PUT",
          body: {
            first_name: hrEditState.first_name,
            last_name: hrEditState.last_name,
            role: hrEditState.role,
            start_date: hrEditState.start_date,
            hardware_tier: hrEditState.hardware_tier,
          },
        },
        token,
      );

      setHrEditStatus({ loading: false, message: "Profile updated", error: null });
      void fetchWidget(widget);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      setHrEditStatus({ loading: false, message: null, error: message });
    }
  }

  function updateHrOnboardingForm(employeeId: number, key: keyof HrStartOnboardingState, value: string) {
    const defaultForm: HrStartOnboardingState = { manager_email: "", it_email: "", finance_email: "" };
    setHrOnboardingForms((current) => ({
      ...current,
      [employeeId]: {
        ...defaultForm,
        ...(current[employeeId] ?? {}),
        [key]: value,
      },
    }));
  }

  async function submitHrCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const requiredFields: Array<keyof HrCreateProfileState> = ["first_name", "last_name", "role", "start_date", "hardware_tier"];
    for (const field of requiredFields) {
      if (!hrCreateProfileState[field]?.trim()) {
        setHrCreateProfileStatus({ loading: false, message: null, error: `${field.replace("_", " ")} is required` });
        return;
      }
    }

    if (!isFutureWorkday(hrCreateProfileState.start_date)) {
      setHrCreateProfileStatus({
        loading: false,
        message: null,
        error: "Start date must be a future working day, Monday-Friday",
      });
      return;
    }

    setHrCreateProfileStatus({ loading: true, message: null, error: null });

    try {
      await apiRequest("/employee-profiles", { method: "POST", body: hrCreateProfileState }, token);
      setHrCreateProfileState({ first_name: "", last_name: "", role: "", start_date: "", hardware_tier: "STANDARD" });
      setHrCreateProfileStatus({ loading: false, message: "Employee profile created", error: null });

      if (employeeWidget) {
        void fetchWidget(employeeWidget);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed";
      setHrCreateProfileStatus({ loading: false, message: null, error: message });
    }
  }

  async function submitHrStartOnboarding(profile: EmployeeProfileRow) {
    const form = hrOnboardingForms[profile.id] ?? { manager_email: "", it_email: "", finance_email: "" };

    if (!form.manager_email.trim()) {
      setHrOnboardingStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: "Manager email is required" } }));
      return;
    }

    if (!form.it_email.trim()) {
      setHrOnboardingStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: "IT email is required" } }));
      return;
    }

    if (profile.hardware_tier === "PREMIUM" && !form.finance_email.trim()) {
      setHrOnboardingStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: "Finance email is required for PREMIUM" } }));
      return;
    }

    setHrOnboardingStatus((current) => ({ ...current, [profile.id]: { loading: true, message: null, error: null } }));

    try {
      const payload: Record<string, unknown> = {
        employee_id: profile.id,
        manager_email: form.manager_email.trim(),
        it_email: form.it_email.trim(),
      };

      if (profile.hardware_tier === "PREMIUM" && form.finance_email.trim()) {
        payload.finance_email = form.finance_email.trim();
      }

      await apiRequest("/onboarding-requests", { method: "POST", body: payload }, token);
      setHrOnboardingStatus((current) => ({ ...current, [profile.id]: { loading: false, message: "Onboarding started", error: null } }));

      const onboardingWidget = widgets.find((item) => item.key === "onboarding-requests");
      if (onboardingWidget) {
        void fetchWidget(onboardingWidget);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start onboarding";
      setHrOnboardingStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: message } }));
    }
  }

  async function submitHrResubmitOnboarding(profile: EmployeeProfileRow, onboardingRequest: OnboardingRequestRow) {
    setHrResubmitStatus((current) => ({ ...current, [profile.id]: { loading: true, message: null, error: null } }));

    try {
      await apiRequest(`/onboarding-requests/${onboardingRequest.id}/resubmit`, { method: "POST" }, token);
      setHrResubmitStatus((current) => ({ ...current, [profile.id]: { loading: false, message: "Onboarding resubmitted", error: null } }));

      const onboardingWidget = widgets.find((item) => item.key === "onboarding-requests");
      if (onboardingWidget) {
        void fetchWidget(onboardingWidget);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resubmit onboarding";
      setHrResubmitStatus((current) => ({ ...current, [profile.id]: { loading: false, message: null, error: message } }));
    }
  }

  return {
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
    submitHrCreateProfile,
    submitHrEdit,
    startHrEdit,
    cancelHrEdit,
    updateHrOnboardingForm,
    submitHrStartOnboarding,
    submitHrResubmitOnboarding,
  };
}
