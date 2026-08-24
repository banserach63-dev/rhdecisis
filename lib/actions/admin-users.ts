"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import type { UserRole } from "@/lib/database.types";

export type AdminUserActionState = { error?: string } | undefined;

export async function createUser(_prev: AdminUserActionState, formData: FormData): Promise<AdminUserActionState> {
  await requireRole("admin");
  const admin = createAdminClient();

  const nom = String(formData.get("nom") || "").trim();
  const prenom = String(formData.get("prenom") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "agent") as UserRole;
  const directionId = String(formData.get("direction_id") || "") || null;
  const serviceId = String(formData.get("service_id") || "") || null;
  const agentId = String(formData.get("agent_id") || "") || null;

  if (!nom || !prenom || !email || password.length < 8) {
    return { error: "Tous les champs sont requis (mot de passe : 8 caractères minimum)." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) return { error: createError?.message ?? "Création impossible." };

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    nom,
    prenom,
    email,
    role,
    direction_id: directionId,
    service_id: serviceId,
    agent_id: agentId,
    actif: true,
  });

  if (profileError) return { error: profileError.message };

  revalidatePath("/admin/utilisateurs");
  return { error: undefined };
}

export async function updateUser(id: string, _prev: AdminUserActionState, formData: FormData): Promise<AdminUserActionState> {
  await requireRole("admin");
  const admin = createAdminClient();

  const role = String(formData.get("role") || "agent") as UserRole;
  const directionId = String(formData.get("direction_id") || "") || null;
  const serviceId = String(formData.get("service_id") || "") || null;
  const actif = formData.get("actif") === "on";

  const { error } = await admin.from("profiles").update({ role, direction_id: directionId, service_id: serviceId, actif }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/utilisateurs");
  return { error: undefined };
}

export async function resetPassword(id: string, formData: FormData) {
  await requireRole("admin");
  const admin = createAdminClient();
  const password = String(formData.get("password") || "");
  if (password.length < 8) return;
  await admin.auth.admin.updateUserById(id, { password });
}
