import AvailabilityForm from "@/components/AvailabilityForm";
import { getSingleProfessorProfile } from "@/lib/professor";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AvailabilityPage() {
  const profile = await getSingleProfessorProfile();
  const supabase = createAdminClient();

  const [{ data: slots }, { data: currentProfile }] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("*")
      .eq("professor_id", profile.id)
      .order("day_of_week"),
    supabase
      .from("profiles")
      .select("session_duration_minutes")
      .eq("id", profile.id)
      .single(),
  ]);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
          Configuracion
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Disponibilidad semanal
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Define que franjas semanales aparecen en tu pagina publica de reservas.
        </p>
      </div>

      <AvailabilityForm
        initialSlots={slots ?? []}
        sessionDurationMinutes={currentProfile?.session_duration_minutes ?? 60}
      />
    </section>
  );
}
