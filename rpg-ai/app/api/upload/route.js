import { supabase } from "../../../lib/supabase";
import { embed } from "../../../lib/openai";
import pdf from "pdf-parse/lib/pdf-parse.js";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function chunk(text, size = 1500) {
  const chunks = [];
  const clean = text.replace(/\s+/g, " ").trim();
  for (let i = 0; i < clean.length; i += size) {
    const c = clean.slice(i, i + size);
    if (c.trim().length > 50) chunks.push(c);
  }
  return chunks;
}

async function indexChunks(chunks, source) {
  let indexed = 0;
  const BATCH = 40; // máximo por invocação (~50s)
  for (let i = 0; i < Math.min(chunks.length, BATCH); i++) {
    try {
      const embedding = await embed(chunks[i]);
      const { error } = await supabase.from("documents").insert({
        content: chunks[i], embedding, source
      });
      if (!error) indexed++;
    } catch (e) {
      console.error("chunk error:", e.message);
    }
  }
  return { indexed, total: chunks.length, truncated: chunks.length > BATCH };
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    const context = form.get("context");
    const results = [];

    if (context && context.trim().length > 10) {
      const source = "contexto-" + Date.now();
      const chunks = chunk(context);
      const { indexed, total, truncated } = await indexChunks(chunks, source);
      results.push({ source: "Contexto manual", chunks: total, indexed, ok: indexed > 0,
        warning: truncated ? `Arquivo grande: indexados ${indexed} de ${total} blocos. Envie de novo para continuar.` : null });
    }

    for (const file of files) {
      if (!file || !file.name) continue;
      try {
        const buf = Buffer.from(await file.arrayBuffer());
        const data = await pdf(buf);
        if (!data.text || data.text.trim().length < 10) {
          results.push({ source: file.name, ok: false, error: "PDF sem texto (escaneado/imagem)" });
          continue;
        }
        const chunks = chunk(data.text);
        const { indexed, total, truncated } = await indexChunks(chunks, file.name);
        results.push({ source: file.name, chunks: total, indexed, ok: indexed > 0,
          warning: truncated ? `Arquivo grande: indexados ${indexed} de ${total} blocos. Envie o mesmo arquivo novamente para continuar do ponto que parou.` : null });
      } catch (e) {
        results.push({ source: file.name, ok: false, error: e.message });
      }
    }

    return Response.json({ ok: true, results });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
