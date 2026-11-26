import { redirect } from "next/navigation";
import SetupNotice from "@/components/SetupNotice";
import { getMissingSetupEnv, hasPublicSupabaseEnv } from "@/lib/env";
import { getSingleProfessorProfile } from "@/lib/professor";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  if (!hasPublicSupabaseEnv()) {
    return <SetupNotice missing={getMissingSetupEnv()} />;
  }
  const profile = await getSingleProfessorProfile();
  redirect(`/book/${profile.slug}`);
}
