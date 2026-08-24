"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createUser, type AdminUserActionState } from "@/lib/actions/admin-users";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/database.types";

const ROLES: UserRole[] = ["admin", "drh", "responsable_rh", "chef_service", "direction_generale", "agent"];

export function UserForm({
  directions,
  services,
  agents,
}: {
  directions: { id: string; nom: string }[];
  services: { id: string; nom: string }[];
  agents: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<AdminUserActionState, FormData>(createUser, undefined);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Prénom" htmlFor="prenom" required>
        <Input id="prenom" name="prenom" required />
      </Field>
      <Field label="Nom" htmlFor="nom" required>
        <Input id="nom" name="nom" required />
      </Field>
      <Field label="E-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Mot de passe initial" htmlFor="password" required hint="8 caractères minimum">
        <Input id="password" name="password" type="password" minLength={8} required />
      </Field>
      <Field label="Rôle" htmlFor="role" required>
        <Select id="role" name="role" required defaultValue="agent">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Direction (périmètre)" htmlFor="direction_id">
        <Select id="direction_id" name="direction_id">
          <option value="">—</option>
          {directions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nom}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Service (périmètre)" htmlFor="service_id">
        <Select id="service_id" name="service_id">
          <option value="">—</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Fiche agent liée" htmlFor="agent_id" hint="Pour le rôle Agent">
        <Select id="agent_id" name="agent_id">
          <option value="">—</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </Select>
      </Field>
      {state?.error && <p className="sm:col-span-2 lg:col-span-4 text-sm text-danger">{state.error}</p>}
      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer l'utilisateur"}
        </Button>
      </div>
    </form>
  );
}
