"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { buildRhContext } from "@/lib/ai/rh-context";
import { callLlm, PROVIDER_LABELS } from "@/lib/ai/providers";
import { resolveAiCredentials } from "@/lib/actions/ai-settings";

export type AssistantState =
  | { error?: string; reply?: string; conversationId?: string }
  | undefined;

const SYSTEM_PROMPT = `Tu es l'Assistant Analytique RH du système SARH-AD (Système Analytique RH d'Aide à la Décision).
Tu réponds en français, de façon claire et professionnelle, à des questions de Direction des Ressources Humaines.

Règles strictes :
- Tu dois répondre UNIQUEMENT à partir des données JSON fournies dans le contexte ci-dessous. Ces données sont déjà filtrées selon les droits d'accès de l'utilisateur.
- Tu ne dois JAMAIS inventer un chiffre, un nom d'agent ou une information qui n'est pas présente dans le contexte.
- Si une information demandée n'est pas disponible dans le contexte fourni, dis-le explicitement et propose à l'utilisateur de consulter la page correspondante (Effectifs, Absences, KPI, etc.) plutôt que d'inventer une réponse.
- Termine toujours ta réponse par une courte ligne "Données utilisées : " listant les champs du contexte que tu as utilisés.
- Sois synthétique : privilégie les chiffres clés, les pourcentages et de courtes explications.`;

type RhCtx = Awaited<ReturnType<typeof buildRhContext>>;

