"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { recordDepart } from "@/lib/actions/agents";

export function DepartForm({
  agentId,
  typesMouvement,
}: {
  agentId: string;
  typesMouvement: { id: string; nom: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          if (!confirm("Confirmez-vous l'enregistrement de ce départ ? L'agent sera marqué inactif.")) return;
          await recordDepart(agentId, fd);
          router.refresh();
        })
      }
      className="space-y-2 rounded-lg border border-danger/30 bg-danger-soft/40 p-3"
    >
      <Field label="Type de mouvement" htmlFor="type_mouvement_id">
        <Select id="type_mouvement_id" name="type_mouvement_id" required>
          <option value="">—</option>
          {typesMouvement.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Date de sortie" htmlFor="date_sortie">
        <Input id="date_sortie" name="date_sortie" type="date" required />
      </Field>
      <Field label="Motif" htmlFor="motif_sortie">
        <Textarea id="motif_sortie" name="motif_sortie" rows={2} />
      </Field>
      <Button type="submit" variant="danger" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : "Confirmer le départ"}
      </Button>
    </form>
  );
}
