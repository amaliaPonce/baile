"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  date: string;
  start_time: string;
  end_time: string;
};

type StudentCalendarProps = {
  slug: string;
  slots: Slot[];
};

function toDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

export default function StudentCalendar({
  slug,
  slots,
}: StudentCalendarProps) {
  const router = useRouter();

  const events = useMemo<EventInput[]>(
    () =>
      slots.map((slot, index) => ({
        id: `${slot.date}-${slot.start_time}-${index}`,
        title: "Disponible",
        start: toDateTime(slot.date, slot.start_time),
        end: toDateTime(slot.date, slot.end_time),
        backgroundColor: "#16a34a",
        textColor: "#ffffff",
        extendedProps: slot,
      })),
    [slots],
  );

  function handleEventClick(info: EventClickArg) {
    const slot = info.event.extendedProps as Slot;
    router.push(
      `/book/${slug}/confirm?date=${slot.date}&start=${slot.start_time}&end=${slot.end_time}`,
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        locale={esLocale}
        initialView="timeGridWeek"
        height="auto"
        allDaySlot={false}
        nowIndicator
        selectable={false}
        editable={false}
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
    </div>
  );
}
