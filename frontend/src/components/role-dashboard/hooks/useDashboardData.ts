"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth-storage";
import { ROLE_WIDGET_ACTIONS, ROLE_WIDGETS, type RoleWidget, type WidgetAction } from "@/lib/role-config";
import type { AuthUser } from "@/types/auth";

import type { WidgetState } from "../types";
import { toItemCount, toWidgetPreview } from "../utils";

export function useDashboardData() {
  const router = useRouter();
  const [widgetsState, setWidgetsState] = useState<Record<string, WidgetState>>({});

  const auth = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return getStoredAuth();
  }, []);

  const user: AuthUser | null = auth?.user ?? null;
  const token = auth?.token ?? "";

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
    }
  }, [auth, router]);

  const widgets: RoleWidget[] = useMemo(() => {
    if (!user) {
      return [];
    }

    return ROLE_WIDGETS[user.role] ?? [];
  }, [user]);

  const widgetActions = useMemo(() => {
    if (!user) {
      return {} as Partial<Record<string, WidgetAction[]>>;
    }

    return ROLE_WIDGET_ACTIONS[user.role] ?? {};
  }, [user]);

  const fetchWidget = useCallback(
    async (widget: RoleWidget) => {
      try {
        const payload = await apiRequest<unknown>(widget.endpoint, { method: "GET" }, token);

        setWidgetsState((current) => ({
          ...current,
          [widget.key]: {
            loading: false,
            error: null,
            itemCount: toItemCount(payload),
            preview: toWidgetPreview(widget.key, payload),
          },
        }));
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Request failed";
        setWidgetsState((current) => ({
          ...current,
          [widget.key]: {
            loading: false,
            error: message,
            itemCount: null,
            preview: [],
          },
        }));
      }
    },
    [token],
  );

  useEffect(() => {
    if (!user || !token || widgets.length === 0) {
      return;
    }

    widgets.forEach((widget) => {
      void fetchWidget(widget);
    });
  }, [fetchWidget, token, user, widgets]);

  function handleLogout() {
    clearStoredAuth();
    router.replace("/login");
  }

  return {
    user,
    token,
    widgets,
    widgetActions,
    widgetsState,
    fetchWidget,
    handleLogout,
  };
}
