import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import BookingForm from "@/components/BookingForm";
import { generateAvailableSlots } from "@/lib/slots";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PublicBookingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { date?: string; start?: string; end?: string };
}) {
  noStore();

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!profile) {
    notFound();
  }

  const slots = await generateAvailableSlots(profile.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(163,230,53,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#020817_48%,#04111f_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex flex-col justify-center overflow-hidden rounded-[36px] border border-cyan-400/15 bg-white/[0.03] p-8 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_80px_rgba(6,182,212,0.12)] backdrop-blur md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(163,230,53,0.12),transparent_24%)]" />

          <div className="relative">
            <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight text-white [font-family:var(--font-space-grotesk)] sm:text-5xl">
              Clases de baile privadas
            </h1>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              {profile.name}
            </p>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              {profile.bio ||
                "Una reserva directa, visual y clara para cerrar tu proxima clase sin intercambios eternos de mensajes."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
                  Profesor
                </p>
                <p className="mt-3 text-base font-semibold text-white [font-family:var(--font-space-grotesk)]">
                  {profile.name}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
                  Duracion
                </p>
                <p className="mt-3 text-base font-semibold text-white [font-family:var(--font-space-grotesk)]">
                  {profile.session_duration_minutes} min
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-lime-300/15 bg-lime-300/[0.05] px-5 py-4 text-sm text-slate-300">
              Elige horario, deja tus datos y bloquea tu plaza.
            </div>
          </div>
        </section>

        <section>
          {slots.length > 0 ? (
            <BookingForm
              professorId={profile.id}
              professorName={profile.name}
              slots={slots}
              initialDate={searchParams.date}
              initialStartTime={searchParams.start}
              initialEndTime={searchParams.end}
            />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-white p-8 text-sm text-slate-500 shadow-sm">
              No hay horarios disponibles en este momento.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
