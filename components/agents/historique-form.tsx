"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { addHistoriqueEntry } from "@/lib/actions/agents";

export function HistoriqueForm({ agentId }: { agentId: string }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await addHistoriqueEntry(agentId, fd);
          formRef.current?.reset();
        })
      }
      className="grid grid-cols-1 gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-4"
    >
      <Input name="champ" placeholder="Champ concerné" required className="text-xs" />
      <Input name="ancienne_valeur" placeholder="Ancienne valeur" className="text-xs" />
      <Input name="nouvelle_valeur" placeholder="Nouvelle valeur" className="text-xs" />
      <div className="flex gap-2">
        <Input name="motif" placeholder="Motif" className="text-xs" />
        <Button type="submit" size="sm" disabled={pending} aria-label="Ajouter">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
