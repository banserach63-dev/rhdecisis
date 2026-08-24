"use client";

import { useRef, useTransition } from "react";
import { Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { addParticipant } from "@/lib/actions/formations";

export function AddParticipantForm({ formationId, agents }: { formationId: string; agents: { id: string; label: string }[] }) {
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={(fd) =>
        startTransition(async () => {
          await addParticipant(formationId, fd);
          ref.current?.reset();
        })
      }
      className="flex items-end gap-2"
    >
      <Select name="agent_id" required className="w-64">
        <option value="">Sélectionner un agent…</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={pending}>
        Ajouter
      </Button>
    </form>
  );
}
