"use client";

import { useTransition } from "react";
import { Eye, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { markAlerteStatut, generateAlertes } from "@/lib/actions/alertes";
import { Button } from "@/components/ui/button";

export function AlerteActions({ id, statut }: { id: string; statut: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-1">
      {statut === "nouvelle" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => markAlerteStatut(id, "vue"))}
          className="rounded p-1.5 text-info hover:bg-info-soft"
          aria-label="Marquer comme vue"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      {statut !== "traitee" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => markAlerteStatut(id, "traitee"))}
          className="rounded p-1.5 text-success hover:bg-success-soft"
          aria-label="Marquer comme traitée"
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
      )}
      {statut !== "ignoree" && statut !== "traitee" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => markAlerteStatut(id, "ignoree"))}
          className="rounded p-1.5 text-muted hover:bg-surface-muted"
          aria-label="Ignorer"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function GenerateAlertesButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await generateAlertes();
          router.refresh();
        })
      }
    >
      <RefreshCw className="h-4 w-4" /> {pending ? "Analyse…" : "Générer les alertes"}
    </Button>
  );
}
