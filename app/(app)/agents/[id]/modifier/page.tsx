import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { AgentForm } from "@/components/agents/agent-form";
import { loadAgentFormReferentiels } from "@/lib/queries/referentiels";
import { updateAgent } from "@/lib/actions/agents";

export default async function ModifierAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  const { data: agent } = await supabase.from("agents").select("*").eq("id", id).maybeSingle();
  if (!agent) notFound();

  const ref = await loadAgentFormReferentiels();
  const action = updateAgent.bind(null, id);

  return (
    <div>
      <PageHeader title={`Modifier — ${agent.prenom} ${agent.nom}`} description={`Matricule ${agent.matricule}`} />
      <Card>
        <CardBody>
          <AgentForm agent={agent} {...ref} action={action} />
        </CardBody>
      </Card>
    </div>
  );
}
