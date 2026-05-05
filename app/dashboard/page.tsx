import ProfessorCalendar from "@/components/Calendar/ProfessorCalendar";
import { getSingleProfessorProfile } from "@/lib/professor";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DashboardPage() {
  const profile = await getSingleProfessorProfile();
  const supabase = createAdminClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("professor_id", profile.id)
    .order("date")
    .order("start_time");

  const now = new Date();
  const bookingList = bookings ?? [];
  const confirmedCount = bookingList.filter(
    (booking) => booking.status !== "cancelled",
  ).length;
  const cancelledCount = bookingList.filter(
    (booking) => booking.status === "cancelled",
  ).length;
  const upcomingCount = bookingList.filter((booking) => {
    const start = new Date(`${booking.date}T${booking.start_time}`);
    return booking.status !== "cancelled" && start >= now;
  }).length;

  return (
    <section className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/90">
            Vista general
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Calendario de clases
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Controla las reservas confirmadas, revisa cancelaciones y manten el
            horario semanal siempre actualizado desde un unico panel.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <article className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Pendientes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {upcomingCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">Clases futuras confirmadas.</p>
          </article>
          <article className="rounded-[24px] border border-teal-100 bg-teal-50/80 p-5 shadow-sm">
            <p className="text-sm font-medium text-teal-800">Confirmadas</p>
            <p className="mt-3 text-3xl font-semibold text-teal-950">
              {confirmedCount}
            </p>
            <p className="mt-2 text-sm text-teal-800/80">Reservas activas en total.</p>
          </article>
          <article className="rounded-[24px] border border-slate-200/80 bg-slate-100/90 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Canceladas</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {cancelledCount}
            </p>
            <p className="mt-2 text-sm text-slate-600">Historial visible en el panel.</p>
          </article>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Agenda semanal</h2>
          <p className="mt-2 text-sm text-slate-500">
            Vista semanal en tiempo real de las reservas confirmadas y canceladas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-teal-800">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
            Confirmada
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Cancelada
          </span>
        </div>
      </div>

      <ProfessorCalendar
        professorId={profile.id}
        initialBookings={bookingList}
      />
    </section>
  );
}
