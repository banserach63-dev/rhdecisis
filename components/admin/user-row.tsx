"use client";

import { useState, useTransition } from "react";
import { Pencil, KeyRound } from "lucide-react";
import { Select, Input } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { updateUser, resetPassword } from "@/lib/actions/admin-users";
import { ROLE_LABELS } from "@/lib/roles";
import type { Profile, UserRole } from "@/lib/database.types";

const ROLES: UserRole[] = ["admin", "drh", "responsable_rh", "chef_service", "direction_generale", "agent"];

export function UserRow({
  profile,
  directions,
  services,
}: {
  profile: Profile & { directions?: { nom: string } | null; services?: { nom: string } | null };
  directions: { id: string; nom: string }[];
  services: { id: string; nom: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pending, startTransition] = useTransition();
  const boundUpdate = updateUser.bind(null, profile.id);

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-3">
          <form
            action={(fd) => startTransition(async () => {
              await boundUpdate(undefined, fd);
              setEditing(false);
            })}
            className="flex flex-wrap items-end gap-2"
          >
            <Select name="role" defaultValue={profile.role} className="w-44">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
            <Select name="direction_id" defaultValue={profile.direction_id ?? ""} className="w-44">
              <option value="">Sans direction</option>
              {directions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </Select>
            <Select name="service_id" defaultValue={profile.service_id ?? ""} className="w-44">
              <option value="">Sans service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" name="actif" defaultChecked={profile.actif} /> Actif
            </label>
            <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              Enregistrer
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted">
              Annuler
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-surface-muted/60">
      <td className="px-4 py-3 font-medium">
        {profile.prenom} {profile.nom}
        <div className="text-xs text-muted">{profile.email}</div>
      </td>
      <td className="px-4 py-3">
        <Badge tone="primary">{ROLE_LABELS[profile.role]}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted">
        {[profile.directions?.nom, profile.services?.nom].filter(Boolean).join(" · ") || "—"}
      </td>
      <td className="px-4 py-3">
        <Badge tone={profile.actif ? "success" : "default"}>{profile.actif ? "Actif" : "Inactif"}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <button onClick={() => setEditing(true)} className="rounded p-1.5 text-muted hover:bg-primary-soft hover:text-primary" aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setResetting((v) => !v)} className="rounded p-1.5 text-muted hover:bg-warning-soft hover:text-warning" aria-label="Réinitialiser le mot de passe">
            <KeyRound className="h-4 w-4" />
          </button>
        </div>
        {resetting && (
          <form
            action={(fd) => startTransition(async () => {
              await resetPassword(profile.id, fd);
              setResetting(false);
            })}
            className="mt-2 flex items-center gap-1"
          >
            <Input name="password" type="password" placeholder="Nouveau mot de passe" minLength={8} required className="w-40 py-1 text-xs" />
            <button type="submit" className="text-xs text-primary hover:underline">
              OK
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}
