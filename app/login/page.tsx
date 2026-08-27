import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { LoginForm } from "./login-form";
import { SetupForm } from "./setup-form";

// Reads live data (profiles count) via the service-role client to decide
// between the first-run setup form and the login form — never prerender.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = createAdminClient();
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true });
  const needsSetup = !count || count === 0;

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center bg-background px-4 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_30%,black,transparent)]">
      <div className="relative w-full max-w-sm [mask-image:none]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&rsquo;accueil
        </Link>

        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">SARH-AD</h1>
          <p className="mt-1 text-sm text-muted">Système Analytique RH d&rsquo;Aide à la Décision</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-lg shadow-ink/5">
          {needsSetup ? (
            <>
              <h2 className="mb-1 text-sm font-semibold text-foreground">Configuration initiale</h2>
              <p className="mb-4 text-xs text-muted">
                Aucun compte n&rsquo;existe encore. Créez le compte administrateur pour démarrer.
              </p>
              <SetupForm />
            </>
          ) : (
            <>
              <h2 className="mb-4 text-sm font-semibold text-foreground">Connexion</h2>
              <LoginForm />
            </>
          )}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted">
          Usage strictement interne — accès réservé aux collaborateurs autorisés.
        </p>
      </div>
    </div>
  );
}
