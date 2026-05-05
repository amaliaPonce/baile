import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSingleProfessorProfile } from "@/lib/professor";
import { createClient } from "@/lib/supabase/server";
import { availabilityPayloadSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const professorId = request.nextUrl.searchParams.get("professorId");

  if (!professorId) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("professor_id", professorId)
    .eq("is_active", true)
    .order("day_of_week");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const profile = await getSingleProfessorProfile();
    const supabase = createAdminClient();
    const body = await request.json();
    const parsed = availabilityPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos no validos." },
        { status: 400 },
      );
    }

    const activeSlots = parsed.data.slots.filter((slot) => slot.is_active);

    const { error: deleteError } = await supabase
      .from("availability_slots")
      .delete()
      .eq("professor_id", profile.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (activeSlots.length > 0) {
      const { error: insertError } = await supabase
        .from("availability_slots")
        .insert(
          activeSlots.map((slot) => ({
            professor_id: profile.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true,
          })),
        );

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        session_duration_minutes: parsed.data.session_duration_minutes,
      })
      .eq("id", profile.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath(`/book/${profile.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/availability");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const profile = await getSingleProfessorProfile();
  const supabase = createAdminClient();
  const slotId = request.nextUrl.searchParams.get("id");

  if (!slotId) {
    return NextResponse.json({ error: "Falta el id de la franja." }, { status: 400 });
  }

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("professor_id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath(`/book/${profile.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/availability");

  return NextResponse.json({ success: true });
}
