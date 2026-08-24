"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { generateRapport, type RapportActionState } from "@/lib/actions/rapports";

export function RapportForm() {
  const [state, action, pending] = useActionState<RapportActionState, FormData>(generateRapport, undefined);
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Titre du rapport" htmlFor="titre" required>
        <Input id="titre" name="titre" required placeholder="Ex. Rapport effectifs T1" />
      </Field>
      <Field label="Type" htmlFor="type" required>
        <Select id="type" name="type" required>
          <option value="effectifs">Effectifs</option>
          <option value="mouvements">Mouvements</option>
          <option value="absences">Absences</option>
          <option value="formations">Formations</option>
          <option value="kpi">KPI RH</option>
        </Select>
      </Field>
      <Field label="Du" htmlFor="date_debut" required>
        <Input id="date_debut" name="date_debut" type="date" defaultValue={yearStart} required />
      </Field>
      <Field label="Au" htmlFor="date_fin" required>
        <Input id="date_fin" name="date_fin" type="date" defaultValue={todayStr} required />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Génération…" : "Générer"}
        </Button>
      </div>
      {state?.error && <p className="sm:col-span-2 lg:col-span-5 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
