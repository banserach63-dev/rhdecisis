import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Database,
  LineChart,
  BellRing,
  GaugeCircle,
  ListChecks,
  Users,
  BarChart3,
  ArrowLeftRight,
  TrendingUp,
  CalendarOff,
  GraduationCap,
  Target,
  ShieldCheck,
  FileText,
  Sparkles,
  Lock,
  History,
  BadgeCheck,
} from "lucide-react";
import { getProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";

export default async function RootPage() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <Pipeline />
      <Modules />
      <RolesAccess />
      <Security />
      <ClosingCta />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <div className="flex items-center font-semibold">
          <span className="text-[17px] tracking-tight text-ink">SARH-AD</span>
        </div>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a href="#apercu" className="hover:text-foreground">Aperçu</a>
          <a href="#modules" className="hover:text-foreground">Modules</a>
          <a href="#acces" className="hover:text-foreground">Accès &amp; rôles</a>
          <a href="#securite" className="hover:text-foreground">Sécurité</a>
        </nav>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
        >
          Se connecter <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="apercu" className="relative overflow-hidden border-b border-border">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="relative mx-auto max-w-5xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Plateforme interne — Direction des Ressources Humaines
        </span>
        <h1 className="text-balance mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Système Analytique RH d&rsquo;Aide à la Décision
        </h1>
        <p className="text-balance mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted lg:text-lg">
          Une plateforme unique pour centraliser, fiabiliser, analyser et exploiter les données RH de
          l&rsquo;organisation — au service d&rsquo;une prise de décision fondée sur des données fiables,
          actualisées et traçables.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            Accéder à la plateforme <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#modules"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Explorer les modules
          </a>
        </div>
        <p className="mt-5 text-xs text-muted">
          Accès réservé aux collaborateurs autorisés — authentification requise.
        </p>
      </div>
    </section>
  );
}

const PIPELINE_STEPS = [
  { label: "Données RH", icon: Database },
  { label: "Information", icon: ListChecks },
  { label: "Analyse", icon: LineChart },
  { label: "Alerte", icon: BellRing },
  { label: "Décision", icon: GaugeCircle },
  { label: "Suivi", icon: History },
];

function Pipeline() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-semibold text-ink">Une chaîne de valeur RH complète</h2>
          <p className="mt-2 text-sm text-muted">
            Le principe directeur du système : des données brutes jusqu&rsquo;à la décision suivie dans le temps.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="relative flex flex-1 flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-primary-soft text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <span className="mt-2.5 text-sm font-medium text-foreground">{step.label}</span>
              {i < PIPELINE_STEPS.length - 1 && (
                <ArrowRight className="absolute -right-2 top-4 hidden h-4 w-4 text-border lg:right-[-1.35rem] lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MODULES = [
  { label: "Agents", desc: "Fiches centralisées, historique et carrière de chaque agent.", icon: Users },
  { label: "Effectifs", desc: "Analyse multicritère : direction, service, âge, grade, statut.", icon: BarChart3 },
  { label: "Mouvements", desc: "Recrutements, mutations, promotions, départs et turnover.", icon: ArrowLeftRight },
  { label: "Carrières", desc: "Parcours professionnel et échéances à anticiper.", icon: TrendingUp },
  { label: "Absences & congés", desc: "Suivi et analyse de l'absentéisme par période et service.", icon: CalendarOff },
  { label: "Formations", desc: "Actions de formation, participants, coûts et compétences.", icon: GraduationCap },
  { label: "Performances", desc: "Objectifs, évaluations et taux d'atteinte par agent.", icon: Target },
  { label: "Qualité des données", desc: "Détection automatique des doublons, incohérences et anomalies.", icon: ShieldCheck },
  { label: "KPI RH", desc: "Indicateurs clés calculés à partir des données réellement enregistrées.", icon: GaugeCircle },
  { label: "Alertes", desc: "Signaux critiques, importants et qualité, générés automatiquement.", icon: BellRing },
  { label: "Rapports", desc: "Synthèses et analyses prêtes à être partagées à la Direction.", icon: FileText },
  { label: "Assistant IA", desc: "Questions en langage naturel sur les données RH autorisées.", icon: Sparkles },
];

function Modules() {
  return (
    <section id="modules" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-semibold text-ink">Les modules de la plateforme</h2>
          <p className="mt-2 text-sm text-muted">
            Un système unique couvrant l&rsquo;ensemble du cycle de gestion des ressources humaines.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <m.icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{m.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ROLES = [
  { role: "admin" as const, desc: "Administration complète de la plateforme, des utilisateurs et des paramètres." },
  { role: "drh" as const, desc: "Vue globale sur l'ensemble des effectifs, indicateurs et alertes." },
  { role: "responsable_rh" as const, desc: "Gestion et analyse RH sur son périmètre de rattachement." },
  { role: "chef_service" as const, desc: "Consultation limitée strictement aux agents de son service." },
  { role: "direction_generale" as const, desc: "Consultation des indicateurs stratégiques et tableaux de bord." },
  { role: "agent" as const, desc: "Consultation des informations personnelles selon les droits accordés." },
];

function RolesAccess() {
  return (
    <section id="acces" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink">Un accès strictement encadré par rôle</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Chaque utilisateur n&rsquo;accède qu&rsquo;aux informations autorisées par son rôle et son
              périmètre. Les données individuelles des agents restent confidentielles : un chef de service ne
              peut, par exemple, jamais consulter les données d&rsquo;un autre service.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs font-medium text-primary">
              <Lock className="h-3.5 w-3.5" /> Contrôle d&rsquo;accès appliqué au niveau de la base de données
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
            {ROLES.map((r) => (
              <div key={r.role} className="rounded-xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">{ROLE_LABELS[r.role]}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const SECURITY_POINTS = [
  { title: "Contrôle d'accès par rôle", desc: "Permissions et périmètres appliqués à chaque requête, sans exception.", icon: ShieldCheck },
  { title: "Confidentialité des données", desc: "Les informations individuelles ne sont visibles que des personnes autorisées.", icon: Lock },
  { title: "Traçabilité complète", desc: "Historique des changements, mouvements et décisions conservé dans le temps.", icon: History },
  { title: "Fiabilité des indicateurs", desc: "Les KPI sont calculés uniquement à partir des données réellement enregistrées.", icon: BadgeCheck },
];

function Security() {
  return (
    <section id="securite" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-semibold text-ink">Sécurité, confidentialité et conformité</h2>
          <p className="mt-2 text-sm text-muted">
            Des exigences non fonctionnelles prises en compte dès la conception du système.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECURITY_POINTS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-surface p-5 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Connectez-vous pour accéder à votre tableau de bord
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
          L&rsquo;accès est réservé aux collaborateurs disposant d&rsquo;un compte autorisé par
          l&rsquo;administrateur de la plateforme.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Se connecter <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-ink text-white/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs sm:flex-row lg:px-8">
        <div className="flex items-center gap-2 font-medium text-white/80">
          <span>SARH-AD — Système Analytique RH d&rsquo;Aide à la Décision</span>
        </div>
        <span>Usage strictement interne · Accès réservé aux collaborateurs autorisés</span>
      </div>
    </footer>
  );
}
