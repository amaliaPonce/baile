import BookingsTable from "@/components/BookingsTable";
import { getSingleProfessorProfile } from "@/lib/professor";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function BookingsPage() {
  const profile = await getSingleProfessorProfile();
  const supabase = createAdminClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("professor_id", profile.id)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
          Gestion
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Reservas
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Lista completa de clases, incluidas las sesiones canceladas.
        </p>
      </div>

      <BookingsTable professorId={profile.id} initialBookings={bookings ?? []} />
    </section>
  );
}
