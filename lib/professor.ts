import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type ProfessorProfile = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  session_duration_minutes: number | null;
  created_at: string | null;
};

const PROFESSOR_NAME = "Pablo Cabezuelo Fayos";
const PROFESSOR_SLUG = "pablo-cabezuelo-fayos";
export const PROFESSOR_NOTIFICATION_EMAIL = "pablo4494@gmail.com";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function getSingleProfessorProfile() {
  const supabase = createAdminClient();

  const { data: existingProfiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (existingProfiles && existingProfiles.length > 0) {
    const currentProfile = existingProfiles[0] as ProfessorProfile;

    if (
      currentProfile.name !== PROFESSOR_NAME ||
      currentProfile.slug !== PROFESSOR_SLUG
    ) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ name: PROFESSOR_NAME, slug: PROFESSOR_SLUG })
        .eq("id", currentProfile.id)
        .select("*")
        .single();

      if (updateError || !updatedProfile) {
        throw new Error(
          updateError?.message ?? "No se pudo actualizar el nombre del profesor.",
        );
      }

      return updatedProfile as ProfessorProfile;
    }

    return currentProfile;
  }

  const { data: usersResponse, error: usersError } =
    await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const firstUser = usersResponse.users[0];

  if (!firstUser) {
    throw new Error(
      "No existe ningun usuario en Supabase Auth. Crea uno en Authentication > Users o vuelve a probar el signup una vez.",
    );
  }

  const emailPrefix = firstUser.email?.split("@")[0] ?? "profesor";
  const fallbackName = PROFESSOR_NAME || firstUser.user_metadata?.name || emailPrefix;
  const fallbackSlug = slugify(
    firstUser.user_metadata?.slug || fallbackName || "profesor",
  );

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: firstUser.id,
        name: fallbackName,
        slug: PROFESSOR_SLUG || fallbackSlug || "profesor",
      },
      {
        onConflict: "id",
      },
    )
    .select("*")
    .single();

  if (insertError || !insertedProfile) {
    throw new Error(insertError?.message ?? "No se pudo crear el perfil del profesor.");
  }

  return insertedProfile as ProfessorProfile;
}
