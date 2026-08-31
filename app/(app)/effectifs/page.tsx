import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Select } from "@/components/ui/form";
import { Disclosure } from "@/components/ui/disclosure";
import { SimpleBarChart, SimplePieChart } from "@/components/charts/charts";
import { Users, VenetianMask, Calendar } from "lucide-react";
import { ageFromDate, formatNumber } from "@/lib/format";

export default async function EffectifsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const sp = await searchParams;
  const supabase = await createClient();

  const [directionsRes, servicesRes] = await Promise.all([
    supabase.from("directions").select("id, nom").order("nom"),
    supabase.from("services").select("id, nom, direction_id").order("nom"),
  ]);

  let query = supabase
    .from("agents")
    .select("id, sexe, date_naissance, date_recrutement, actif, direction_id, service_id, lieu_affectation, grades(nom), categories(nom), statuts(nom), directions(nom), services(nom)")
    .eq("actif", true);

  if (sp.direction) query = query.eq("direction_id", sp.direction);
  if (sp.service) query = query.eq("service_id", sp.service);
  if (sp.statut) query = query.eq("statut_id", sp.statut);
  if (sp.sexe) query = query.eq("sexe", sp.sexe);

  const { data } = await query;
  const agents = data ?? [];

  const effectif = agents.length;
  const hommes = agents.filter((a) => a.sexe === "M").length;
  const femmes = agents.filter((a) => a.sexe === "F").length;
  const ageMoyen = effectif ? agents.reduce((s, a) => s + ageFromDate(a.date_naissance), 0) / effectif : 0;

  function groupBy<T>(items: T[], key: (t: T) => string) {
    const map = new Map<string, number>();
    items.forEach((i) => {
      const k = key(i) || "Non renseigné";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }

  const filtreActif = Boolean(sp.direction || sp.service || sp.sexe || sp.statut);
  const parCategorie = groupBy(agents, (a) => (a as unknown as { categories?: { nom: string } | null }).categories?.nom ?? "");
  const parGrade = groupBy(agents, (a) => (a as unknown as { grades?: { nom: string } | null }).grades?.nom ?? "");
  const parStatut = groupBy(agents, (a) => (a as unknown as { statuts?: { nom: string } | null }).statuts?.nom ?? "");
  const parDirection = groupBy(agents, (a) => (a as unknown as { directions?: { nom: string } | null }).directions?.nom ?? "");
  const parLieu = groupBy(agents, (a) => a.lieu_affectation ?? "");

  return (
    <div>
      <PageHeader
        title="Analyse des effectifs"
        description="Répartition du personnel selon plusieurs critères : direction, service, sexe, âge, grade, catégorie, statut, localisation."
      />

      <form className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <Select name="direction" defaultValue={sp.direction ?? ""} className="w-52">
          <option value="">Toutes les directions</option>
          {directionsRes.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nom}
            </option>
          ))}
        </Select>
        <Select name="service" defaultValue={sp.service ?? ""} className="w-52">
          <option value="">Tous les services</option>
          {servicesRes.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </Select>
        <Select name="sexe" defaultValue={sp.sexe ?? ""} className="w-40">
          <option value="">Femmes et hommes</option>
          <option value="M">Hommes</option>
          <option value="F">Femmes</option>
        </Select>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Appliquer
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Effectif" value={formatNumber(effectif)} icon={Users} />
        <StatCard label="Femmes" value={`${formatNumber(femmes)} (${effectif ? formatNumber((femmes / effectif) * 100, 1) : 0}%)`} icon={VenetianMask} tone="info" />
        <StatCard label="Hommes" value={`${formatNumber(hommes)} (${effectif ? formatNumber((hommes / effectif) * 100, 1) : 0}%)`} icon={VenetianMask} tone="info" />
        <StatCard label="Âge moyen" value={`${formatNumber(ageMoyen, 1)} ans`} icon={Calendar} tone="warning" />
      </div>

      <p className="mt-6 mb-3 text-sm text-muted">
        Dépliez une dimension pour analyser la répartition. Affinez d&rsquo;abord par direction ou service ci-dessus pour
        des vues plus fines.
      </p>

      <div className="space-y-3">
        <Disclosure label="Répartition par grade et catégorie" hint={`${parGrade.length} grades`} defaultOpen={filtreActif}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Par catégorie professionnelle" />
              <CardBody>
                <SimpleBarChart data={parCategorie} xKey="name" series={[{ key: "value", label: "Effectif" }]} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Par grade" />
              <CardBody>
                <SimpleBarChart data={parGrade} xKey="name" layout="vertical" series={[{ key: "value", label: "Effectif" }]} height={Math.max(220, parGrade.length * 30)} />
              </CardBody>
            </Card>
          </div>
        </Disclosure>

        <Disclosure label="Répartition par statut et direction" defaultOpen={filtreActif}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Par statut administratif" />
              <CardBody>
                <SimplePieChart data={parStatut} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Par direction" />
              <CardBody>
                <SimpleBarChart data={parDirection} xKey="name" layout="vertical" series={[{ key: "value", label: "Effectif" }]} height={Math.max(220, parDirection.length * 30)} />
              </CardBody>
            </Card>
          </div>
        </Disclosure>

        <Disclosure label="Répartition par lieu d'affectation" hint={`${parLieu.length} lieux`}>
          <Card>
            <CardHeader title="Par lieu d'affectation" />
            <CardBody>
              <SimpleBarChart data={parLieu} xKey="name" series={[{ key: "value", label: "Effectif" }]} />
            </CardBody>
          </Card>
        </Disclosure>
      </div>
    </div>
  );
}
