"use client";

import { useState, type ReactNode } from "react";

export function AgentTabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} className={active === t.key ? "block" : "hidden"}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
