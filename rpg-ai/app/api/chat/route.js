import { supabase } from "../../../lib/supabase";
import { openai, embed } from "../../../lib/openai";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { question, history = [] } = await req.json();

  // Busca contexto por similaridade
  let contextText = "";
  try {
    const queryEmbedding = await embed(question);
    const { data: matches, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: 8
    });
    if (!error && matches?.length > 0) {
      contextText = matches.map(m => `[${m.source}]\n${m.content}`).join("\n\n---\n\n");
    }
  } catch (e) {
    console.error("Embedding/match error:", e.message);
  }

  // Busca prompt configurado
  const { data: config } = await supabase
    .from("agent_config").select("system_prompt").eq("id", 1).maybeSingle();

  const systemPrompt = config?.system_prompt || "Você é o assistente do RPG. Responda baseado nos materiais do jogo.";

  const systemContent = contextText
    ? `${systemPrompt}\n\nMATERIAIS DO JOGO (use como base para responder):\n\n${contextText}`
    : `${systemPrompt}\n\n(Nenhum material indexado ainda. Responda com base no seu conhecimento geral sobre RPG.)`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemContent },
      ...history.slice(-8),
      { role: "user", content: question }
    ]
  });

  return Response.json({
    answer: completion.choices[0].message.content,
    sources: contextText ? "Com base nos materiais indexados" : "Sem materiais indexados"
  });
}
