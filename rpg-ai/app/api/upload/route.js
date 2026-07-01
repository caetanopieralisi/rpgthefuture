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

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const context = form.get("context");
    const BATCH = 35;

    // --- Contexto manual (não precisa de offset) ---
    if (context && context.trim().length > 10) {
      const source = "contexto-" + Date.now();
      const chunks = chunk(context);
      let indexed = 0;
      for (const c of chunks.slice(0, BATCH)) {
        try {
          const embedding = await embed(c);
          const { error } = await supabase.from("documents").insert({ content: c, embedding, source });
          if (!error) indexed++;
        } catch (e) { console.error(e.message); }
      }
      return Response.json({ ok: true, indexed, total: chunks.length, done: chunks.length <= BATCH, source: "Contexto manual" });
    }

    // --- PDF com offset automático ---
    if (!file || !file.name) {
      return Response.json({ ok: false, error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buf);
    if (!data.text || data.text.trim().length < 10) {
      return Response.json({ ok: false, error: "PDF sem texto extraível (escaneado/imagem)" }, { status: 400 });
    }

    const chunks = chunk(data.text);
    const source = file.name;

    // Descobre quantos chunks já foram indexados para este arquivo
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("source", source);

    const offset = count || 0;
    const batch = chunks.slice(offset, offset + BATCH);

    if (batch.length === 0) {
      return Response.json({ ok: true, indexed: 0, total: chunks.length, offset, done: true, source });
    }

    let indexed = 0;
    for (const c of batch) {
      try {
        const embedding = await embed(c);
        const { error } = await supabase.from("documents").insert({ content: c, embedding, source });
        if (!error) indexed++;
      } catch (e) { console.error("chunk error:", e.message); }
    }

    const newOffset = offset + indexed;
    const done = newOffset >= chunks.length;

    return Response.json({ ok: true, indexed, total: chunks.length, offset: newOffset, done, source });
  } catch (e) {
    console.error("upload error:", e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
