"use client";

import { useActionState } from "react";
import { login, type ActionState } from "./actions";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Adresse e-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="username" required placeholder="prenom.nom@organisation.ma" />
      </Field>
      <Field label="Mot de passe" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>
      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Connexion en cours…" : "Se connecter"}
      </Button>
    </form>
  );
}
