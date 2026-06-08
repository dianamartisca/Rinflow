import type { UserRole } from "@/types/auth";

export interface ActionField {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "date";
  required?: boolean;
  placeholder?: string;
  inPath?: boolean;
  options?: string[];
}

export interface WidgetAction {
  key: string;
  label: string;
  method: "POST" | "PUT";
  endpoint: string;
  bodyType?: "json" | "form-data";
  fields: ActionField[];
}

export interface RoleWidget {
  key: string;
  title: string;
  description: string;
  endpoint: string;
}

const SHARED_WIDGETS: RoleWidget[] = [
  {
    key: "onboarding-requests",
    title: "Onboarding Requests",
    description: "Track requests moving through approval and provisioning.",
    endpoint: "/onboarding-requests",
  },
];

export const ROLE_WIDGETS: Record<UserRole, RoleWidget[]> = {
  HR: [
    {
      key: "employee-profiles",
      title: "Employee Profiles",
      description: "Create and maintain employee details for onboarding.",
      endpoint: "/employee-profiles",
    },
    SHARED_WIDGETS[0],
    {
      key: "approval-history",
      title: "Approval History",
      description: "Review rejected workflow decisions and comments.",
      endpoint: "/approval-history",
    },
  ],
  MANAGER: [
    {
      key: "manager-review-profiles",
      title: "Employee Profiles",
      description: "Review employee details waiting for manager approval.",
      endpoint: "/employee-profiles/manager-review",
    },
    {
      key: "job-descriptions",
      title: "Job Descriptions",
      description: "Own role descriptions and role-level requirements.",
      endpoint: "/job-descriptions",
    },
  ],
  FINANCE: [
    {
      key: "finance-approval-profiles",
      title: "Premium Hardware Approvals",
      description: "Review premium hardware requests approved by managers.",
      endpoint: "/employee-profiles/finance-approval",
    },
    {
      key: "finance-approved-profiles",
      title: "Approved Premium Hardware",
      description: "See premium hardware approvals you completed.",
      endpoint: "/employee-profiles/finance-approved",
    },
  ],
  IT: [
    {
      key: "it-provisioning-profiles",
      title: "IT Provisioning Profiles",
      description: "Provision employees approved by manager and finance workflows.",
      endpoint: "/employee-profiles/it-provisioning",
    },
    {
      key: "it-provisioning",
      title: "IT Provisioning",
      description: "See equipment and account provisioning progress.",
      endpoint: "/it-provisioning",
    },
  ],
  ADMIN: [
    {
      key: "users",
      title: "Users",
      description: "Manage platform users and their roles.",
      endpoint: "/users",
    },
    {
      key: "employee-profiles",
      title: "Employee Profiles",
      description: "Audit profile completeness across teams.",
      endpoint: "/employee-profiles",
    },
    {
      key: "onboarding-requests",
      title: "Onboarding Requests",
      description: "Track requests moving through approval and provisioning.",
      endpoint: "/onboarding-requests",
    },
    {
      key: "approval-history",
      title: "Approval History",
      description: "Review decisions captured by workflow reviewers.",
      endpoint: "/approval-history",
    },
    {
      key: "job-descriptions",
      title: "Job Descriptions",
      description: "Inspect manager-owned role descriptions.",
      endpoint: "/job-descriptions",
    },
    {
      key: "it-provisioning",
      title: "IT Provisioning",
      description: "Track hardware and software handover status.",
      endpoint: "/it-provisioning",
    },
  ],
};

