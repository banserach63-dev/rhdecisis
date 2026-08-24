import { ClipboardList } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardList className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-semibold text-foreground">SARH-AD</h1>
          <p className="text-sm text-muted">Système Analytique RH d&rsquo;Aide à la Décision</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
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
      </div>
    </div>
  );
}
