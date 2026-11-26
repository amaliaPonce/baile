// The approved editorial portrait is public in the portfolio's media folder.
export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  const url = "https://drive.usercontent.google.com/download?id=1AHwm54JqU7X4d-hWYUADCGAhSlAjt16Z&export=download&confirm=t";
  try {
    const upstream = await fetch(url, { redirect: "follow", next: { revalidate: 86400 } });
    const type = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !upstream.body || (!type.startsWith("image/png") && !type.includes("octet-stream"))) {
      await upstream.body?.cancel();
      return new Response(null, { status: 502 });
    }
    const bytes = await upstream.arrayBuffer();
    const magic = new Uint8Array(bytes.slice(0, 8));
    if (magic.join(",") !== "137,80,78,71,13,10,26,10") return new Response(null, { status: 502 });
    return new Response(bytes, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response(null, { status: 502 });
  }
}
