import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("feedback");
  if (req.method === "GET") {
    const key = new URL(req.url).searchParams.get("key");
    if (!key || key !== Netlify.env.get("ADMIN_KEY")) return new Response("forbidden", { status: 403 });
    const { blobs } = await store.list();
    const rows = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    rows.sort((a, b) => (b.t || "").localeCompare(a.t || ""));
    const txt = rows.map((r) => `[${r.t}] ${r.vote === "down" ? "👎" : "👍"}\nQ: ${r.q}\nA: ${r.a}\n메모: ${r.note || "-"}\n내 선수: ${(r.profile || "").replace(/\n/g, " / ")}\n`).join("\n----\n");
    return new Response(txt || "아직 피드백이 없어요.", { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  let b;
  try { b = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const rec = { t: new Date().toISOString(), vote: b.vote === "down" ? "down" : "up", q: String(b.q || "").slice(0, 500), a: String(b.a || "").slice(0, 3000), note: String(b.note || "").slice(0, 500), profile: String(b.profile || "").slice(0, 600) };
  try { await store.setJSON(`${rec.t}-${Math.random().toString(36).slice(2, 6)}`, rec); } catch { return Response.json({ ok: false }, { status: 500 }); }
  return Response.json({ ok: true });
};
