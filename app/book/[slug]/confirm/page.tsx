import { redirect } from "next/navigation";

export default async function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { date?: string; start?: string; end?: string };
}) {
  const { date, start, end } = searchParams;

  const query = new URLSearchParams();
  if (date) query.set("date", date);
  if (start) query.set("start", start);
  if (end) query.set("end", end);

  redirect(
    query.toString()
      ? `/book/${params.slug}?${query.toString()}`
      : `/book/${params.slug}`,
  );
}
