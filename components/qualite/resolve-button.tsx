"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { resolveAnomaly } from "@/lib/actions/qualite";

export function ResolveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => resolveAnomaly(id))}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-success hover:bg-success-soft"
    >
      <Check className="h-3.5 w-3.5" /> Corrigée
    </button>
  );
}
