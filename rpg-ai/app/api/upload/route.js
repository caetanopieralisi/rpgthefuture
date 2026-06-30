import { supabase } from "../../../lib/supabase";
import { embed } from "../../../lib/openai";
import pdf from "pdf-parse/lib/pdf-parse.js";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function chunk(text, size = 1000) {
  const chunks = [];
  // limpa texto e quebra em blocos com overlap
  const clean = text.replace(/\s+/g, " ").trim();
  for (let i = 0; i < clean.length; i += size) {
    const c = clean.slice(i, i + size);
    if (c.trim().length > 50) chunks.push(c);
  }
  return chunks;
}

async function indexChunks(chunks, source) {
  let indexed = 0;
  for (const c of chunks) {
    try {
      const embedding = await embed(c);
      const { error } = await supabase.from("documents").insert({
        content: c,
        embedding: JSON.stringify(embedding),
        source
      });
      if (!error) indexed++;
    } catch (e) {
      console.error("Chunk error:", e.message);
    }
  }
  return indexed;
}

export async function POST(req) {
  const form = await req.formData();
  const files = form.getAll("files");
  const context = form.get("context");
  const results = [];

  if (context && context.trim().length > 10) {
    const source = "contexto-" + Date.now();
    const chunks = chunk(context);
    const indexed = await indexChunks(chunks, source);
    results.push({ source: "Contexto manual", chunks: chunks.length, indexed, ok: indexed > 0 });
  }

  for (const file of files) {
    if (!file || !file.name) continue;
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const data = await pdf(buf);
      if (!data.text || data.text.trim().length < 10) {
        results.push({ source: file.name, ok: false, error: "PDF sem texto extraível (pode ser imagem)" });
        continue;
      }
      const chunks = chunk(data.text);
      const indexed = await indexChunks(chunks, file.name);
      results.push({ source: file.name, chunks: chunks.length, indexed, ok: indexed > 0 });
    } catch (e) {
      results.push({ source: file.name, ok: false, error: e.message });
    }
  }

  return Response.json({ ok: true, results });
}
