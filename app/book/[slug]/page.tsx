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
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center text-white">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-300">
            Intensivos de baile
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Pablo Cabezuelo Fayos
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-slate-300">
            {profile.bio ||
              "Reserva tu clase de baile en un solo paso. Elige fecha, completa tus datos y recibiras la confirmacion de la clase al instante por email."}
          </p>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            <p>
              <span className="font-semibold text-white">Profesor:</span>{" "}
              {profile.name}
            </p>
            <p>
              <span className="font-semibold text-white">Duracion:</span>{" "}
              {profile.session_duration_minutes} minutos
            </p>
            <p>
              <span className="font-semibold text-white">Plazas:</span>{" "}
              {slots.length > 0
                ? `${slots.length} horarios disponibles`
                : "Sin horarios disponibles"}
            </p>
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
