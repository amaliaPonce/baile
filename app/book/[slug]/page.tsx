import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import BookingForm from "@/components/BookingForm";
import { generateAvailableSlots } from "@/lib/slots";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PublicBookingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { date?: string; start?: string; end?: string };
}) {
  noStore();

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!profile) {
    notFound();
  }

  const slots = await generateAvailableSlots(profile.id);

  return (
    <main className="min-h-screen bg-[#f5f2ed] text-[#141415]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 bg-[#141415] px-[5%] py-5 text-[#f5f2ed]">
        <a href="/" aria-label="Volver a la web de Pablo" className="text-[34px] font-black leading-none tracking-[-0.09em]">PC<span className="text-[#b8a6c9]">F.</span></a>
        <nav aria-label="Navegación" className="flex flex-wrap items-center gap-5 text-sm"><a href="/#sobre-mi">Pablo</a><a href="/#videos">Vídeos</a><a href="https://www.instagram.com/pablocf_dancer/" target="_blank" rel="noopener noreferrer" className="hidden sm:inline">@pablocf_dancer ↗</a><a href="/" className="border border-white/40 px-4 py-2">Volver ↗</a></nav>
      </header>
      <div className="mx-auto grid max-w-[1440px] items-start gap-10 px-[5%] py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-20">
        <section className="min-w-0 lg:sticky lg:top-8">
          <p className="text-xs font-semibold tracking-[0.18em]">PCF / CLASES PARTICULARES</p>
          <h1 className="mt-6 text-[clamp(3rem,7vw,7rem)] font-bold leading-[0.93] tracking-[-0.075em] [font-family:var(--font-space-grotesk)]">¿Bailamos<span className="text-[#78668d]">?</span></h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed">{profile.bio || "Reserva una clase particular conmigo. Elige un horario, cuéntame qué quieres trabajar y nos vemos en la pista."}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[#141415]/20 py-5 text-sm">
            <div><p className="text-xs uppercase tracking-widest text-[#68636b]">Profesor</p><p className="mt-2 font-semibold">{profile.name}</p></div>
            {profile.session_duration_minutes ? <div><p className="text-xs uppercase tracking-widest text-[#68636b]">Duración</p><p className="mt-2 font-semibold">{profile.session_duration_minutes} min</p></div> : null}
          </div>
          <div className="mt-8 aspect-[4/3] overflow-hidden bg-[#242328]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://drive.google.com/thumbnail?id=1DIVT-RyAHihS1bm8aA2addoUDIdfYCE4&sz=w1200" alt="Fotograma del portfolio de Pablo" className="h-full w-full object-cover object-center"/>
          </div>
          <a href="https://www.instagram.com/pablocf_dancer/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block border-b border-[#141415] pb-1 text-sm">¿Tienes dudas? Escríbeme por Instagram ↗</a>
        </section>
        <section className="min-w-0">
          {slots.length > 0 ? (
            <BookingForm professorId={profile.id} professorName={profile.name} slots={slots} initialDate={searchParams.date} initialStartTime={searchParams.start} initialEndTime={searchParams.end}/>
          ) : (
            <div className="border border-[#d7d1cc] bg-white p-8"><h2 className="text-2xl font-semibold">No hay horarios disponibles</h2><p className="mt-3 text-sm text-[#68636b]">Consulta más adelante o contacta conmigo por Instagram.</p></div>
          )}
        </section>
      </div>
      <footer className="flex flex-wrap justify-between gap-4 bg-[#141415] px-[5%] py-6 text-sm text-[#f5f2ed]"><a href="/">PCF. / Volver al portfolio ↑</a><a href="https://www.instagram.com/pablocf_dancer/" target="_blank" rel="noopener noreferrer">@pablocf_dancer ↗</a></footer>
    </main>
  );
}
