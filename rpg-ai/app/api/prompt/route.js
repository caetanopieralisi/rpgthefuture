import { supabase } from "../../../lib/supabase";

export async function GET() {
  const { data } = await supabase.from("agent_config").select("system_prompt").eq("id", 1).single();
  return Response.json({ prompt: data?.system_prompt || "" });
}

export async function POST(req) {
  const { prompt } = await req.json();
  await supabase.from("agent_config").upsert({ id: 1, system_prompt: prompt, updated_at: new Date().toISOString() });
  return Response.json({ ok: true });
}
