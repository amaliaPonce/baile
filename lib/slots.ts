import "server-only";

import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parseISO,
  set,
  startOfDay,
} from "date-fns";

import { createAdminClient } from "@/lib/supabase/admin";

export type AvailableSlot = {
  date: string;
  start_time: string;
  end_time: string;
};

type AvailabilityRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type BookingRow = {
  date: string;
  start_time: string;
  end_time: string;
  status: string;
};

function normalizeTime(time: string) {
  return time.slice(0, 5);
}

function combineDateTime(date: Date, time: string) {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);

  return set(date, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });
}

export async function generateAvailableSlots(
  professorId: string,
  weeksAhead = 4,
) {
  const supabase = createAdminClient();
  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, weeksAhead * 7);

  const [{ data: availability, error: availabilityError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase
        .from("availability_slots")
        .select("day_of_week, start_time, end_time, is_active")
        .eq("professor_id", professorId)
        .eq("is_active", true),
      supabase
        .from("bookings")
        .select("date, start_time, end_time, status")
        .eq("professor_id", professorId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd")),
    ]);

  if (availabilityError) {
    throw new Error(availabilityError.message);
  }

  if (bookingsError) {
    throw new Error(bookingsError.message);
  }

  const activeAvailability = (availability ?? []) as AvailabilityRow[];
  const bookingRows = (bookings ?? []) as BookingRow[];
  const bookingSet = new Set(
    bookingRows
      .filter((booking) => booking.status !== "cancelled")
      .map(
        (booking) =>
          `${booking.date}_${normalizeTime(booking.start_time)}_${normalizeTime(booking.end_time)}`,
      ),
  );

  const slots: AvailableSlot[] = [];

  for (let offset = 0; offset < weeksAhead * 7; offset += 1) {
    const currentDate = addDays(startDate, offset);
    const currentDay = currentDate.getDay();
    const dayAvailability = activeAvailability.filter(
      (slot) => slot.day_of_week === currentDay && slot.is_active,
    );

    for (const slot of dayAvailability) {
      const startDateTime = combineDateTime(currentDate, slot.start_time);
      const endDateTime = combineDateTime(currentDate, slot.end_time);

      if (isBefore(startDateTime, new Date())) {
        continue;
      }

      const key = `${format(currentDate, "yyyy-MM-dd")}_${normalizeTime(slot.start_time)}_${normalizeTime(slot.end_time)}`;

      if (bookingSet.has(key)) {
        continue;
      }

      if (isBefore(parseISO(startDateTime.toISOString()), new Date())) {
        continue;
      }

      slots.push({
        date: format(currentDate, "yyyy-MM-dd"),
        start_time: format(startDateTime, "HH:mm"),
        end_time: format(
          endDateTime > startDateTime
            ? endDateTime
            : addMinutes(startDateTime, 60),
          "HH:mm",
        ),
      });
    }
  }

  return slots.sort((a, b) =>
    `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`),
  );
}
