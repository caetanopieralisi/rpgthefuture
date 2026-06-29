# RPG AI — passo a passo (100% grátis)

## 1. Banco de dados (Supabase — grátis)
1. Crie conta em supabase.com → "New project".
2. Vá em "SQL Editor" → cole o conteúdo de `supabase_schema.sql` → Run.
3. Em "Project Settings > API", copie:
   - `Project URL` → vira `SUPABASE_URL`
   - `service_role key` → vira `SUPABASE_SERVICE_KEY`

## 2. Chave da OpenAI
Crie em platform.openai.com/api-keys → vira `OPENAI_API_KEY`.

## 3. Subir o site (Vercel — grátis)
1. Crie conta em vercel.com (login com GitHub).
2. Suba esta pasta para um repositório no GitHub (ou use `vercel` CLI: `npx vercel`).
3. Em "Import Project" na Vercel, selecione o repo.
4. Em "Environment Variables", adicione:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - OPENAI_API_KEY
5. Deploy. Pronto — link público e gratuito.

## Uso
- `/admin` → sobe PDFs e cola contexto da campanha (vira a "memória" da IA).
- `/` → chat: qualquer pessoa pergunta, IA responde só com base nos PDFs/contexto.
- `/player` → cada jogador cria nome+PIN e vê/lança seu próprio extrato (banco individual).

## Observações
- Tudo no plano free do Supabase (500MB, dura indefinidamente) e Vercel (hobby).
- Sem custos, exceto o uso da sua chave OpenAI (gpt-4o-mini é bem barato, embeddings também).
- PIN não é criptografado — é simples de propósito para mesa de RPG. Se quiser mais segurança, eu adiciono hash.
