"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createAbsence, type AbsenceActionState } from "@/lib/actions/absences";

type Opt = { id: string; label: string };

export function AbsenceForm({
  agents,
  types,
  showAgentSelect,
}: {
  agents: Opt[];
  types: Opt[];
  showAgentSelect: boolean;
}) {
  const [state, action, pending] = useActionState<AbsenceActionState, FormData>(createAbsence, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {showAgentSelect && (
        <Field label="Agent" htmlFor="agent_id" required>
          <Select id="agent_id" name="agent_id" required>
            <option value="">—</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Type d'absence" htmlFor="type_absence_id" required>
        <Select id="type_absence_id" name="type_absence_id" required>
          <option value="">—</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Date de début" htmlFor="date_debut" required>
        <Input id="date_debut" name="date_debut" type="date" required />
      </Field>
      <Field label="Date de fin" htmlFor="date_fin" required>
        <Input id="date_fin" name="date_fin" type="date" required />
      </Field>
      <div className={showAgentSelect ? "lg:col-span-1" : "sm:col-span-2"}>
        <Field label="Motif" htmlFor="motif">
          <Textarea id="motif" name="motif" rows={1} />
        </Field>
      </div>
      {state?.error && <p className="sm:col-span-2 lg:col-span-4 text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="sm:col-span-2 lg:col-span-4 text-sm text-success">Absence enregistrée.</p>}
      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer l'absence"}
        </Button>
      </div>
    </form>
  );
}
