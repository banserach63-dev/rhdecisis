"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { updateAbsenceStatut } from "@/lib/actions/absences";

export function AbsenceStatusActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      <button
        disabled={pending}
        onClick={() => startTransition(() => updateAbsenceStatut(id, "validee"))}
        className="rounded p-1.5 text-success hover:bg-success-soft"
        aria-label="Valider"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => updateAbsenceStatut(id, "refusee"))}
        className="rounded p-1.5 text-danger hover:bg-danger-soft"
        aria-label="Refuser"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
