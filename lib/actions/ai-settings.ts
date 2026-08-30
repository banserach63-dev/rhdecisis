"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { PROVIDER_ENV_VAR } from "@/lib/ai/providers";
import type { AiProvider, AiSettings } from "@/lib/database.types";

export type AiSettingsActionState = { error?: string; success?: boolean } | undefined;

/** Admin-only: used to render the settings form (never exposes the raw key to the client). */
export async function getAiSettingsForAdmin(): Promise<{
  settings: AiSettings;
  envKeyConfigured: boolean;
}> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("ai_settings").select("*").eq("id", 1).maybeSingle();

  const settings: AiSettings = (data as AiSettings) ?? {
    id: 1,
    provider: "anthropic",
    model: null,
    api_key: null,
    updated_by: null,
    updated_at: new Date().toISOString(),
  };

  return {
    settings,
    envKeyConfigured: Boolean(process.env[PROVIDER_ENV_VAR[settings.provider]]),
  };
}

/**
 * Server-only, used from the Assistant IA send action regardless of the
 * caller's role — bypasses RLS since ai_settings is admin-readable only.
 */
export async function resolveAiCredentials(): Promise<{
  provider: AiProvider;
  model: string | null;
  apiKey: string | null;
}> {
  const admin = createAdminClient();
  const { data } = await admin.from("ai_settings").select("*").eq("id", 1).maybeSingle();
  const settings = data as AiSettings | null;
  const provider: AiProvider = settings?.provider ?? "anthropic";
  const apiKey = settings?.api_key || process.env[PROVIDER_ENV_VAR[provider]] || null;
  return { provider, model: settings?.model ?? null, apiKey };
}

export async function updateAiSettings(_prev: AiSettingsActionState, formData: FormData): Promise<AiSettingsActionState> {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const provider = String(formData.get("provider") || "anthropic") as AiProvider;
  const model = String(formData.get("model") || "").trim() || null;
  const apiKeyInput = String(formData.get("api_key") || "").trim();

  if (!["anthropic", "openai", "deepseek"].includes(provider)) {
    return { error: "Fournisseur invalide." };
  }

  const payload: Record<string, unknown> = {
    provider,
    model,
    updated_by: profile.id,
    updated_at: new Date().toISOString(),
  };

  // An empty field keeps the previously stored key (avoids erasing it when
  // the admin only wants to change the provider or model).
  if (apiKeyInput) {
    payload.api_key = apiKeyInput;
  } else if (formData.get("clear_api_key") === "on") {
    payload.api_key = null;
  }

  const { error } = await supabase.from("ai_settings").upsert({ id: 1, ...payload });
  if (error) return { error: error.message };

  revalidatePath("/admin/assistant-ia");
  return { success: true };
}
