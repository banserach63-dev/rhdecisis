"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Agent } from "@/lib/database.types";

type RefOption = { id: string; nom: string };

export function AgentForm({
  agent,
  directions,
  services,
  grades,
  categories,
  statuts,
  fonctions,
  action,
}: {
  agent?: Agent;
  directions: RefOption[];
  services: (RefOption & { direction_id: string })[];
  grades: RefOption[];
  categories: RefOption[];
  statuts: RefOption[];
  fonctions: RefOption[];
  action: (state: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Matricule" htmlFor="matricule" required>
          <Input id="matricule" name="matricule" defaultValue={agent?.matricule} required disabled={!!agent} />
        </Field>
        <Field label="Nom" htmlFor="nom" required>
          <Input id="nom" name="nom" defaultValue={agent?.nom} required />
        </Field>
        <Field label="Prénom" htmlFor="prenom" required>
          <Input id="prenom" name="prenom" defaultValue={agent?.prenom} required />
        </Field>
        <Field label="Sexe" htmlFor="sexe" required>
          <Select id="sexe" name="sexe" defaultValue={agent?.sexe ?? ""} required>
            <option value="">—</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </Select>
        </Field>
        <Field label="Date de naissance" htmlFor="date_naissance" required>
          <Input id="date_naissance" name="date_naissance" type="date" defaultValue={agent?.date_naissance} required />
        </Field>
        <Field label="Date de recrutement" htmlFor="date_recrutement" required>
          <Input id="date_recrutement" name="date_recrutement" type="date" defaultValue={agent?.date_recrutement} required />
        </Field>
        <Field label="Date de prise de fonction" htmlFor="date_prise_fonction">
          <Input id="date_prise_fonction" name="date_prise_fonction" type="date" defaultValue={agent?.date_prise_fonction ?? ""} />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={agent?.email ?? ""} />
        </Field>
        <Field label="Téléphone" htmlFor="telephone">
          <Input id="telephone" name="telephone" defaultValue={agent?.telephone ?? ""} />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Statut" htmlFor="statut_id">
          <Select id="statut_id" name="statut_id" defaultValue={agent?.statut_id ?? ""}>
            <option value="">—</option>
            {statuts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Catégorie" htmlFor="categorie_id">
          <Select id="categorie_id" name="categorie_id" defaultValue={agent?.categorie_id ?? ""}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Grade" htmlFor="grade_id">
          <Select id="grade_id" name="grade_id" defaultValue={agent?.grade_id ?? ""}>
            <option value="">—</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fonction" htmlFor="fonction_id">
          <Select id="fonction_id" name="fonction_id" defaultValue={agent?.fonction_id ?? ""}>
            <option value="">—</option>
            {fonctions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Direction" htmlFor="direction_id">
          <Select id="direction_id" name="direction_id" defaultValue={agent?.direction_id ?? ""}>
            <option value="">—</option>
            {directions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Service" htmlFor="service_id">
          <Select id="service_id" name="service_id" defaultValue={agent?.service_id ?? ""}>
            <option value="">—</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Lieu d'affectation" htmlFor="lieu_affectation">
          <Input id="lieu_affectation" name="lieu_affectation" defaultValue={agent?.lieu_affectation ?? ""} />
        </Field>
        <Field label="Situation administrative" htmlFor="situation_administrative">
          <Input id="situation_administrative" name="situation_administrative" defaultValue={agent?.situation_administrative ?? ""} />
        </Field>
      </section>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : agent ? "Enregistrer les modifications" : "Créer l'agent"}
        </Button>
      </div>
    </form>
  );
}
