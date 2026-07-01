import { supabase } from "../../../lib/supabase";

export async function GET() {
  const { data } = await supabase.from("documents").select("source, created_at").order("created_at", { ascending: false });
  const map = {};
  for (const d of data || []) {
    if (!map[d.source]) map[d.source] = { source: d.source, chunks: 0, created_at: d.created_at };
    map[d.source].chunks++;
  }
  return Response.json({ files: Object.values(map) });
}

export async function DELETE(req) {
  const { source } = await req.json();
  await supabase.from("documents").delete().eq("source", source);
  return Response.json({ ok: true });
}
