"use client";

import { useTransition } from "react";
import { Select, Input } from "@/components/ui/form";
import { updateParticipant } from "@/lib/actions/formations";

export function ParticipantRow({
  formationId,
  participant,
}: {
  formationId: string;
  participant: { id: string; statut: string; resultat: string | null; note: number | null; agents: { nom: string; prenom: string } | null };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <tr>
      <td className="px-2 py-2 font-medium">
        {participant.agents ? `${participant.agents.prenom} ${participant.agents.nom}` : "—"}
      </td>
      <td className="px-2 py-2">
        <form
          action={(fd) => startTransition(() => updateParticipant(formationId, participant.id, fd))}
          className="flex items-center gap-2"
        >
          <Select name="statut" defaultValue={participant.statut} className="w-32 py-1 text-xs" onChange={(e) => e.currentTarget.form?.requestSubmit()}>
            <option value="inscrit">Inscrit</option>
            <option value="present">Présent</option>
            <option value="absent">Absent</option>
            <option value="complete">Complété</option>
          </Select>
          <Input name="resultat" defaultValue={participant.resultat ?? ""} placeholder="Résultat" className="w-28 py-1 text-xs" />
          <Input name="note" type="number" step="0.1" defaultValue={participant.note ?? ""} placeholder="Note" className="w-16 py-1 text-xs" />
          <button type="submit" disabled={pending} className="text-xs text-primary hover:underline">
            Enregistrer
          </button>
        </form>
      </td>
    </tr>
  );
}
