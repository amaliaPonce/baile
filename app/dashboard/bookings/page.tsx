import { format } from "date-fns";
import { es } from "date-fns/locale";

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

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/90">
              <tr className="text-left text-sm font-medium text-slate-600">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Estilo</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {(bookings ?? []).map((booking) => (
                <tr key={booking.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {format(
                      new Date(`${booking.date}T${booking.start_time}`),
                      "d MMM yyyy",
                      { locale: es },
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {booking.start_time.slice(0, 5)}-{booking.end_time.slice(0, 5)}
                  </td>
                  <td className="px-4 py-4">{booking.student_name}</td>
                  <td className="px-4 py-4">{booking.student_dance_style || "—"}</td>
                  <td className="px-4 py-4">{booking.student_level || "—"}</td>
                  <td className="px-4 py-4">{booking.student_phone || "—"}</td>
                  <td className="px-4 py-4">{booking.student_email}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                        booking.status === "cancelled"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-teal-50 text-teal-700"
                      }`}
                    >
                      {booking.status === "cancelled" ? "cancelada" : "confirmada"}
                    </span>
                  </td>
                  <td className="px-4 py-4">{booking.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
