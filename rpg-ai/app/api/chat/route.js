import { supabase } from "../../../lib/supabase";
import { openai, embed } from "../../../lib/openai";

export async function POST(req) {
  const { question, history = [] } = await req.json();
  const queryEmbedding = await embed(question);

  const [{ data: matches }, { data: config }] = await Promise.all([
    supabase.rpc("match_documents", { query_embedding: queryEmbedding, match_count: 6 }),
    supabase.from("agent_config").select("system_prompt").eq("id", 1).single()
  ]);

  const context = (matches || []).map(m => m.content).join("\n---\n");
  const basePrompt = config?.system_prompt || "Você é o mestre do RPG.";

  const messages = [
    ...history.slice(-10),
    { role: "user", content: question }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `${basePrompt}\n\nCONTEXTO DOS MATERIAIS:\n${context || "Nenhum material indexado ainda."}` },
      ...messages
    ]
  });

  return Response.json({ answer: completion.choices[0].message.content });
}
