import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ChatBox } from "@/components/assistant/chat-box";
import type { AiMessage } from "@/lib/database.types";

export default async function AssistantIaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireRole("admin", "drh", "direction_generale", "responsable_rh");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id, titre, updated_at")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false })
    .limit(30);

  const activeId = sp.c ?? conversations?.[0]?.id ?? null;

  const { data: messages } = activeId
    ? await supabase.from("ai_messages").select("*").eq("conversation_id", activeId).order("created_at", { ascending: true })
    : { data: [] as AiMessage[] };

  return (
    <div>
      <PageHeader
        title="Assistant Analytique RH"
        description="Posez vos questions en langage naturel. L'assistant répond uniquement à partir des données RH disponibles et autorisées."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link
            href="/assistant-ia"
            className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-primary hover:bg-primary-soft"
          >
            <Plus className="h-4 w-4" /> Nouvelle conversation
          </Link>
          <div className="space-y-1">
            {(conversations ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/assistant-ia?c=${c.id}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  c.id === activeId ? "bg-primary-soft text-primary" : "text-foreground hover:bg-surface-muted"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{c.titre}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <ChatBox conversationId={activeId} messages={(messages as AiMessage[]) ?? []} />
        </div>
      </div>
    </div>
  );
}
