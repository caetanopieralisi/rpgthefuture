import { supabase } from "../../../lib/supabase";
import { openai, embed } from "../../../lib/openai";

export async function POST(req) {
  const { question } = await req.json();
  const queryEmbedding = await embed(question);

  const { data: matches } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: 6
  });

  const context = (matches || []).map(m => m.content).join("\n---\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é o mestre/assistente do RPG. Responda SOMENTE com base no contexto abaixo, extraído dos arquivos e anotações do jogo. Se não souber, diga que não está nos materiais.\n\nCONTEXTO:\n${context}`
      },
      { role: "user", content: question }
    ]
  });

  return Response.json({ answer: completion.choices[0].message.content });
}
