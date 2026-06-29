import { supabase } from "../../../lib/supabase";
import { embed } from "../../../lib/openai";
import pdf from "pdf-parse";

function chunk(text, size = 1200) {
  const out = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");
  const context = form.get("context");

  if (context) {
    await supabase.from("contexts").insert({ text: context });
    const chunks = chunk(context);
    for (const c of chunks) {
      const embedding = await embed(c);
      await supabase.from("documents").insert({ content: c, embedding, source: "contexto-manual" });
    }
  }

  if (file && file.name) {
    const buf = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buf);
    const chunks = chunk(data.text);
    for (const c of chunks) {
      const embedding = await embed(c);
      await supabase.from("documents").insert({ content: c, embedding, source: file.name });
    }
  }

  return Response.json({ ok: true });
}
