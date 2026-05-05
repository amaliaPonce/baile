"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
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

type ProfessorCalendarProps = {
  professorId: string;
  initialBookings: Booking[];
};

function toDateTime(date: string, time: string) {
  return `${date}T${time.slice(0, 5)}:00`;
}

export default function ProfessorCalendar({
  professorId,
  initialBookings,
}: ProfessorCalendarProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bookings-${professorId}`)
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

  const events = useMemo<EventInput[]>(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        title: booking.student_name,
        start: toDateTime(booking.date, booking.start_time),
        end: toDateTime(booking.date, booking.end_time),
        backgroundColor: booking.status === "cancelled" ? "#94a3b8" : "#0f766e",
        textColor: "#ffffff",
        extendedProps: booking,
      })),
    [bookings],
  );

  async function handleCancelBooking() {
    if (!selectedBooking) {
      return;
    }

    setIsCancelling(true);

    const response = await fetch("/api/bookings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId: selectedBooking.id }),
    });

    setIsCancelling(false);

    if (!response.ok) {
      return;
    }

    const updatedBookings = bookings.map((booking) =>
      booking.id === selectedBooking.id
        ? { ...booking, status: "cancelled" }
        : booking,
    );

    setBookings(updatedBookings);
    setSelectedBooking({
      ...selectedBooking,
      status: "cancelled",
    });
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteBooking() {
    if (!selectedBooking) {
      return;
    }

    setIsDeleting(true);

    const response = await fetch("/api/bookings", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId: selectedBooking.id }),
    });

    setIsDeleting(false);

    if (!response.ok) {
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== selectedBooking.id),
    );
    setSelectedBooking(null);
    startTransition(() => {
      router.refresh();
    });
  }

  function handleEventClick(info: EventClickArg) {
    setSelectedBooking(info.event.extendedProps as Booking);
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        locale={esLocale}
        initialView="timeGridWeek"
        height="auto"
        allDaySlot={false}
        nowIndicator
        editable={false}
        selectable={false}
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoy",
          week: "Semana",
          day: "Dia",
        }}
        dayHeaderFormat={{ weekday: "short", day: "numeric" }}
      />

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedBooking.student_name}
                </h2>
                <p className="text-sm text-slate-500">
                  {format(
                    new Date(
                      `${selectedBooking.date}T${selectedBooking.start_time}`,
                    ),
                    "EEEE, d 'de' MMMM",
                    { locale: es },
                  )}{" "}
                  • {selectedBooking.start_time.slice(0, 5)}-
                  {selectedBooking.end_time.slice(0, 5)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Email:</span>{" "}
                {selectedBooking.student_email}
              </p>
              <p>
                <span className="font-medium text-slate-900">Telefono:</span>{" "}
                {selectedBooking.student_phone || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Estilo:</span>{" "}
                {selectedBooking.student_dance_style || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Nivel:</span>{" "}
                {selectedBooking.student_level || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Estado:</span>{" "}
                {selectedBooking.status === "cancelled"
                  ? "cancelada"
                  : "confirmada"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Notas:</span>{" "}
                {selectedBooking.notes || "Sin notas"}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {selectedBooking.status !== "cancelled" ? (
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {isCancelling ? "Cancelando..." : "Cancelar reserva"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleDeleteBooking}
                disabled={isDeleting}
                className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isDeleting ? "Eliminando..." : "Eliminar reserva"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
