import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Builds a compact, aggregated snapshot of the RH data the current user is
 * authorized to see (RLS applies because this runs with the caller's
 * session client). The Assistant IA must answer using only this snapshot.
 */
export async function buildRhContext(supabase: SupabaseClient) {
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [agentsRes, directionsRes, absencesRes, alertesRes, formationsRes, turnoverRes, absenteismeRes, masseRes, qualiteRes] =
    await Promise.all([
      supabase.from("agents").select("sexe, date_naissance, date_recrutement, direction_id, service_id, directions(nom), services(nom), grades(nom), actif").eq("actif", true),
      supabase.from("directions").select("id, nom").eq("actif", true),
      supabase
        .from("absences")
        .select("nb_jours, statut, agents(services(nom))")
        .gte("date_debut", yearStart)
        .eq("statut", "validee"),
      supabase.from("alertes").select("niveau, statut").neq("statut", "traitee"),
      supabase.from("formations").select("statut, cout").gte("date_debut", yearStart),
      supabase.rpc("kpi_turnover", { p_date_debut: yearStart, p_date_fin: todayStr }),
      supabase.rpc("kpi_absenteisme", { p_date_debut: yearStart, p_date_fin: todayStr }),
      supabase.rpc("kpi_masse_salariale", { p_periode_debut: yearStart, p_periode_fin: todayStr }),
      supabase.from("quality_scans").select("score_global, date_scan").order("date_scan", { ascending: false }).limit(1).maybeSingle(),
    ]);

  const agents = agentsRes.data ?? [];
  const parDirection = new Map<string, number>();
  agents.forEach((a) => {
    const nom = (a as unknown as { directions?: { nom: string } | null }).directions?.nom ?? "Non affecté";
    parDirection.set(nom, (parDirection.get(nom) ?? 0) + 1);
  });

  const parService = new Map<string, number>();
  agents.forEach((a) => {
    const nom = (a as unknown as { services?: { nom: string } | null }).services?.nom ?? "Non affecté";
    parService.set(nom, (parService.get(nom) ?? 0) + 1);
  });

  const absencesParService = new Map<string, number>();
  (absencesRes.data ?? []).forEach((a) => {
    const nom = (a.agents as { services?: { nom: string } | null } | null)?.services?.nom ?? "Non affecté";
    absencesParService.set(nom, (absencesParService.get(nom) ?? 0) + Number(a.nb_jours));
  });

  return {
    date_snapshot: todayStr,
    effectif_total: agents.length,
    repartition_sexe: {
      hommes: agents.filter((a) => a.sexe === "M").length,
      femmes: agents.filter((a) => a.sexe === "F").length,
    },
    effectif_par_direction: Object.fromEntries(parDirection),
    effectif_par_service: Object.fromEntries(parService),
    jours_absence_par_service_annee_courante: Object.fromEntries(absencesParService),
    turnover_annee_courante_pct: turnoverRes.data,
    absenteisme_annee_courante_pct: absenteismeRes.data,
    masse_salariale_annee_courante: masseRes.data,
    formations_annee_courante: {
      total: formationsRes.data?.length ?? 0,
      cout_total: formationsRes.data?.reduce((s, f) => s + Number(f.cout ?? 0), 0) ?? 0,
    },
    alertes_actives: {
      critiques: (alertesRes.data ?? []).filter((a) => a.niveau === "critique").length,
      importantes: (alertesRes.data ?? []).filter((a) => a.niveau === "importante").length,
      qualite: (alertesRes.data ?? []).filter((a) => a.niveau === "qualite").length,
      information: (alertesRes.data ?? []).filter((a) => a.niveau === "information").length,
    },
    score_qualite_donnees: qualiteRes.data?.score_global ?? null,
    directions: (directionsRes.data ?? []).map((d) => d.nom),
  };
}

export type RhContext = Awaited<ReturnType<typeof buildRhContext>>;
