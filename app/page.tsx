import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getProfile } from "@/lib/auth";

export default async function RootPage() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Image
        src="/landing-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-[68%_50%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />

      <div className="relative flex min-h-screen flex-col px-6 py-6 lg:px-14 lg:py-8">
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-semibold tracking-tight text-ink">SARH-AD</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            Se connecter <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-1 items-center">
          <div className="max-w-xl">
            <p className="text-sm font-medium tracking-wide text-primary">
              Système Analytique RH d&rsquo;Aide à la Décision
            </p>
            <h1 className="text-balance mt-4 text-4xl font-bold leading-tight tracking-tight text-ink lg:text-5xl">
              Des données RH fiables pour des décisions efficaces
            </h1>
            <p className="mt-6 max-w-md text-base font-normal leading-relaxed text-muted">
              Centralisez, analysez et transformez vos données en indicateurs pertinents pour piloter la performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
