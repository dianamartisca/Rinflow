"use client";

import { FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";
import type { RoleWidget, WidgetAction } from "@/lib/role-config";

import type { ActionStatus } from "../types";
import { buildApiUrl, getActionKey, resolveEndpoint } from "../utils";

interface UseWidgetActionsOptions {
  token: string;
  fetchWidget: (widget: RoleWidget) => Promise<void>;
}

export function useWidgetActions({ token, fetchWidget }: UseWidgetActionsOptions) {
  const [actionForms, setActionForms] = useState<Record<string, Record<string, string>>>({});
  const [actionStatus, setActionStatus] = useState<Record<string, ActionStatus>>({});

  function updateActionForm(widgetKey: string, actionKey: string, fieldKey: string, value: string) {
    const compositeKey = getActionKey(widgetKey, actionKey);
    setActionForms((current) => ({
      ...current,
      [compositeKey]: {
        ...current[compositeKey],
        [fieldKey]: value,
      },
    }));
  }

  async function submitAction(event: FormEvent<HTMLFormElement>, widget: RoleWidget, action: WidgetAction) {
    event.preventDefault();

    const compositeKey = getActionKey(widget.key, action.key);
    const values = actionForms[compositeKey] ?? {};

    for (const field of action.fields) {
      const value = values[field.key]?.trim() ?? "";
      if (field.required && value.length === 0) {
        setActionStatus((current) => ({
          ...current,
          [compositeKey]: {
            loading: false,
            message: null,
            error: `${field.label} is required`,
          },
        }));
        return;
      }
    }

    const endpoint = resolveEndpoint(action.endpoint, values);
    const pathFields = new Set(action.fields.filter((field) => field.inPath).map((field) => field.key));
    const payload = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => value.trim().length > 0 && !pathFields.has(key)),
    );

    setActionStatus((current) => ({
      ...current,
      [compositeKey]: {
        loading: true,
        message: null,
        error: null,
      },
    }));

    try {
      if (action.bodyType === "form-data") {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        const response = await fetch(buildApiUrl(endpoint), {
          method: action.method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = (await response.json()) as { message?: string };
        if (!response.ok) {
          throw new Error(result.message ?? `Request failed (${response.status})`);
        }
      } else {
        await apiRequest(endpoint, { method: action.method, body: payload }, token);
      }

      setActionStatus((current) => ({
        ...current,
        [compositeKey]: {
          loading: false,
          message: `${action.label} succeeded`,
          error: null,
        },
      }));

      void fetchWidget(widget);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setActionStatus((current) => ({
        ...current,
        [compositeKey]: {
          loading: false,
          message: null,
          error: message,
        },
      }));
    }
  }

  return {
    actionForms,
    actionStatus,
    updateActionForm,
    submitAction,
  };
}
