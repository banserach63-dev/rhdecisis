"use client";

import { useActionState, useState } from "react";
import { updateAiSettings, type AiSettingsActionState } from "@/lib/actions/ai-settings";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { AiProvider, AiSettings } from "@/lib/database.types";

const PROVIDERS: { value: AiProvider; label: string; hint: string }[] = [
  { value: "anthropic", label: "Claude (Anthropic)", hint: "Ex. modèle : claude-sonnet-5" },
  { value: "openai", label: "OpenAI", hint: "Ex. modèle : gpt-4.1" },
  { value: "deepseek", label: "DeepSeek", hint: "Ex. modèle : deepseek-chat" },
];

export function AiSettingsForm({
  settings,
  envKeyConfigured,
}: {
  settings: AiSettings;
  envKeyConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState<AiSettingsActionState, FormData>(updateAiSettings, undefined);
  const [provider, setProvider] = useState<AiProvider>(settings.provider);

  const hasStoredKey = Boolean(settings.api_key);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Fournisseur IA" htmlFor="provider" required>
        <Select
          id="provider"
          name="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value as AiProvider)}
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Modèle (optionnel)"
        htmlFor="model"
        hint={PROVIDERS.find((p) => p.value === provider)?.hint}
      >
        <Input
          id="model"
          name="model"
          defaultValue={settings.provider === provider ? settings.model ?? "" : ""}
          placeholder="Laisser vide pour utiliser le modèle par défaut"
        />
      </Field>

      <Field
        label="Clé API"
        htmlFor="api_key"
        hint={
          hasStoredKey
            ? "Une clé est déjà enregistrée. Laissez vide pour la conserver, ou saisissez-en une nouvelle pour la remplacer."
            : envKeyConfigured
              ? "Aucune clé enregistrée dans l'application — une variable d'environnement serveur est utilisée par défaut."
              : "Aucune clé configurée pour le moment."
        }
      >
        <Input id="api_key" name="api_key" type="password" placeholder={hasStoredKey ? "••••••••••••••••" : "sk-…"} autoComplete="off" />
      </Field>

      {hasStoredKey && (
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="clear_api_key" className="h-3.5 w-3.5" />
          Supprimer la clé enregistrée (revenir à la variable d&rsquo;environnement serveur)
        </label>
      )}

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">Configuration enregistrée.</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
