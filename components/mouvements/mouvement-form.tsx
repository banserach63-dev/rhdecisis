"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createMouvement, type MouvementActionState } from "@/lib/actions/mouvements";

type Opt = { id: string; label: string };

export function MouvementForm({
  agents,
  types,
  directions,
  services,
  grades,
}: {
  agents: Opt[];
  types: Opt[];
  directions: Opt[];
  services: Opt[];
  grades: Opt[];
}) {
  const [state, action, pending] = useActionState<MouvementActionState, FormData>(createMouvement, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <Field label="Type de mouvement" htmlFor="type_mouvement_id" required>
        <Select id="type_mouvement_id" name="type_mouvement_id" required>
          <option value="">—</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Date d'effet" htmlFor="date_effet" required>
        <Input id="date_effet" name="date_effet" type="date" required />
      </Field>
      <Field label="Direction de destination" htmlFor="direction_destination_id">
        <Select id="direction_destination_id" name="direction_destination_id">
          <option value="">—</option>
          {directions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Service de destination" htmlFor="service_destination_id">
        <Select id="service_destination_id" name="service_destination_id">
          <option value="">—</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Grade de destination" htmlFor="grade_destination_id">
        <Select id="grade_destination_id" name="grade_destination_id">
          <option value="">—</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Référence de la décision" htmlFor="reference_decision">
        <Input id="reference_decision" name="reference_decision" />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label="Motif" htmlFor="motif">
          <Textarea id="motif" name="motif" rows={2} />
        </Field>
      </div>
      {state?.error && <p className="sm:col-span-2 lg:col-span-3 text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="sm:col-span-2 lg:col-span-3 text-sm text-success">Mouvement enregistré avec succès.</p>}
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer le mouvement"}
        </Button>
      </div>
    </form>
  );
}
