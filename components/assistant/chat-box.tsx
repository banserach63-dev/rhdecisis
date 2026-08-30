"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles, Send } from "lucide-react";
import { sendMessage } from "@/lib/actions/assistant";
import type { AiMessage } from "@/lib/database.types";

type LocalMessage = Pick<AiMessage, "id" | "role" | "contenu">;

export function ChatBox({ conversationId, messages }: { conversationId: string | null; messages: AiMessage[] }) {
  const [convId, setConvId] = useState(conversationId);
  const [items, setItems] = useState<LocalMessage[]>(messages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  function submit(formData: FormData) {
    const question = String(formData.get("question") || "").trim();
    if (!question || pending) return;

    setItems((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", contenu: question }]);
    setError(null);
    formRef.current?.reset();

    startTransition(async () => {
      const res = await sendMessage(convId, undefined, formData);
      if (res?.conversationId) setConvId(res.conversationId);
      if (res?.error) {
        setError(res.error);
      } else if (res?.reply) {
        setItems((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", contenu: res.reply! }]);
      }
    });
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted">
            <Sparkles className="mb-3 h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">Posez une question sur vos données RH</p>
            <p className="mt-1 max-w-sm text-xs">
              Ex. « Quels services ont le taux d&rsquo;absentéisme le plus élevé cette année ? » ou « Résume-moi la
              situation des effectifs. »
            </p>
          </div>
        )}
        {items.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground"
              }`}
            >
              {m.contenu}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-surface-muted px-4 py-2.5 text-sm text-muted">L&rsquo;assistant analyse les données…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {error && <p className="px-5 pb-2 text-xs text-danger">{error}</p>}
      <form ref={formRef} action={submit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          name="question"
          required
          placeholder="Posez votre question…"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
