import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error("ATENÇÃO: SUPABASE_URL ou SUPABASE_SERVICE_KEY não configuradas nas variáveis de ambiente da Vercel.");
}

export const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "placeholder"
);
