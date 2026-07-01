import { supabase } from "../../../lib/supabase";
import { openai, embed } from "../../../lib/openai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { question, history = [] } = await req.json();
    if (!question || !question.trim()) {
      return Response.json({ error: "Pergunta vazia" }, { status: 400 });
    }

    let contextText = "";
    try {
      const queryEmbedding = await embed(question);
      const { data: matches, error } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbedding,
        match_count: 8
      });
      if (error) console.error("match_documents error:", error.message);
      if (matches?.length > 0) {
        contextText = matches.map(m => `[${m.source}]\n${m.content}`).join("\n\n---\n\n");
      }
    } catch (e) {
      console.error("Embedding/match falhou:", e.message);
    }

    const { data: config } = await supabase
      .from("agent_config").select("system_prompt").eq("id", 1).maybeSingle();

    const systemPrompt = config?.system_prompt || "Você é o assistente do RPG. Responda baseado nos materiais do jogo.";
    const systemContent = contextText
      ? `${systemPrompt}\n\nMATERIAIS DO JOGO:\n\n${contextText}`
      : `${systemPrompt}\n\n(Nenhum material indexado ainda.)`;

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
      hadContext: !!contextText
    });
  } catch (e) {
    console.error("Erro no /api/chat:", e);
    return Response.json({ error: "Erro: " + (e.message || "falha desconhecida. Confira a OPENAI_API_KEY nas variáveis de ambiente.") }, { status: 500 });
  }
}
