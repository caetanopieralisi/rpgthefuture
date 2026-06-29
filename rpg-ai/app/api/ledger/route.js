import { supabase } from "../../../lib/supabase";

// GET ?player=NOME&pin=1234  -> extrato
// POST { name, pin, amount, description } -> nova transacao (e cria jogador se nao existir, quando amount=0 e sem pin cadastrado)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("player");
  const pin = searchParams.get("pin");

  const { data: player } = await supabase.from("players").select("*").eq("name", name).single();
  if (!player || player.pin !== pin) return Response.json({ error: "Jogador ou PIN inválido" }, { status: 401 });

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("player_id", player.id)
    .order("created_at", { ascending: false });

  return Response.json({ player, transactions });
}

export async function POST(req) {
  const { name, pin, amount, description } = await req.json();

  let { data: player } = await supabase.from("players").select("*").eq("name", name).single();

  if (!player) {
    const { data: newPlayer } = await supabase
      .from("players")
      .insert({ name, pin, balance: 0 })
      .select()
      .single();
    player = newPlayer;
  } else if (player.pin !== pin) {
    return Response.json({ error: "PIN inválido para este jogador" }, { status: 401 });
  }

  const newBalance = Number(player.balance) + Number(amount);
  await supabase.from("players").update({ balance: newBalance }).eq("id", player.id);
  await supabase.from("transactions").insert({ player_id: player.id, amount, description });

  return Response.json({ ok: true, balance: newBalance });
}
