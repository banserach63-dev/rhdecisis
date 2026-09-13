"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createFormation, type FormationActionState } from "@/lib/actions/formations";

type Opt = { id: string; label: string };

export function FormationForm({ organismes, competences }: { organismes: Opt[]; competences: Opt[] }) {
  const [state, action, pending] = useActionState<FormationActionState, FormData>(createFormation, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Titre" htmlFor="titre" required>
        <Input id="titre" name="titre" required />
      </Field>
      <Field label="Organisme" htmlFor="organisme_id">
        <Select id="organisme_id" name="organisme_id">
          <option value="">—</option>
          {organismes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Compétence développée" htmlFor="competence_id">
        <Select id="competence_id" name="competence_id">
          <option value="">—</option>
          {competences.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Date de début" htmlFor="date_debut">
        <Input id="date_debut" name="date_debut" type="date" />
      </Field>
      <Field label="Date de fin" htmlFor="date_fin">
        <Input id="date_fin" name="date_fin" type="date" />
      </Field>
      <Field label="Lieu" htmlFor="lieu">
        <Input id="lieu" name="lieu" />
      </Field>
      <Field label="Coût (MAD)" htmlFor="cout">
        <Input id="cout" name="cout" type="number" min={0} />
      </Field>
      <Field label="Durée (heures)" htmlFor="duree_heures">
        <Input id="duree_heures" name="duree_heures" type="number" min={0} />
      </Field>
      <Field label="Capacité" htmlFor="capacite">
        <Input id="capacite" name="capacite" type="number" min={0} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={2} />
        </Field>
      </div>
      {state?.error && <p className="sm:col-span-2 lg:col-span-3 text-sm text-danger">{state.error}</p>}
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer la formation"}
        </Button>
      </div>
    </form>
  );
}
