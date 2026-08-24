import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function MonProfilPage() {
  const profile = await requireProfile();

  if (profile.agent_id) {
    redirect(`/agents/${profile.agent_id}`);
  }

  return (
    <div>
      <PageHeader title="Ma fiche" description="Aucune fiche agent n'est encore associée à votre compte." />
      <Card>
        <CardBody className="space-y-2 text-sm">
          <p>
            <span className="text-muted">Nom : </span>
            {profile.prenom} {profile.nom}
          </p>
          <p>
            <span className="text-muted">E-mail : </span>
            {profile.email}
          </p>
          <p className="text-muted">
            Contactez votre administrateur pour associer votre compte à votre fiche agent.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
