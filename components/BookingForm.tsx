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

  const fieldClassName = "w-full min-w-0 border border-[#cfc9c5] bg-white px-4 py-3 text-base text-[#141415] min-h-[48px] outline-none placeholder:text-[#78737a] focus:border-[#78668d] focus:ring-1 focus:ring-[#78668d]";
  const dates = Array.from(new Set(slots.map(slot => slot.date))).sort();
  const selectedDate = selectedSlot?.date ?? "";
  const daySlots = slots.filter(slot => slot.date === selectedDate);
  const slotValue = (slot: Slot) => `${slot.date}|${slot.start_time}|${slot.end_time}`;
  const labelClass = "mb-2 block text-sm font-medium text-[#423e45]";
  const stepClass = "text-xs font-semibold uppercase tracking-[0.18em] text-[#78668d]";
  const headingClass = "mt-2 text-2xl font-semibold tracking-tight [font-family:var(--font-space-grotesk)]";
  function selectDate(date: string) {
    const first = slots.find(slot => slot.date === date);
    if (first) setSelectedSlotValue(slotValue(first));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!selectedSlot) {
      setError("Selecciona una fecha y horario antes de reservar.");
      return;
    }

    setIsSubmitting(true);

    try {
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
    } catch {
      setError("No se ha podido comprobar el resultado de la reserva. Contacta con Pablo antes de intentarlo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="border border-[#d7d1cc] bg-white text-[#141415]">
        <div className="bg-[#141415] p-6 text-[#f5f2ed] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4b8d1]">✓ Reserva completada</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] [font-family:var(--font-space-grotesk)]">Nos vemos en la pista.</h2>
          <p className="mt-3 text-sm text-[#ddd7df]">Tu clase está reservada.</p>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <p className="text-sm" role="status">{confirmation.emailError ? "La reserva se ha guardado, pero no se ha podido enviar el correo de confirmación." : "Recibirás la confirmación de tu clase por correo electrónico."}</p>
          {confirmation.emailError ? <p className="text-sm text-[#8a4e25]">{confirmation.emailError}</p> : null}
          <dl className="grid gap-4 border-y border-[#d7d1cc] py-5 sm:grid-cols-2">
            <div><dt className={stepClass}>Profesor</dt><dd className="mt-2 font-medium">{professorName}</dd></div>
            <div><dt className={stepClass}>Alumno</dt><dd className="mt-2 break-words font-medium">{confirmation.studentName}</dd></div>
            <div><dt className={stepClass}>Correo</dt><dd className="mt-2 break-all text-sm">{confirmation.studentEmail}</dd></div>
            <div><dt className={stepClass}>Horario</dt><dd className="mt-2 capitalize">{selectedSlotLabel}<br/>{selectedSlot?.start_time.slice(0,5)} – {selectedSlot?.end_time.slice(0,5)}</dd></div>
          </dl>
          <a href="/" className="inline-flex border-b border-[#141415] pb-1 text-sm font-medium">Volver al portfolio ↗</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 border border-[#d7d1cc] bg-white text-[#141415]">
      <div className="bg-[#141415] p-6 text-[#f5f2ed] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4b8d1]">PCF / RESERVAS</p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.055em] [font-family:var(--font-space-grotesk)] sm:text-4xl">Tu próxima clase<span className="text-[#b8a6c9]">.</span></h2>
        <p className="mt-3 text-sm leading-relaxed text-[#ddd7df]">Elige un horario disponible y completa tus datos.</p>
      </div>
      <fieldset disabled={isSubmitting} className="min-w-0 space-y-7 border-0 p-4 sm:space-y-8 sm:p-8">
        <section className="space-y-4">
          <div><p className={stepClass}>01 / Disponibilidad</p><h3 className={headingClass}>Elige fecha y hora</h3></div>
          <div className="flex max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2" role="group" aria-label="Fechas disponibles">
            {dates.map(date => {
              const day = new Date(`${date}T12:00:00`);
              return <button key={date} type="button" aria-pressed={selectedDate === date} onClick={() => selectDate(date)} className={`min-w-[76px] shrink-0 snap-start border px-3 py-3 text-center transition-colors ${selectedDate === date ? "border-[#141415] bg-[#141415] text-white" : "border-[#d7d1cc] bg-[#f5f2ed] hover:border-[#78668d]"}`}><span className="block text-xs capitalize">{format(day,"EEE",{locale:es})}</span><span className="block text-2xl font-semibold">{format(day,"d")}</span><span className="block text-xs capitalize">{format(day,"MMM",{locale:es})}</span></button>;
            })}
          </div>
          <label htmlFor="pcf-date" className={labelClass}>Fecha disponible</label>
          <select id="pcf-date" className={fieldClassName} value={selectedDate} onChange={e => selectDate(e.target.value)} required>{dates.map(date => <option key={date} value={date}>{format(new Date(`${date}T12:00:00`),"EEEE, d 'de' MMMM 'de' yyyy",{locale:es})}</option>)}</select>
          <div role="group" aria-label="Horarios disponibles" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {daySlots.map(slot => <button key={slotValue(slot)} type="button" aria-pressed={selectedSlotValue === slotValue(slot)} onClick={() => setSelectedSlotValue(slotValue(slot))} className={`min-h-[48px] border px-2 py-3 text-center text-sm font-medium transition-colors ${selectedSlotValue === slotValue(slot) ? "border-[#78668d] bg-[#e8e0ee] text-[#30283c]" : "border-[#d7d1cc] hover:border-[#78668d]"}`}>{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}</button>)}
          </div>
          <div aria-live="polite" className="border-l-2 border-[#78668d] bg-[#f5f2ed] px-4 py-3 text-sm"><span className="block text-xs font-medium uppercase tracking-widest text-[#68636b]">Tu horario</span><span className="mt-1 block capitalize">{selectedSlotLabel || "Selecciona un horario"}{selectedSlot ? ` · ${selectedSlot.start_time.slice(0,5)} – ${selectedSlot.end_time.slice(0,5)}` : ""}</span></div>
        </section>
        <section className="space-y-4 border-t border-[#d7d1cc] pt-6">
          <div><p className={stepClass}>02 / La clase</p><h3 className={headingClass}>¿Qué quieres bailar?</h3></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="pcf-style" className={labelClass}>Estilo</label><select id="pcf-style" value={studentDanceStyle} onChange={e=>setStudentDanceStyle(e.target.value)} className={fieldClassName}><option value="salsa">Salsa</option><option value="bachata">Bachata</option></select></div>
            <div><label htmlFor="pcf-level" className={labelClass}>Nivel</label><select id="pcf-level" value={studentLevel} onChange={e=>setStudentLevel(e.target.value)} className={fieldClassName}><option value="iniciacion">Iniciación</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></div>
          </div>
        </section>
        <section className="space-y-4 border-t border-[#d7d1cc] pt-6">
          <div><p className={stepClass}>03 / Contacto</p><h3 className={headingClass}>Tus datos</h3></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label htmlFor="pcf-name" className={labelClass}>Nombre completo</label><input id="pcf-name" autoComplete="name" required value={studentName} onChange={e=>setStudentName(e.target.value)} className={fieldClassName} placeholder="Tu nombre y apellidos"/></div>
            <div><label htmlFor="pcf-phone" className={labelClass}>Teléfono</label><input id="pcf-phone" type="tel" autoComplete="tel" required value={studentPhone} onChange={e=>setStudentPhone(e.target.value)} className={fieldClassName} placeholder="600 000 000"/></div>
            <div><label htmlFor="pcf-email" className={labelClass}>Correo electrónico</label><input id="pcf-email" type="email" autoComplete="email" required value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} className={fieldClassName} placeholder="tu@email.com"/></div>
          </div>
        </section>
        {error ? <p role="alert" className="border border-[#d9a6a6] bg-[#fdf0f0] p-3 text-sm text-[#8b2e2e]">{error}</p> : null}
        <div><button type="submit" disabled={isSubmitting || !selectedSlot} className="flex w-full items-center justify-between gap-4 min-h-[52px] bg-[#141415] px-5 py-4 text-left text-base font-semibold text-white transition-colors hover:bg-[#423b49] disabled:cursor-not-allowed disabled:opacity-50"><span>{isSubmitting ? "Guardando…" : "Confirmar reserva"}</span><span aria-hidden="true">↗</span></button><p className="mt-3 text-xs leading-relaxed text-[#68636b]">Recibirás los detalles de tu reserva por correo electrónico.</p></div>
      </fieldset>
    </form>
  );
}
