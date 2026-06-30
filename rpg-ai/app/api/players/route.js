import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: players, error } = await supabase
    .from("players").select("id, name, balance, created_at").order("name");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ players: players || [] });
}

// Admin: lançar transação em qualquer jogador
export async function POST(req) {
  const { player_id, amount, description } = await req.json();
  const { data: player } = await supabase
    .from("players").select("balance").eq("id", player_id).single();
  if (!player) return Response.json({ error: "Jogador não encontrado" }, { status: 404 });

  const newBalance = Number(player.balance) + Number(amount);
  await supabase.from("players").update({ balance: newBalance }).eq("id", player_id);
  await supabase.from("transactions").insert({
    player_id, amount: Number(amount), description: description || "Lançamento admin"
  });
  return Response.json({ ok: true, balance: newBalance });
}
