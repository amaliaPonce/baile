"use client";

import { useEffect, useState, startTransition } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Booking = {
  id: string;
  professor_id: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  student_dance_style: string | null;
  student_level: string | null;
  notes: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
};

type BookingsTableProps = {
  professorId: string;
  initialBookings: Booking[];
};

export default function BookingsTable({
  professorId,
  initialBookings,
}: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bookings-table-${professorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `professor_id=eq.${professorId}`,
        },
        () => {
          startTransition(() => {
            router.refresh();
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professorId, router]);

  async function handleDeleteBooking(bookingId: string) {
    setDeletingId(bookingId);

    const response = await fetch("/api/bookings", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
    });

    setDeletingId(null);

    if (!response.ok) {
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== bookingId),
    );

    startTransition(() => {
      router.refresh();
    });
  }

  return (
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
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
            {bookings.map((booking) => (
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
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(booking.id)}
                    disabled={deletingId === booking.id}
                    className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {deletingId === booking.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