export const ROLE_WIDGET_ACTIONS: Partial<Record<UserRole, Partial<Record<string, WidgetAction[]>>>> = {
  HR: {
    "employee-profiles": [
      {
        key: "create-profile",
        label: "Create",
        method: "POST",
        endpoint: "/employee-profiles",
        fields: [
          { key: "first_name", label: "First Name", required: true, placeholder: "John" },
          { key: "last_name", label: "Last Name", required: true, placeholder: "Doe" },
          { key: "role", label: "Role", required: true, placeholder: "Software Engineer" },
          { key: "start_date", label: "Start Date", type: "date", required: true },
          { key: "hardware_tier", label: "Hardware Tier", required: true, options: ["STANDARD", "PREMIUM"] },
        ],
      },
    ],
    "onboarding-requests": [
      {
        key: "create-request",
        label: "Create",
        method: "POST",
        endpoint: "/onboarding-requests",
        fields: [
          { key: "employee_id", label: "Employee Profile ID", type: "number", required: true, placeholder: "12" },
          { key: "manager_email", label: "Manager Email", type: "email", required: true, placeholder: "manager@rinf.com" },
          { key: "it_email", label: "IT Email", type: "email", required: true, placeholder: "it@rinf.com" },
          { key: "finance_email", label: "Finance Email", type: "email", placeholder: "Required for PREMIUM" },
        ],
      },
    ],
  },
  MANAGER: {
    "job-descriptions": [
      {
        key: "create-job-description",
        label: "Create",
        method: "POST",
        endpoint: "/job-descriptions",
        fields: [
          { key: "onboarding_request_id", label: "Onboarding Request ID", type: "number", required: true, placeholder: "15" },
          { key: "workflow_run", label: "Workflow Run", type: "number", required: true, placeholder: "1" },
          { key: "content", label: "Content", required: true, placeholder: "Role requirements and responsibilities" },
        ],
      },
      {
        key: "update-job-description",
        label: "Update",
        method: "PUT",
        endpoint: "/job-descriptions/:job_description_id",
        fields: [
          { key: "job_description_id", label: "Job Description ID", type: "number", required: true, inPath: true, placeholder: "3" },
          { key: "content", label: "Content", required: true, placeholder: "Updated description" },
        ],
      },
    ],
  },
  IT: {
    "it-provisioning": [
      {
        key: "create-provisioning",
        label: "Create",
        method: "POST",
        endpoint: "/it-provisioning",
        fields: [
          { key: "onboarding_request_id", label: "Onboarding Request ID", type: "number", required: true, placeholder: "15" },
          { key: "workflow_run", label: "Workflow Run", type: "number", required: true, placeholder: "1" },
          { key: "company_email", label: "Company Email", type: "email", required: true, placeholder: "new.hire@company.com" },
          { key: "configuration_notes", label: "Configuration Notes", required: true, placeholder: "VPN, SSO, IDE setup" },
        ],
      },
      {
        key: "update-provisioning",
        label: "Update",
        method: "PUT",
        endpoint: "/it-provisioning/:provisioning_id",
        fields: [
          { key: "provisioning_id", label: "Provisioning ID", type: "number", required: true, inPath: true, placeholder: "8" },
          { key: "company_email", label: "Company Email", type: "email", placeholder: "Optional" },
          { key: "username", label: "Username", placeholder: "Optional" },
          { key: "laptop_model", label: "Laptop Model", placeholder: "Optional" },
          { key: "configuration_notes", label: "Configuration Notes", placeholder: "Optional" },
        ],
      },
    ],
  },
  ADMIN: {
    users: [
      {
        key: "create-user",
        label: "Create",
        method: "POST",
        endpoint: "/users",
        fields: [
          { key: "username", label: "Username", required: true, placeholder: "janedoe" },
          { key: "email", label: "Email", type: "email", required: true, placeholder: "jane@company.com" },
          { key: "password", label: "Password", required: true, placeholder: "Strong password" },
          { key: "role", label: "Role", required: true, placeholder: "HR / MANAGER / FINANCE / IT / ADMIN" },
          { key: "first_name", label: "First Name", placeholder: "Jane" },
          { key: "last_name", label: "Last Name", placeholder: "Doe" },
        ],
      },
      {
        key: "update-user",
        label: "Update",
        method: "PUT",
        endpoint: "/users/:user_id",
        bodyType: "form-data",
        fields: [
          { key: "user_id", label: "User ID", type: "number", required: true, inPath: true, placeholder: "5" },
          { key: "username", label: "Username", placeholder: "Optional" },
          { key: "email", label: "Email", type: "email", placeholder: "Optional" },
          { key: "role", label: "Role", placeholder: "Optional" },
          { key: "first_name", label: "First Name", placeholder: "Optional" },
          { key: "last_name", label: "Last Name", placeholder: "Optional" },
        ],
      },
    ],
  },
};
