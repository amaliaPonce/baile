import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { sendBookingEmails } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSingleProfessorProfile } from "@/lib/professor";
import { bookingSchema, cancelBookingSchema } from "@/lib/validations";

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos de reserva no validos." },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const supabase = createAdminClient();

    const dayOfWeek = parseISO(`${payload.date}T00:00:00`).getDay();

    const [
      { data: availability },
      { data: existingBooking },
      { data: professor },
      professorUser,
    ] =
      await Promise.all([
        supabase
          .from("availability_slots")
          .select("id")
          .eq("professor_id", payload.professor_id)
          .eq("day_of_week", dayOfWeek)
          .eq("start_time", normalizeTime(payload.start_time))
          .eq("end_time", normalizeTime(payload.end_time))
          .eq("is_active", true)
          .maybeSingle(),
        supabase
          .from("bookings")
          .select("id")
          .eq("professor_id", payload.professor_id)
          .eq("date", payload.date)
          .eq("start_time", normalizeTime(payload.start_time))
          .eq("end_time", normalizeTime(payload.end_time))
          .neq("status", "cancelled")
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("name")
          .eq("id", payload.professor_id)
          .single(),
        supabase.auth.admin.getUserById(payload.professor_id),
      ]);

    if (!availability) {
      return NextResponse.json(
        { error: "Esa franja ya no esta disponible." },
        { status: 409 },
      );
    }

    if (existingBooking) {
      return NextResponse.json(
        { error: "Esa franja ya ha sido reservada." },
        { status: 409 },
      );
    }

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        professor_id: payload.professor_id,
        student_name: payload.student_name,
        student_email: payload.student_email,
        student_phone: payload.student_phone,
        student_dance_style: payload.student_dance_style,
        student_level: payload.student_level,
        notes: payload.notes || null,
        date: payload.date,
        start_time: normalizeTime(payload.start_time),
        end_time: normalizeTime(payload.end_time),
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      return NextResponse.json(
        {
          error:
            insertError?.code === "23505"
              ? "Esa franja ya ha sido reservada."
              : insertError?.message ?? "No se pudo crear la reserva.",
        },
        { status: insertError?.code === "23505" ? 409 : 500 },
      );
    }

    let emailError: string | null = null;

    try {
      await sendBookingEmails({
        studentEmail: payload.student_email,
        studentName: payload.student_name,
        studentPhone: payload.student_phone,
        studentDanceStyle: payload.student_dance_style,
        studentLevel: payload.student_level,
        professorEmail: professorUser.data.user?.email,
        professorName: professor?.name ?? "Profesor",
        date: format(
          parseISO(`${payload.date}T00:00:00`),
          "EEEE, d 'de' MMMM 'de' yyyy",
          { locale: es },
        ),
        startTime: normalizeTime(payload.start_time),
        endTime: normalizeTime(payload.end_time),
        notes: payload.notes || undefined,
      });
    } catch (error) {
      emailError = error instanceof Error ? error.message : "No se pudo enviar el email.";
      console.error("Booking email error:", error);
    }

    const publicSlug = (await getSingleProfessorProfile()).slug;
    revalidatePath("/");
    revalidatePath(`/book/${publicSlug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");

    return NextResponse.json({ bookingId: booking.id, emailError });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await getSingleProfessorProfile();
    const supabase = createAdminClient();
    const body = await request.json();
    const parsed = cancelBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "ID de reserva no valido." }, { status: 400 });
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", parsed.data.bookingId)
      .eq("professor_id", profile.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath(`/book/${profile.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado." },
      { status: 500 },
    );
  }
}
