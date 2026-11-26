// Public portfolio media only. No credentials are used or sharing permissions changed.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const videos: readonly string[] = ["14qc0wdvqZ4t-GgwWlaRguKq2W7gyPzKC","1XKph8lsvp3dW5mAWImmdXv372LGK_NTw","1-QMtnvmO1NQ1oe2TWZ_NL6AR4aFfW2Uw","1eKoN7OoVxykdUPRXgi99wVkRscjJsWqQ","19v4Z__ZQE3S2xTcTWAZr8V9_xLwZLl7H","1VaalPIYesqSHXvHxXaadEm7KjtGT97KI","1twx-chUXdJCEVHXbu_JV-u4XeT0DDh9j","1_8iLVf060PW6QsOXIwWMrsuns-qd9hh6","1_1oUBDfV2fe4Dz8eqaNGjKCWO6UxW-G7","1L2k2wO-j1r2mAGCohEKF_rGv6r5TD1bG","1DIVT-RyAHihS1bm8aA2addoUDIdfYCE4","1SM0k8485UhhreaqCej7h9GrZ1_tBvzTp","1Oh4UeRRyWU_2OXA77s2Pvl7I45B9nSFW"];

export async function GET(request: Request, { params }: { params: { index: string } }) {
  if (!/^\d+$/.test(params.index)) return new Response(null, { status: 404 });
  const index = Number(params.index);
  const id = videos[index];
  if (!id) return new Response(null, { status: 404 });
  const range = request.headers.get("range");
  if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return new Response(null, { status: 416 });

  const url = new URL("https://drive.usercontent.google.com/download");
  url.searchParams.set("id", id);
  url.searchParams.set("export", "download");
  url.searchParams.set("confirm", "t");

  try {
    const upstream = await fetch(url, {
      headers: range ? { Range: range } : {},
      redirect: "follow",
      cache: "no-store",
      signal: request.signal,
    });
    if (upstream.status === 416) {
      const contentRange = upstream.headers.get("content-range");
      await upstream.body?.cancel();
      return new Response(null, { status: 416, headers: contentRange ? { "Content-Range": contentRange } : {} });
    }
    const type = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !upstream.body || (!type.startsWith("video/") && !type.includes("octet-stream"))) {
      await upstream.body?.cancel();
      return new Response("Vídeo no disponible", { status: 502 });
    }
    const headers = new Headers({
      "Content-Type": type.startsWith("video/") ? type : index === 0 ? "video/quicktime" : "video/mp4",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    });
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Vídeo no disponible", { status: 502 });
  }
}
