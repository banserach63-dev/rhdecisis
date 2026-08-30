import { Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAiSettingsForAdmin } from "@/lib/actions/ai-settings";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiSettingsForm } from "@/components/admin/ai-settings-form";
import { PROVIDER_LABELS } from "@/lib/ai/providers";

export default async function AdminAssistantIaPage() {
  await requireRole("admin");
  const { settings, envKeyConfigured } = await getAiSettingsForAdmin();
  const configured = Boolean(settings.api_key) || envKeyConfigured;

  return (
    <div>
      <PageHeader
        title="Assistant IA"
        description="Choisissez le fournisseur d'intelligence artificielle utilisé par l'Assistant Analytique RH et configurez sa clé d'accès."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Configuration du fournisseur"
            description="La clé API est stockée côté serveur et n'est jamais transmise au navigateur."
          />
          <CardBody>
            <AiSettingsForm settings={settings} envKeyConfigured={envKeyConfigured} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Statut actuel" />
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Fournisseur</span>
              <span className="font-medium">{PROVIDER_LABELS[settings.provider]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Modèle</span>
              <span className="font-medium">{settings.model || "Par défaut"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Clé API</span>
              <Badge tone={configured ? "success" : "warning"}>{configured ? "Configurée" : "Non configurée"}</Badge>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary-soft p-3 text-xs text-primary">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              L&rsquo;assistant est accessible via le bouton flottant dans toute l&rsquo;application (rôles DRH, Responsable
              RH, Direction générale et Administrateur), et travaille uniquement à partir des données RH autorisées.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
