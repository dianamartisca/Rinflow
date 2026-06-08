import type {
  AdminEmployeeProfileRow,
  AdminUserRow,
  ApprovalHistoryRow,
  EmployeeProfileRow,
  FinanceProfileRow,
  ItProvisioningRow,
  JobDescriptionRow,
  ManagerReviewProfileRow,
  OnboardingRequestRow,
} from "./types";

export function toPreview(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    return [payload];
  }

  return [];
}

export function toItemCount(payload: unknown): number {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (payload && typeof payload === "object") {
    return 1;
  }

  return 0;
}

export function getActionKey(widgetKey: string, actionKey: string): string {
  return `${widgetKey}:${actionKey}`;
}

export function resolveEndpoint(template: string, values: Record<string, string>): string {
  return template.replace(/:([a-zA-Z_]+)/g, (_, key: string) => encodeURIComponent(values[key] ?? ""));
}

export function isEmployeeProfileRow(value: unknown): value is EmployeeProfileRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.first_name === "string" &&
    typeof record.last_name === "string" &&
    typeof record.role === "string" &&
    typeof record.start_date === "string" &&
    typeof record.hardware_tier === "string"
  );
}

export function isOnboardingRequestRow(value: unknown): value is OnboardingRequestRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.employee_id === "number" &&
    typeof record.current_stage === "string" &&
    typeof record.status === "string"
  );
}

export function isApprovalHistoryRow(value: unknown): value is ApprovalHistoryRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.onboarding_request_id === "number" &&
    typeof record.workflow_run === "number" &&
    typeof record.reviewer_id === "number" &&
    typeof record.stage === "string" &&
    typeof record.action === "string"
  );
}

export function isManagerReviewProfileRow(value: unknown): value is ManagerReviewProfileRow {
  if (!isEmployeeProfileRow(value)) {
    return false;
  }

  const record = value as unknown as Record<string, unknown>;
  return typeof record.onboarding_request_id === "number" && typeof record.workflow_run === "number";
}

export function isFinanceProfileRow(value: unknown): value is FinanceProfileRow {
  if (!isEmployeeProfileRow(value)) {
    return false;
  }

  const record = value as unknown as Record<string, unknown>;
  return (
    typeof record.onboarding_request_id === "number" &&
    typeof record.workflow_run === "number" &&
    typeof record.requirements === "string"
  );
}

export function isItProvisioningRow(value: unknown): value is ItProvisioningRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.onboarding_request_id === "number" &&
    typeof record.workflow_run === "number" &&
    typeof record.company_email === "string" &&
    typeof record.username === "string"
  );
}

export function isAdminUserRow(value: unknown): value is AdminUserRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.username === "string" &&
    typeof record.email === "string" &&
    typeof record.role === "string"
  );
}

export function isAdminEmployeeProfileRow(value: unknown): value is AdminEmployeeProfileRow {
  return isEmployeeProfileRow(value);
}

export function isJobDescriptionRow(value: unknown): value is JobDescriptionRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.onboarding_request_id === "number" &&
    typeof record.workflow_run === "number" &&
    typeof record.content === "string"
  );
}

export function sortOnboardingRequests(rows: OnboardingRequestRow[]): OnboardingRequestRow[] {
  return [...rows].sort((first, second) => {
    const createdAtDifference = new Date(second.created_at).getTime() - new Date(first.created_at).getTime();

    if (createdAtDifference !== 0) {
      return createdAtDifference;
    }

    return second.id - first.id;
  });
}

export function toWidgetPreview(widgetKey: string, payload: unknown): unknown[] {
  const preview = toPreview(payload);

  if (widgetKey !== "onboarding-requests") {
    return preview;
  }

  return sortOnboardingRequests(preview.filter(isOnboardingRequestRow));
}

export function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function buildApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";
  return `${baseUrl}${path}`;
}

export function isFutureWorkday(value: string): boolean {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = date.getDay();
  return date > today && day >= 1 && day <= 5;
}

export function canUpdateEmployeeProfile(onboardingRequest: OnboardingRequestRow | undefined): boolean {
  return !onboardingRequest || onboardingRequest.current_stage === "HR_REWORK";
}
