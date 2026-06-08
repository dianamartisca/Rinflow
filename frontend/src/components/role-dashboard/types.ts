import type { RoleWidget } from "@/lib/role-config";

export interface WidgetState {
  loading: boolean;
  error: string | null;
  itemCount: number | null;
  preview: unknown[];
}

export interface ActionStatus {
  loading: boolean;
  message: string | null;
  error: string | null;
}

export interface EmployeeProfileRow {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  start_date: string;
  hardware_tier: string;
  created_at?: string;
}

export interface HrEditState {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  start_date: string;
  hardware_tier: string;
}

export interface OnboardingRequestRow {
  id: number;
  employee_id: number;
  current_stage: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalHistoryRow {
  id: number;
  onboarding_request_id: number;
  workflow_run: number;
  reviewer_id: number;
  stage: string;
  action: string;
  comments?: string | null;
  created_at?: string | null;
}

export interface ManagerReviewProfileRow extends EmployeeProfileRow {
  onboarding_request_id: number;
  workflow_run: number;
  onboarding_created_at?: string;
}

export interface FinanceProfileRow extends EmployeeProfileRow {
  onboarding_request_id: number;
  workflow_run: number;
  requirements: string;
  job_description_url?: string | null;
  approved_at?: string | null;
}

export type ItProvisioningProfileRow = FinanceProfileRow;

export interface ItProvisioningRow {
  id: number;
  onboarding_request_id: number;
  workflow_run: number;
  company_email: string;
  username: string;
  laptop_model?: string | null;
  configuration_notes?: string | null;
  employee_name?: string | null;
  role?: string | null;
  start_date?: string | null;
  hardware_tier?: string | null;
  requirements?: string | null;
  created_at?: string;
}

export interface AdminUserRow {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
  profile_picture?: string | null;
  created_at?: string;
}

export interface AdminEmployeeProfileRow extends EmployeeProfileRow {
  onboarding_stage?: string | null;
  onboarding_status?: string | null;
  job_description_url?: string | null;
  it_provisioning?: ItProvisioningRow | null;
}

export interface AdminUserEditState {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  profile_picture: File | null;
}

export interface JobDescriptionRow {
  id: number;
  onboarding_request_id: number;
  workflow_run: number;
  content: string;
  download_url?: string;
  employee_name?: string | null;
  created_at?: string;
}

export interface HrCreateProfileState {
  first_name: string;
  last_name: string;
  role: string;
  start_date: string;
  hardware_tier: string;
}

export interface HrStartOnboardingState {
  manager_email: string;
  it_email: string;
  finance_email: string;
}

export interface ManagerReviewFormState {
  requirements: string;
  comments: string;
}

export interface FinanceDecisionFormState {
  comments: string;
}

export interface ItProvisioningFormState {
  company_email: string;
  laptop_model: string;
  configuration_notes: string;
  comments: string;
}

export type DashboardWidgetState = Record<string, WidgetState>;

export type FetchWidget = (widget: RoleWidget) => Promise<void>;
