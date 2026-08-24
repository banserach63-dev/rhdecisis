import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/form";
import { formatDate, ancienneteAnnees, initials } from "@/lib/format";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const sp = await searchParams;
  const supabase = await createClient();

  const [directionsRes, servicesRes] = await Promise.all([
    supabase.from("directions").select("id, nom").order("nom"),
    supabase.from("services").select("id, nom, direction_id").order("nom"),
  ]);

  let query = supabase
    .from("agents")
    .select("id, matricule, nom, prenom, sexe, date_recrutement, actif, direction_id, service_id, grades(nom), directions(nom), services(nom), statuts(nom)")
    .order("nom")
    .limit(200);

  if (sp.q) {
    query = query.or(`nom.ilike.%${sp.q}%,prenom.ilike.%${sp.q}%,matricule.ilike.%${sp.q}%`);
  }
  if (sp.direction) query = query.eq("direction_id", sp.direction);
  if (sp.service) query = query.eq("service_id", sp.service);
  if (sp.statut === "actif") query = query.eq("actif", true);
  if (sp.statut === "inactif") query = query.eq("actif", false);

  const { data: agents } = await query;
  const canWrite = ["admin", "drh", "responsable_rh"].includes(profile.role);

  return (
    <div>
      <PageHeader
        title="Agents"
        description="Fiches centralisées du personnel — recherche, filtres et accès au dossier complet."
        action={
          canWrite ? (
            <LinkButton href="/agents/nouveau" size="sm">
              <Plus className="h-4 w-4" /> Nouvel agent
            </LinkButton>
          ) : undefined
        }
      />

      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input name="q" defaultValue={sp.q ?? ""} placeholder="Nom, prénom, matricule…" className="pl-9" />
        </div>
        <Select name="direction" defaultValue={sp.direction ?? ""} className="w-48">
          <option value="">Toutes les directions</option>
          {directionsRes.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nom}
            </option>
          ))}
        </Select>
        <Select name="service" defaultValue={sp.service ?? ""} className="w-48">
          <option value="">Tous les services</option>
          {servicesRes.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </Select>
        <Select name="statut" defaultValue={sp.statut ?? "actif"} className="w-40">
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
          <option value="">Tous</option>
        </Select>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Filtrer
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Matricule</th>
              <th className="px-4 py-3">Direction / Service</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Ancienneté</th>
              <th className="px-4 py-3">Situation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(agents ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  Aucun agent ne correspond aux critères sélectionnés.
                </td>
              </tr>
            )}
            {(agents ?? []).map((a) => {
              const direction = (a as unknown as { directions?: { nom: string } | null }).directions;
              const service = (a as unknown as { services?: { nom: string } | null }).services;
              const grade = (a as unknown as { grades?: { nom: string } | null }).grades;
              const statut = (a as unknown as { statuts?: { nom: string } | null }).statuts;
              return (
                <tr key={a.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <Link href={`/agents/${a.id}`} className="flex items-center gap-2.5 font-medium text-foreground hover:text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                        {initials(a.prenom, a.nom)}
                      </span>
                      {a.prenom} {a.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{a.matricule}</td>
                  <td className="px-4 py-3">
                    <div>{direction?.nom ?? "—"}</div>
                    <div className="text-xs text-muted">{service?.nom ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">{grade?.nom ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={a.actif ? "success" : "default"}>{statut?.nom ?? (a.actif ? "Actif" : "Inactif")}</Badge>
                  </td>
                  <td className="px-4 py-3">{ancienneteAnnees(a.date_recrutement)} ans</td>
                  <td className="px-4 py-3 text-xs text-muted">Depuis le {formatDate(a.date_recrutement)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
