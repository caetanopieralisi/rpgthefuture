import { supabase } from "../../../lib/supabase";
import { embed } from "../../../lib/openai";
import pdf from "pdf-parse/lib/pdf-parse.js";

export const maxDuration = 60;

function chunk(text, size = 1200) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

async function indexChunks(chunks, source) {
  for (const c of chunks) {
    if (!c.trim()) continue;
    const embedding = await embed(c);
    await supabase.from("documents").insert({ content: c, embedding, source });
  }
}

export async function POST(req) {
  const form = await req.formData();
  const files = form.getAll("files");
  const context = form.get("context");
  const results = [];

  if (context && context.trim()) {
    const source = "contexto-manual-" + Date.now();
    await indexChunks(chunk(context), source);
    results.push({ source, ok: true });
  }

  for (const file of files) {
    if (!file || !file.name) continue;
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const data = await pdf(buf);
      const chunks = chunk(data.text);
      await indexChunks(chunks, file.name);
      results.push({ source: file.name, chunks: chunks.length, ok: true });
    } catch (e) {
      results.push({ source: file.name, ok: false, error: e.message });
    }
  }

  return Response.json({ ok: true, results });
}
