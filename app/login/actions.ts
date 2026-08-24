"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionState = { error?: string } | undefined;

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Veuillez renseigner votre e-mail et votre mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Identifiants invalides. Veuillez réessayer." };
  }

  redirect("/dashboard");
}

export async function bootstrapAdmin(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const nom = String(formData.get("nom") || "").trim();
  const prenom = String(formData.get("prenom") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!nom || !prenom || !email || password.length < 8) {
    return { error: "Tous les champs sont requis (mot de passe : 8 caractères minimum)." };
  }

  const admin = createAdminClient();

  // Safety net: refuse if an administrator already exists (e.g. race condition).
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true });
  if (count && count > 0) {
    return { error: "Un compte existe déjà. Contactez votre administrateur pour obtenir un accès." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Impossible de créer le compte administrateur." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    nom,
    prenom,
    email,
    role: "admin",
    actif: true,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });

  redirect("/dashboard");
}
