"use client";

import { useActionState } from "react";
import { bootstrapAdmin, type ActionState } from "./actions";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function SetupForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(bootstrapAdmin, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" htmlFor="prenom" required>
          <Input id="prenom" name="prenom" required />
        </Field>
        <Field label="Nom" htmlFor="nom" required>
          <Input id="nom" name="nom" required />
        </Field>
      </div>
      <Field label="Adresse e-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Mot de passe" htmlFor="password" required hint="8 caractères minimum">
        <Input id="password" name="password" type="password" minLength={8} required />
      </Field>
      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Création en cours…" : "Créer le compte administrateur"}
      </Button>
    </form>
  );
}
