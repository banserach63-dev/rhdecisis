"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runQualityScan } from "@/lib/actions/qualite";

export function ScanButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          await runQualityScan();
          router.refresh();
        })
      }
      disabled={pending}
      size="sm"
    >
      <ShieldCheck className="h-4 w-4" /> {pending ? "Analyse en cours…" : "Lancer un contrôle qualité"}
    </Button>
  );
}
