"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createEvaluation, type PerfActionState } from "@/lib/actions/performances";

type Opt = { id: string; label: string };

export function EvaluationForm({ agents, campagnes }: { agents: Opt[]; campagnes: Opt[] }) {
  const [state, action, pending] = useActionState<PerfActionState, FormData>(createEvaluation, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      <Field label="Campagne" htmlFor="campagne_id">
        <Select id="campagne_id" name="campagne_id">
          <option value="">—</option>
          {campagnes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note globale (/20)" htmlFor="note_globale">
        <Input id="note_globale" name="note_globale" type="number" min={0} max={20} step={0.1} />
      </Field>
      <Field label="Taux d'atteinte (%)" htmlFor="taux_atteinte">
        <Input id="taux_atteinte" name="taux_atteinte" type="number" min={0} max={100} step={0.1} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Synthèse" htmlFor="synthese">
          <Textarea id="synthese" name="synthese" rows={2} />
        </Field>
      </div>
      {state?.error && <p className="sm:col-span-2 lg:col-span-4 text-sm text-danger">{state.error}</p>}
      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer l'évaluation"}
        </Button>
      </div>
    </form>
  );
}
