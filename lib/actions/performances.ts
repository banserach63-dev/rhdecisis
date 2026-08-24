"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type PerfActionState = { error?: string } | undefined;

export async function createCampagne(_prev: PerfActionState, formData: FormData): Promise<PerfActionState> {
  await requireRole("admin", "drh");
  const supabase = await createClient();
  const nom = String(formData.get("nom") || "");
  const periodeDebut = String(formData.get("periode_debut") || "");
  const periodeFin = String(formData.get("periode_fin") || "");
  if (!nom || !periodeDebut || !periodeFin) return { error: "Tous les champs sont requis." };

  const { error } = await supabase.from("campagnes_evaluation").insert({ nom, periode_debut: periodeDebut, periode_fin: periodeFin });
  if (error) return { error: error.message };

  revalidatePath("/performances");
}

export async function createEvaluation(_prev: PerfActionState, formData: FormData): Promise<PerfActionState> {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service");
  const supabase = await createClient();

  const agentId = String(formData.get("agent_id") || "");
  const campagneId = String(formData.get("campagne_id") || "") || null;
  const noteGlobale = formData.get("note_globale") ? Number(formData.get("note_globale")) : null;
  const tauxAtteinte = formData.get("taux_atteinte") ? Number(formData.get("taux_atteinte")) : null;
  const synthese = String(formData.get("synthese") || "") || null;

  if (!agentId) return { error: "L'agent est obligatoire." };

  const { error } = await supabase.from("evaluations").insert({
    agent_id: agentId,
    campagne_id: campagneId,
    evaluateur_id: profile.id,
    note_globale: noteGlobale,
    taux_atteinte: tauxAtteinte,
    synthese,
    statut: "validee",
  });

  if (error) return { error: error.message };

  revalidatePath("/performances");
  revalidatePath(`/agents/${agentId}`);
}
