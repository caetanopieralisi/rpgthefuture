import { supabase } from "../../../lib/supabase";

export async function GET() {
  const { data } = await supabase.from("players").select("id, name, balance, created_at").order("name");
  return Response.json({ players: data || [] });
}
