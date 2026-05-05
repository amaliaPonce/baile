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

  const fieldClassName =
    "w-full rounded-[22px] border border-cyan-400/25 bg-slate-950/70 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-slate-950 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_32px_rgba(34,211,238,0.18)]";

  const sectionEyebrowClassName =
    "text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80";

  const sectionTitleClassName =
    "mt-2 text-lg font-semibold text-white [font-family:var(--font-space-grotesk)]";

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
        notes: "",
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
      <div className="overflow-hidden rounded-[32px] border border-emerald-300/30 bg-slate-950/95 shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_24px_90px_rgba(8,145,178,0.24)] backdrop-blur">
        <div className="border-b border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_42%),linear-gradient(135deg,rgba(6,182,212,0.22),rgba(15,23,42,0.98))] px-6 py-6 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
            Reserva completada
          </p>
          <h2 className="mt-3 text-2xl font-semibold [font-family:var(--font-space-grotesk)]">
            Reserva confirmada
          </h2>
          <p className="mt-2 text-sm text-emerald-50/90">
            Hemos guardado tu clase y ya tienes el hueco bloqueado.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-sm text-slate-300">
            {confirmation.emailError
              ? "La reserva se ha guardado, pero el correo de confirmacion no se pudo enviar todavia."
              : "Recibiras la confirmacion de la clase por correo electronico."}
          </p>
          {confirmation.emailError ? (
            <p className="mt-2 text-sm text-amber-300">{confirmation.emailError}</p>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Profesor
              </p>
              <p className="mt-2 text-base font-semibold text-white [font-family:var(--font-space-grotesk)]">
                {professorName}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Alumno
              </p>
              <p className="mt-2 text-base font-semibold text-white [font-family:var(--font-space-grotesk)]">
                {confirmation.studentName}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Correo
              </p>
              <p className="mt-2 text-base font-semibold text-white [font-family:var(--font-space-grotesk)]">
                {confirmation.studentEmail}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Horario
              </p>
              <p className="mt-2 text-base font-semibold capitalize text-white [font-family:var(--font-space-grotesk)]">
                {selectedSlotLabel}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {selectedSlot?.start_time}-{selectedSlot?.end_time}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[32px] border border-cyan-400/20 bg-slate-950/82 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_24px_80px_rgba(6,182,212,0.2)] backdrop-blur-xl"
    >
      <div className="border-b border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.2),transparent_24%),radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.98))] px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/85">
          Reserva tu clase
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white [font-family:var(--font-space-grotesk)] sm:text-[2rem]">
              Completa tus datos
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Elige el horario, dinos tu nivel y deja tus datos para recibir la
              confirmacion al instante.
            </p>
          </div>

          <div className="rounded-[24px] border border-cyan-300/20 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(34,211,238,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">
              Resumen
            </p>
            <p className="mt-3 text-base font-semibold text-white [font-family:var(--font-space-grotesk)]">
              {professorName}
            </p>
            <p className="mt-2 text-sm capitalize text-slate-300">
              {selectedSlotLabel || "Selecciona un horario"}
            </p>
            <p className="mt-1 text-sm font-medium text-lime-300">
              {selectedSlot
                ? `${selectedSlot.start_time}-${selectedSlot.end_time}`
                : "Sin horario seleccionado"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))] p-6 sm:p-8">
        <section className="space-y-4">
          <div>
            <p className={sectionEyebrowClassName}>
              Paso 1
            </p>
            <h3 className={sectionTitleClassName}>
              Elige tu clase
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Fecha y hora
              </label>
              <select
                value={selectedSlotValue}
                onChange={(event) => setSelectedSlotValue(event.target.value)}
                required
                className={fieldClassName}
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
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Estilo
              </label>
              <select
                value={studentDanceStyle}
                onChange={(event) => setStudentDanceStyle(event.target.value)}
                className={fieldClassName}
              >
                <option value="salsa">Salsa</option>
                <option value="bachata">Bachata</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Nivel
              </label>
              <select
                value={studentLevel}
                onChange={(event) => setStudentLevel(event.target.value)}
                className={fieldClassName}
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
            <p className={sectionEyebrowClassName}>
              Paso 2
            </p>
            <h3 className={sectionTitleClassName}>
              Datos de contacto
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Nombre completo
              </label>
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                required
                className={fieldClassName}
                placeholder="Tu nombre y apellidos"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Telefono
              </label>
              <input
                type="tel"
                value={studentPhone}
                onChange={(event) => setStudentPhone(event.target.value)}
                required
                className={fieldClassName}
                placeholder="600 000 000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Correo electronico
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                required
                className={fieldClassName}
                placeholder="tu@email.com"
              />
            </div>
          </div>
        </section>

        {error ? (
          <p className="rounded-[24px] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || slots.length === 0}
          className="w-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#10b981_55%,#a3e635_100%)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.28)] transition hover:scale-[1.01] hover:shadow-[0_0_45px_rgba(52,211,153,0.34)] disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 disabled:shadow-none"
        >
          {isSubmitting ? "Guardando..." : "Confirmar reserva"}
        </button>
      </div>
    </form>
  );
}
