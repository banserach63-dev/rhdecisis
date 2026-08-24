"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireRole } from "@/lib/auth";

export type AbsenceActionState = { error?: string; success?: boolean } | undefined;

function joursOuvres(debut: string, fin: string): number {
  const start = new Date(debut);
  const end = new Date(fin);
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count || 1;
}

export async function createAbsence(_prev: AbsenceActionState, formData: FormData): Promise<AbsenceActionState> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const agentId = String(formData.get("agent_id") || (profile.agent_id ?? ""));
  const typeAbsenceId = String(formData.get("type_absence_id") || "");
  const dateDebut = String(formData.get("date_debut") || "");
  const dateFin = String(formData.get("date_fin") || "");
  const motif = String(formData.get("motif") || "") || null;

  if (!agentId || !typeAbsenceId || !dateDebut || !dateFin) {
    return { error: "Agent, type, date de début et date de fin sont obligatoires." };
  }
  if (dateFin < dateDebut) {
    return { error: "La date de fin doit être postérieure à la date de début." };
  }

  const nbJours = joursOuvres(dateDebut, dateFin);
  const isManager = ["admin", "drh", "responsable_rh", "chef_service"].includes(profile.role);

  const { error } = await supabase.from("absences").insert({
    agent_id: agentId,
    type_absence_id: typeAbsenceId,
    date_debut: dateDebut,
    date_fin: dateFin,
    nb_jours: nbJours,
    motif,
    statut: isManager ? "validee" : "demandee",
    validee_par: isManager ? profile.id : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/absences");
  revalidatePath(`/agents/${agentId}`);
  return { success: true };
}

export async function updateAbsenceStatut(id: string, statut: "validee" | "refusee") {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service");
  const supabase = await createClient();
  await supabase.from("absences").update({ statut, validee_par: profile.id }).eq("id", id);
  revalidatePath("/absences");
}
