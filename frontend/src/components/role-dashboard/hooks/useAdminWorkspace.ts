"use client";

import { FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";
import type { RoleWidget } from "@/lib/role-config";

import type {
  ActionStatus,
  AdminEmployeeProfileRow,
  AdminUserEditState,
  AdminUserRow,
  OnboardingRequestRow,
  WidgetState,
} from "../types";
import {
  buildApiUrl,
  isAdminEmployeeProfileRow,
  isAdminUserRow,
  isApprovalHistoryRow,
  isOnboardingRequestRow,
  sortOnboardingRequests,
} from "../utils";

interface UseAdminWorkspaceOptions {
  token: string;
  widgets: RoleWidget[];
  widgetsState: Record<string, WidgetState>;
  fetchWidget: (widget: RoleWidget) => Promise<void>;
}

export function useAdminWorkspace({ token, widgets, widgetsState, fetchWidget }: UseAdminWorkspaceOptions) {
  const [adminUserEditState, setAdminUserEditState] = useState<AdminUserEditState | null>(null);
  const [adminUserStatus, setAdminUserStatus] = useState<Record<number, ActionStatus>>({});
  const [adminEmployeeStatus, setAdminEmployeeStatus] = useState<Record<number, ActionStatus>>({});
  const [adminOnboardingStatus, setAdminOnboardingStatus] = useState<Record<number, ActionStatus>>({});

  const usersState = widgetsState.users;
  const employeeState = widgetsState["employee-profiles"];
  const onboardingState = widgetsState["onboarding-requests"];
  const approvalHistoryState = widgetsState["approval-history"];
  const users = (usersState?.preview ?? []).filter(isAdminUserRow);
  const employeeProfiles = (employeeState?.preview ?? []).filter(isAdminEmployeeProfileRow);
  const onboardingRequests = sortOnboardingRequests((onboardingState?.preview ?? []).filter(isOnboardingRequestRow));
  const approvalHistoryEntries = (approvalHistoryState?.preview ?? []).filter(isApprovalHistoryRow);
  const employeeById = new Map(employeeProfiles.map((profile) => [profile.id, profile]));
  const userById = new Map(users.map((userRow) => [userRow.id, userRow]));

  function startAdminUserEdit(userRow: AdminUserRow) {
    setAdminUserEditState({
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
      role: userRow.role,
      first_name: userRow.first_name ?? "",
      last_name: userRow.last_name ?? "",
      profile_picture: null,
    });
  }

  async function refreshAdminWorkspace() {
    const usersWidget = widgets.find((item) => item.key === "users");
    const employeeWidget = widgets.find((item) => item.key === "employee-profiles");
    const onboardingWidget = widgets.find((item) => item.key === "onboarding-requests");
    const approvalHistoryWidget = widgets.find((item) => item.key === "approval-history");

    if (usersWidget) {
      void fetchWidget(usersWidget);
    }
    if (employeeWidget) {
      void fetchWidget(employeeWidget);
    }
    if (onboardingWidget) {
      void fetchWidget(onboardingWidget);
    }
    if (approvalHistoryWidget) {
      void fetchWidget(approvalHistoryWidget);
    }
  }

  async function submitAdminUserEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminUserEditState) {
      return;
    }

    setAdminUserStatus((current) => ({
      ...current,
      [adminUserEditState.id]: { loading: true, message: null, error: null },
    }));

    try {
      const formData = new FormData();
      formData.append("username", adminUserEditState.username);
      formData.append("email", adminUserEditState.email);
      formData.append("role", adminUserEditState.role);
      formData.append("first_name", adminUserEditState.first_name);
      formData.append("last_name", adminUserEditState.last_name);
      if (adminUserEditState.profile_picture) {
        formData.append("profile_picture", adminUserEditState.profile_picture);
      }

      const response = await fetch(buildApiUrl(`/users/${adminUserEditState.id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message ?? `Request failed (${response.status})`);
      }

      setAdminUserStatus((current) => ({
        ...current,
        [adminUserEditState.id]: { loading: false, message: "User updated", error: null },
      }));
      setAdminUserEditState(null);
      await refreshAdminWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user";
      setAdminUserStatus((current) => ({
        ...current,
        [adminUserEditState.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  async function deleteAdminUser(userRow: AdminUserRow) {
    setAdminUserStatus((current) => ({
      ...current,
      [userRow.id]: { loading: true, message: null, error: null },
    }));

    try {
      await apiRequest(`/users/${userRow.id}`, { method: "DELETE" }, token);
      setAdminUserStatus((current) => ({
        ...current,
        [userRow.id]: { loading: false, message: "User deleted", error: null },
      }));
      await refreshAdminWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      setAdminUserStatus((current) => ({
        ...current,
        [userRow.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  async function deleteAdminEmployee(profile: AdminEmployeeProfileRow) {
    setAdminEmployeeStatus((current) => ({
      ...current,
      [profile.id]: { loading: true, message: null, error: null },
    }));

    try {
      await apiRequest(`/employee-profiles/${profile.id}`, { method: "DELETE" }, token);
      setAdminEmployeeStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: "Employee profile deleted", error: null },
      }));
      await refreshAdminWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete employee profile";
      setAdminEmployeeStatus((current) => ({
        ...current,
        [profile.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  async function deleteAdminOnboardingRequest(request: OnboardingRequestRow) {
    setAdminOnboardingStatus((current) => ({
      ...current,
      [request.id]: { loading: true, message: null, error: null },
    }));

    try {
      await apiRequest(`/onboarding-requests/${request.id}`, { method: "DELETE" }, token);
      setAdminOnboardingStatus((current) => ({
        ...current,
        [request.id]: { loading: false, message: "Onboarding request deleted", error: null },
      }));
      await refreshAdminWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete onboarding request";
      setAdminOnboardingStatus((current) => ({
        ...current,
        [request.id]: { loading: false, message: null, error: message },
      }));
    }
  }

  return {
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
    submitAdminUserEdit,
    startAdminUserEdit,
    deleteAdminUser,
    deleteAdminEmployee,
    deleteAdminOnboardingRequest,
  };
}
