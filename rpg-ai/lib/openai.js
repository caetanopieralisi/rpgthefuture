import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("ATENÇÃO: OPENAI_API_KEY não configurada nas variáveis de ambiente da Vercel.");
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function embed(text) {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000)
  });
  return r.data[0].embedding;
}
