import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getProfile } from "@/lib/auth";

export default async function RootPage() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <span className="text-[17px] font-semibold tracking-tight text-ink">SARH-AD</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            Se connecter <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-8 lg:px-8">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-border shadow-lg shadow-ink/5">
          <Image
            src="/landing-hero.png"
            alt="SARH-AD — Système Analytique RH d'Aide à la Décision"
            width={1536}
            height={1024}
            priority
            className="h-auto w-full"
          />
        </div>
      </main>
    </div>
  );
}
