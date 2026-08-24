"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { buildRhContext } from "@/lib/ai/rh-context";

export type AssistantState = { error?: string } | undefined;

const SYSTEM_PROMPT = `Tu es l'Assistant Analytique RH du système SARH-AD (Système Analytique RH d'Aide à la Décision).
Tu réponds en français, de façon claire et professionnelle, à des questions de Direction des Ressources Humaines.

Règles strictes :
- Tu dois répondre UNIQUEMENT à partir des données JSON fournies dans le contexte ci-dessous. Ces données sont déjà filtrées selon les droits d'accès de l'utilisateur.
- Tu ne dois JAMAIS inventer un chiffre, un nom d'agent ou une information qui n'est pas présente dans le contexte.
- Si une information demandée n'est pas disponible dans le contexte fourni, dis-le explicitement et propose à l'utilisateur de consulter la page correspondante (Effectifs, Absences, KPI, etc.) plutôt que d'inventer une réponse.
- Termine toujours ta réponse par une courte ligne "Données utilisées : " listant les champs du contexte que tu as utilisés.
- Sois synthétique : privilégie les chiffres clés, les pourcentages et de courtes explications.`;

export async function sendMessage(conversationId: string | null, _prev: AssistantState, formData: FormData): Promise<AssistantState> {
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

  if (!process.env.ANTHROPIC_API_KEY) {
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      contenu:
        "L'assistant IA n'est pas encore configuré (clé ANTHROPIC_API_KEY manquante côté serveur). Voici néanmoins les données disponibles :\n\n```json\n" +
        JSON.stringify(context, null, 2) +
        "\n```",
      donnees_utilisees: context,
    });
    revalidatePath("/assistant-ia");
    return { error: undefined };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      system: `${SYSTEM_PROMPT}\n\nContexte RH (JSON, données autorisées pour cet utilisateur) :\n${JSON.stringify(context)}`,
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      contenu: text || "Je n'ai pas pu générer de réponse.",
      donnees_utilisees: context,
    });
  } catch (e) {
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      contenu: `Une erreur est survenue lors de l'appel à l'API IA : ${e instanceof Error ? e.message : "erreur inconnue"}.`,
    });
  }

  revalidatePath("/assistant-ia");
  return undefined;
}

export async function createConversation() {
  const profile = await requireRole("admin", "drh", "direction_generale", "responsable_rh");
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_conversations")
    .insert({ user_id: profile.id, titre: "Nouvelle conversation" })
    .select("id")
    .single();
  revalidatePath("/assistant-ia");
  return data?.id ?? null;
}