function fmtPct(v: unknown) {
  return typeof v === "number" ? `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %` : "non disponible";
}
function fmtNum(v: unknown) {
  return typeof v === "number" ? v.toLocaleString("fr-FR") : "non disponible";
}
function topEntries(obj: Record<string, number>, n = 3) {
  return Object.entries(obj)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/**
 * Réponse analytique déterministe calculée à partir du contexte RH, sans appel
 * LLM. Utilisée quand aucune clé API n'est configurée ou en cas d'erreur d'API,
 * pour que l'assistant reste utile.
 */
function localAnalyticAnswer(question: string, ctx: RhCtx): string | null {
  const q = question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const has = (...w: string[]) => w.some((x) => q.includes(x));
  const src = (fields: string) => `\n\nDonnées utilisées : ${fields}`;

  if (has("absente", "absenteisme", "absence", "conges")) {
    const top = topEntries(ctx.jours_absence_par_service_annee_courante);
    const lignes = top.length
      ? top.map(([s, j], i) => `${i + 1}. ${s} — ${j.toLocaleString("fr-FR")} jours`).join("\n")
      : "Aucune absence validée enregistrée cette année.";
    return (
      `Taux d'absentéisme (année en cours) : ${fmtPct(ctx.absenteisme_annee_courante_pct)}.\n\n` +
      `Services les plus concernés en jours d'absence validés :\n${lignes}` +
      src("absenteisme_annee_courante_pct, jours_absence_par_service_annee_courante")
    );
  }

  if (has("turnover", "rotation", "depart", "sortie")) {
    return `Turnover de l'année en cours : ${fmtPct(ctx.turnover_annee_courante_pct)}.` + src("turnover_annee_courante_pct");
  }

  if (has("alerte")) {
    const a = ctx.alertes_actives;
    return (
      `Alertes actives : ${a.critiques} critique(s), ${a.importantes} importante(s), ${a.qualite} de qualité, ${a.information} informative(s).` +
      src("alertes_actives")
    );
  }

  if (has("masse salariale", "salaire", "remuneration", "cout")) {
    return (
      `Masse salariale cumulée (année en cours) : ${fmtNum(ctx.masse_salariale_annee_courante)}.` +
      src("masse_salariale_annee_courante")
    );
  }

  if (has("formation")) {
    const f = ctx.formations_annee_courante;
    return (
      `Formations de l'année en cours : ${fmtNum(f.total)} sessions, pour un coût total de ${fmtNum(f.cout_total)}.` +
      src("formations_annee_courante")
    );
  }

  if (has("effectif", "combien d'agent", "nombre d'agent", "personnel", "direction", "service", "repartition", "situation")) {
    const top = topEntries(ctx.effectif_par_direction);
    const lignes = top.map(([d, n]) => `• ${d} : ${n}`).join("\n");
    return (
      `Effectif total : ${fmtNum(ctx.effectif_total)} agents (${ctx.repartition_sexe.femmes} femmes, ${ctx.repartition_sexe.hommes} hommes).\n\n` +
      `Principales directions :\n${lignes}\n\n` +
      `Turnover : ${fmtPct(ctx.turnover_annee_courante_pct)} · Absentéisme : ${fmtPct(ctx.absenteisme_annee_courante_pct)}.` +
      src("effectif_total, repartition_sexe, effectif_par_direction, turnover_annee_courante_pct, absenteisme_annee_courante_pct")
    );
  }

  return null;
}

export async function sendMessage(
  conversationId: string | null,
  _prev: AssistantState,
  formData: FormData
): Promise<AssistantState> {
  const profile = await requireRole("admin", "drh", "direction_generale", "responsable_rh");
  const question = String(formData.get("question") || "").trim();
  if (!question) return { error: "Veuillez saisir une question." };

  const supabase = await createClient();

  let convId = conversationId;
  if (!convId) {
    const { data: conv, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: profile.id, titre: question.slice(0, 60) })
      .select("id")
      .single();
    if (error || !conv) return { error: "Impossible de créer la conversation." };
    convId = conv.id;
  }

  await supabase.from("ai_messages").insert({ conversation_id: convId, role: "user", contenu: question });

  const context = await buildRhContext(supabase);
  const { provider, model, apiKey } = await resolveAiCredentials();

  if (!apiKey) {
    const local = localAnalyticAnswer(question, context);
    const fallback = local
      ? `${local}\n\n_(Réponse calculée localement. Pour des analyses en langage naturel plus poussées, un administrateur peut configurer une clé API dans Administration → Assistant IA.)_`
      : `Je ne peux pas encore répondre librement à cette question : aucune clé API n'est configurée pour ${PROVIDER_LABELS[provider]}. Un administrateur peut la renseigner dans Administration → Assistant IA. Vous pouvez néanmoins m'interroger sur les effectifs, l'absentéisme, le turnover, les formations, la masse salariale ou les alertes.`;
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      contenu: fallback,
      donnees_utilisees: context,
    });
    return { reply: fallback, conversationId: convId ?? undefined };
  }

  try {
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, contenu")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = (history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.contenu,
    }));

    const text = await callLlm({
      provider,
      apiKey,
      model,
      system: `${SYSTEM_PROMPT}\n\nContexte RH (JSON, données autorisées pour cet utilisateur) :\n${JSON.stringify(context)}`,
      messages,
    });

    const reply = text || "Je n'ai pas pu générer de réponse.";

    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      contenu: reply,
      donnees_utilisees: context,
    });

    return { reply, conversationId: convId ?? undefined };
  } catch (e) {
    const local = localAnalyticAnswer(question, context);
    const reply = local
      ? `${local}\n\n_(L'API IA (${PROVIDER_LABELS[provider]}) est indisponible : ${
          e instanceof Error ? e.message : "erreur inconnue"
        } — réponse calculée localement.)_`
      : `Une erreur est survenue lors de l'appel à l'API IA (${PROVIDER_LABELS[provider]}) : ${
          e instanceof Error ? e.message : "erreur inconnue"
        }.`;
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      contenu: reply,
    });
    return { reply, conversationId: convId ?? undefined };
  }
}

export async function createConversation() {
  const profile = await requireRole("admin", "drh", "direction_generale", "responsable_rh");
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_conversations")
    .insert({ user_id: profile.id, titre: "Nouvelle conversation" })
    .select("id")
    .single();
  return data?.id ?? null;
}
