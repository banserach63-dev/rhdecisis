"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Disclosure({
  label,
  hint,
  defaultOpen = false,
  children,
}: {
  label: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-muted"
        aria-expanded={open}
      >
        <span>
          {label}
          {hint && <span className="ml-2 font-normal text-muted">{hint}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
