"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Slot = {
  date: string;
  start_time: string;
  end_time: string;
};

type BookingFormProps = {
  professorId: string;
  professorName: string;
  slots: Slot[];
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
};

type Confirmation = {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  emailError?: string | null;
};

export default function BookingForm({
  professorId,
  professorName,
  slots,
  initialDate,
  initialStartTime,
  initialEndTime,
}: BookingFormProps) {
  const initialSlot =
    slots.find(
      (slot) =>
        slot.date === initialDate &&
        slot.start_time === initialStartTime &&
        slot.end_time === initialEndTime,
    ) ?? slots[0];

  const [selectedSlotValue, setSelectedSlotValue] = useState(
    initialSlot
      ? `${initialSlot.date}|${initialSlot.start_time}|${initialSlot.end_time}`
      : "",
  );
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentDanceStyle, setStudentDanceStyle] = useState("salsa");
  const [studentLevel, setStudentLevel] = useState("iniciacion");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const selectedSlot = slots.find(
    (slot) =>
      `${slot.date}|${slot.start_time}|${slot.end_time}` === selectedSlotValue,
  );

  const selectedSlotLabel = selectedSlot
    ? format(
        new Date(`${selectedSlot.date}T${selectedSlot.start_time}`),
        "EEEE, d 'de' MMMM",
        { locale: es },
      )
    : "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedSlot) {
      setError("Selecciona una fecha y horario antes de reservar.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professor_id: professorId,
        student_name: studentName,
        student_email: studentEmail,
        student_phone: studentPhone,
        student_dance_style: studentDanceStyle,
        student_level: studentLevel,
        notes,
        date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudo crear la reserva.");
      return;
    }

    setConfirmation({
      bookingId: payload.bookingId,
      studentName,
      studentEmail,
      emailError: payload.emailError,
    });
  }

  if (confirmation) {
    return (
      <div className="overflow-hidden rounded-[32px] border border-emerald-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-6 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
            Reserva completada
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Reserva confirmada</h2>
          <p className="mt-2 text-sm text-emerald-50">
            Hemos guardado tu clase y ya tienes el hueco bloqueado.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-sm text-slate-600">
            {confirmation.emailError
              ? "La reserva se ha guardado, pero el correo de confirmacion no se pudo enviar todavia."
              : "Recibiras la confirmacion de la clase por correo electronico."}
          </p>
          {confirmation.emailError ? (
            <p className="mt-2 text-sm text-amber-700">{confirmation.emailError}</p>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Profesor
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {professorName}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Alumno
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {confirmation.studentName}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Correo
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {confirmation.studentEmail}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Horario
              </p>
              <p className="mt-2 text-base font-semibold capitalize text-slate-950">
                {selectedSlotLabel}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedSlot?.start_time}-{selectedSlot?.end_time}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-600">
            <span className="font-medium text-slate-900">ID de reserva:</span>{" "}
            {confirmation.bookingId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[32px] border border-white/70 bg-white/96 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-white via-teal-50/50 to-sky-50 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
          Reserva tu clase
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Completa tus datos
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Elige el horario, dinos tu nivel y deja tus datos para recibir la
              confirmacion al instante.
            </p>
          </div>

          <div className="rounded-[24px] border border-teal-100 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Resumen
            </p>
            <p className="mt-3 text-base font-semibold text-slate-950">
              {professorName}
            </p>
            <p className="mt-2 text-sm capitalize text-slate-600">
              {selectedSlotLabel || "Selecciona un horario"}
            </p>
            <p className="mt-1 text-sm font-medium text-teal-700">
              {selectedSlot
                ? `${selectedSlot.start_time}-${selectedSlot.end_time}`
                : "Sin horario seleccionado"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Paso 1
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              Elige tu clase
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fecha y hora
              </label>
              <select
                value={selectedSlotValue}
                onChange={(event) => setSelectedSlotValue(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
              >
                {slots.length === 0 ? (
                  <option value="">No hay horarios disponibles</option>
                ) : null}
                {slots.map((slot) => {
                  const value = `${slot.date}|${slot.start_time}|${slot.end_time}`;

                  return (
                    <option key={value} value={value}>
                      {`${format(
                        new Date(`${slot.date}T${slot.start_time}`),
                        "EEEE, d 'de' MMMM",
                        { locale: es },
                      )} • ${slot.start_time}-${slot.end_time}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Estilo
              </label>
              <select
                value={studentDanceStyle}
                onChange={(event) => setStudentDanceStyle(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
              >
                <option value="salsa">Salsa</option>
                <option value="bachata">Bachata</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nivel
              </label>
              <select
                value={studentLevel}
                onChange={(event) => setStudentLevel(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
              >
                <option value="iniciacion">Iniciacion</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Paso 2
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              Datos de contacto
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
                placeholder="Tu nombre y apellidos"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Telefono
              </label>
              <input
                type="tel"
                value={studentPhone}
                onChange={(event) => setStudentPhone(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
                placeholder="600 000 000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Correo electronico
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Paso 3
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              Comentarios opcionales
            </h3>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Comentarios y observaciones
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none ring-teal-500 transition focus:border-teal-300 focus:bg-white focus:ring-2"
              placeholder="Cuéntanos si vienes de cero, si prefieres un enfoque concreto o cualquier detalle útil."
            />
          </div>
        </section>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Los campos obligatorios se validan al enviar. Recibiras la confirmacion
          de tu clase al instante por correo.
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || slots.length === 0}
          className="w-full rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Guardando..." : "Confirmar reserva"}
        </button>
      </div>
    </form>
  );
}
