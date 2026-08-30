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
    const fallback = `L'assistant IA n'est pas encore configuré : aucune clé API n'est renseignée pour ${PROVIDER_LABELS[provider]}. Un administrateur peut la configurer dans Administration → Assistant IA.`;
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
    const reply = `Une erreur est survenue lors de l'appel à l'API IA (${PROVIDER_LABELS[provider]}) : ${
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
