"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type AgentActionState = { error?: string } | undefined;

function readAgentPayload(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : String(v);
  };
  return {
    matricule: get("matricule"),
    nom: get("nom"),
    prenom: get("prenom"),
    sexe: get("sexe"),
    date_naissance: get("date_naissance"),
    date_recrutement: get("date_recrutement"),
    date_prise_fonction: get("date_prise_fonction"),
    statut_id: get("statut_id"),
    categorie_id: get("categorie_id"),
    grade_id: get("grade_id"),
    fonction_id: get("fonction_id"),
    direction_id: get("direction_id"),
    service_id: get("service_id"),
    lieu_affectation: get("lieu_affectation"),
    situation_administrative: get("situation_administrative"),
    email: get("email"),
    telephone: get("telephone"),
  };
}

export async function createAgent(_prev: AgentActionState, formData: FormData): Promise<AgentActionState> {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  const payload = readAgentPayload(formData);

  if (!payload.matricule || !payload.nom || !payload.prenom || !payload.sexe || !payload.date_naissance || !payload.date_recrutement) {
    return { error: "Les champs obligatoires (matricule, nom, prénom, sexe, dates) doivent être renseignés." };
  }

  const { data, error } = await supabase.from("agents").insert(payload).select("id").single();
  if (error) return { error: error.message };

  await supabase.from("carriere_evenements").insert({
    agent_id: data.id,
    type_evenement: "recrutement",
    date_evenement: payload.date_recrutement,
    description: `Recrutement de ${payload.prenom} ${payload.nom}`,
    grade_id: payload.grade_id,
    service_id: payload.service_id,
    direction_id: payload.direction_id,
  });

  revalidatePath("/agents");
  redirect(`/agents/${data.id}`);
}

export async function updateAgent(id: string, _prev: AgentActionState, formData: FormData): Promise<AgentActionState> {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  const payload = readAgentPayload(formData);

  const { error } = await supabase.from("agents").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/agents/${id}`);
  revalidatePath("/agents");
  redirect(`/agents/${id}`);
}

export async function addHistoriqueEntry(agentId: string, formData: FormData) {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  const champ = String(formData.get("champ") || "");
  const ancienne = String(formData.get("ancienne_valeur") || "");
  const nouvelle = String(formData.get("nouvelle_valeur") || "");
  const motif = String(formData.get("motif") || "");

  await supabase.from("agent_historique").insert({
    agent_id: agentId,
    champ,
    ancienne_valeur: ancienne || null,
    nouvelle_valeur: nouvelle || null,
    motif: motif || null,
  });

  revalidatePath(`/agents/${agentId}`);
}

export async function recordDepart(agentId: string, formData: FormData) {
  await requireRole("admin", "drh");
  const supabase = await createClient();
  const dateSortie = String(formData.get("date_sortie") || "");
  const motif = String(formData.get("motif_sortie") || "");
  const typeMouvementId = String(formData.get("type_mouvement_id") || "");

  const { data: agent } = await supabase
    .from("agents")
    .select("direction_id, service_id")
    .eq("id", agentId)
    .single();

  await supabase.from("agents").update({ actif: false, date_sortie: dateSortie, motif_sortie: motif }).eq("id", agentId);

  if (typeMouvementId) {
    await supabase.from("mouvements").insert({
      agent_id: agentId,
      type_mouvement_id: typeMouvementId,
      date_effet: dateSortie,
      direction_origine_id: agent?.direction_id ?? null,
      service_origine_id: agent?.service_id ?? null,
      motif,
    });
  }

  await supabase.from("carriere_evenements").insert({
    agent_id: agentId,
    type_evenement: "depart",
    date_evenement: dateSortie,
    description: motif || "Départ de l'agent",
  });

  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/agents");
}
