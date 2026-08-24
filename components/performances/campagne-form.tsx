"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createCampagne, type PerfActionState } from "@/lib/actions/performances";

export function CampagneForm() {
  const [state, action, pending] = useActionState<PerfActionState, FormData>(createCampagne, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-end">
      <Field label="Nom de la campagne" htmlFor="nom" required>
        <Input id="nom" name="nom" required />
      </Field>
      <Field label="Début" htmlFor="periode_debut" required>
        <Input id="periode_debut" name="periode_debut" type="date" required />
      </Field>
      <Field label="Fin" htmlFor="periode_fin" required>
        <Input id="periode_fin" name="periode_fin" type="date" required />
      </Field>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Création…" : "Créer la campagne"}
      </Button>
      {state?.error && <p className="sm:col-span-4 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
