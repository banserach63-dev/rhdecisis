"use client";

import { useTransition } from "react";
import { togglePermission } from "@/lib/actions/role-permissions";

export function PermissionCheckbox({
  id,
  field,
  value,
}: {
  id: string;
  field: "peut_voir" | "peut_creer" | "peut_modifier" | "peut_supprimer";
  value: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <input
      type="checkbox"
      defaultChecked={value}
      disabled={pending}
      onChange={(e) => startTransition(() => togglePermission(id, field, e.target.checked))}
      className="h-4 w-4"
    />
  );
}
