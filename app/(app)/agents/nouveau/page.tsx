import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { AgentForm } from "@/components/agents/agent-form";
import { loadAgentFormReferentiels } from "@/lib/queries/referentiels";
import { createAgent } from "@/lib/actions/agents";

export default async function NouvelAgentPage() {
  await requireRole("admin", "drh", "responsable_rh");
  const ref = await loadAgentFormReferentiels();

  return (
    <div>
      <PageHeader title="Nouvel agent" description="Créer une nouvelle fiche agent dans le système." />
      <Card>
        <CardBody>
          <AgentForm {...ref} action={createAgent} />
        </CardBody>
      </Card>
    </div>
  );
}
