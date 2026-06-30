import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("player");
    const pin = searchParams.get("pin");

    const { data: player, error } = await supabase
      .from("players").select("*").eq("name", name).maybeSingle();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!player) return Response.json({ error: "Personagem não encontrado" }, { status: 404 });
    if (player.pin !== pin) return Response.json({ error: "PIN incorreto" }, { status: 401 });

    const { data: transactions } = await supabase
      .from("transactions").select("*")
      .eq("player_id", player.id)
      .order("created_at", { ascending: false });

    return Response.json({ player, transactions: transactions || [] });
  } catch (e) {
    return Response.json({ error: "Erro no servidor: " + e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, pin, amount, description } = await req.json();
    if (!name || !pin) return Response.json({ error: "Nome e PIN são obrigatórios" }, { status: 400 });

    let { data: player } = await supabase
      .from("players").select("*").eq("name", name).maybeSingle();

    if (!player) {
      const { data: newPlayer, error } = await supabase
        .from("players").insert({ name, pin, balance: 0 }).select().single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      player = newPlayer;
    } else if (player.pin !== pin) {
      return Response.json({ error: "PIN incorreto para este personagem" }, { status: 401 });
    }

    const numAmount = Number(amount) || 0;
    if (numAmount !== 0) {
      const newBalance = Number(player.balance) + numAmount;
      await supabase.from("players").update({ balance: newBalance }).eq("id", player.id);
      await supabase.from("transactions").insert({
        player_id: player.id, amount: numAmount, description: description || "Transação"
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Erro no servidor: " + e.message }, { status: 500 });
  }
}
