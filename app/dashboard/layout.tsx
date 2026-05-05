import Navbar from "@/components/Navbar";
import { getSingleProfessorProfile } from "@/lib/professor";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getSingleProfessorProfile();

  return (
    <div className="min-h-screen">
      <Navbar name={profile.name ?? "Profesor"} publicSlug={profile.slug} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
