"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type RapportActionState = { error?: string } | undefined;

export async function generateRapport(_prev: RapportActionState, formData: FormData): Promise<RapportActionState> {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service");
  const supabase = await createClient();

  const type = String(formData.get("type") || "");
  const titre = String(formData.get("titre") || "");
  const dateDebut = String(formData.get("date_debut") || "");
  const dateFin = String(formData.get("date_fin") || "");

  if (!type || !titre || !dateDebut || !dateFin) return { error: "Tous les champs sont requis." };

  let contenu: Record<string, unknown> = {};

  if (type === "effectifs") {
    const { data: agents } = await supabase
      .from("agents")
      .select("sexe, direction_id, service_id, directions(nom), services(nom), grades(nom), categories(nom)")
      .eq("actif", true);
    const total = agents?.length ?? 0;
    const hommes = agents?.filter((a) => a.sexe === "M").length ?? 0;
    const femmes = total - hommes;
    const parDirection = new Map<string, number>();
    agents?.forEach((a) => {
      const nom = (a as unknown as { directions?: { nom: string } | null }).directions?.nom ?? "Non affecté";
      parDirection.set(nom, (parDirection.get(nom) ?? 0) + 1);
    });
    contenu = {
      total, hommes, femmes,
      parDirection: Array.from(parDirection.entries()).map(([name, value]) => ({ name, value })),
    };
  } else if (type === "mouvements") {
    const { data: mouvementsRaw } = await supabase
      .from("mouvements")
      .select("date_effet, motif, agents(nom, prenom), types_mouvement(nom, sens)")
      .gte("date_effet", dateDebut)
      .lte("date_effet", dateFin);
    const mouvements = mouvementsRaw as unknown as {
      date_effet: string;
      motif: string | null;
      agents: { nom: string; prenom: string } | null;
      types_mouvement: { nom: string; sens: string } | null;
    }[] | null;
    contenu = {
      total: mouvements?.length ?? 0,
      entrees: mouvements?.filter((m) => m.types_mouvement?.sens === "entree").length ?? 0,
      sorties: mouvements?.filter((m) => m.types_mouvement?.sens === "sortie").length ?? 0,
      liste: mouvements?.map((m) => ({
        date: m.date_effet,
        agent: m.agents ? `${m.agents.prenom} ${m.agents.nom}` : "—",
        type: m.types_mouvement?.nom,
        motif: m.motif,
      })),
    };
  } else if (type === "absences") {
    const { data: absencesRaw } = await supabase
      .from("absences")
      .select("nb_jours, statut, types_absence(nom), agents(nom, prenom, services(nom))")
      .gte("date_debut", dateDebut)
      .lte("date_fin", dateFin);
    const absences = absencesRaw as unknown as {
      nb_jours: number;
      statut: string;
      types_absence: { nom: string } | null;
      agents: { nom: string; prenom: string; services: { nom: string } | null } | null;
    }[] | null;
    const { data: absenteisme } = await supabase.rpc("kpi_absenteisme", { p_date_debut: dateDebut, p_date_fin: dateFin });
    contenu = {
      total: absences?.length ?? 0,
      jours: absences?.reduce((s, a) => s + Number(a.nb_jours), 0) ?? 0,
      tauxAbsenteisme: absenteisme,
      liste: absences?.map((a) => ({
        agent: a.agents ? `${a.agents.prenom} ${a.agents.nom}` : "—",
        service: a.agents?.services?.nom,
        type: a.types_absence?.nom,
        jours: a.nb_jours,
        statut: a.statut,
      })),
    };
  } else if (type === "formations") {
    const { data: formations } = await supabase
      .from("formations")
      .select("titre, cout, duree_heures, statut, formation_participants(id)")
      .gte("date_debut", dateDebut)
      .lte("date_debut", dateFin);
    contenu = {
      total: formations?.length ?? 0,
      coutTotal: formations?.reduce((s, f) => s + Number(f.cout ?? 0), 0) ?? 0,
      participants: formations?.reduce((s, f) => s + (f.formation_participants?.length ?? 0), 0) ?? 0,
      liste: formations?.map((f) => ({ titre: f.titre, cout: f.cout, duree: f.duree_heures, statut: f.statut, participants: f.formation_participants?.length ?? 0 })),
    };
  } else if (type === "kpi") {
    const [effectif, turnover, absenteisme, masse, tcf] = await Promise.all([
      supabase.rpc("kpi_effectif", { p_date: dateFin }),
      supabase.rpc("kpi_turnover", { p_date_debut: dateDebut, p_date_fin: dateFin }),
      supabase.rpc("kpi_absenteisme", { p_date_debut: dateDebut, p_date_fin: dateFin }),
      supabase.rpc("kpi_masse_salariale", { p_periode_debut: dateDebut, p_periode_fin: dateFin }),
      supabase.rpc("kpi_taux_couverture_formation", { p_date_debut: dateDebut, p_date_fin: dateFin }),
    ]);
    contenu = {
      effectif: effectif.data, turnover: turnover.data, absenteisme: absenteisme.data,
      masseSalariale: masse.data, tauxCouvertureFormation: tcf.data,
    };
  }

  const { data, error } = await supabase
    .from("rapports")
    .insert({ titre, type, format: "html", genere_par: profile.id, parametres: { date_debut: dateDebut, date_fin: dateFin }, contenu })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/rapports");
  redirect(`/rapports/${data.id}`);
}
