"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, X, Send, Maximize2, Loader2 } from "lucide-react";
import { sendMessage } from "@/lib/actions/assistant";

type LocalMessage = { id: string; role: "user" | "assistant"; contenu: string };

const SUGGESTIONS = [
  "Résume-moi la situation des effectifs",
  "Quels services ont le plus fort taux d'absentéisme ?",
  "Combien d'alertes critiques sont actives ?",
  "Quel est le turnover de l'année ?",
];

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [items, setItems] = useState<LocalMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length, pending, open]);

  function ask(question: string) {
    if (!question.trim() || pending) return;
    setItems((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", contenu: question }]);
    setError(null);
    formRef.current?.reset();

    startTransition(async () => {
      const fd = new FormData();
      fd.set("question", question);
      const res = await sendMessage(convId, undefined, fd);
      if (res?.conversationId) setConvId(res.conversationId);
      if (res?.error) setError(res.error);
      else if (res?.reply) setItems((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", contenu: res.reply! }]);
    });
  }

  return (
    <>
      {/* Chat panel */}
      <div
        className={`fixed right-5 bottom-24 z-50 flex h-[32rem] w-[23rem] max-w-[calc(100vw-2.5rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-ink/20 transition-all duration-200 ease-out sm:right-6 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
          <div className="relative flex items-center justify-between gap-2 overflow-hidden bg-gradient-to-br from-indigo-600 via-primary to-primary-hover px-4 py-3.5 text-white">
            <div className="absolute -right-6 -top-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">Assistant RH</div>
                <div className="flex items-center gap-1 text-[11px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> En ligne
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-1">
              <Link
                href="/assistant-ia"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Ouvrir en plein écran"
                title="Ouvrir en plein écran"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {items.length === 0 && (
              <div className="flex flex-col items-center gap-3 pt-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="text-xs text-muted">
                  Posez une question sur vos données RH ou choisissez une suggestion :
                </p>
                <div className="flex flex-col gap-1.5 self-stretch">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {items.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground"
                  }`}
                >
                  {m.contenu}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-surface-muted px-3.5 py-2 text-xs text-muted">
                  <Loader2 className="h-3 w-3 animate-spin" /> Analyse des données…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p className="px-4 pb-1 text-xs text-danger">{error}</p>}

          <form
            ref={formRef}
            action={(fd) => ask(String(fd.get("question") || ""))}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              name="question"
              required
              placeholder="Écrivez votre question…"
              autoComplete="off"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={pending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant IA"}
        className="group fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-primary/40 transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6"
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40 [animation-duration:2.5s]" />}
        <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-indigo-500 via-primary to-primary-hover" />
        {open ? (
          <X className="h-5.5 w-5.5" />
        ) : (
          <Sparkles className="h-5.5 w-5.5 transition-transform duration-300 group-hover:rotate-12" />
        )}
      </button>
    </>
  );
}
