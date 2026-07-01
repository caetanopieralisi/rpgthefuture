-- Rode isso no SQL Editor do Supabase (pode rodar novamente, é idempotente)
create extension if not exists vector;

create table if not exists documents (
  id bigserial primary key,
  content text,
  embedding vector(1536),
  source text,
  created_at timestamptz default now()
);

create table if not exists contexts (
  id bigserial primary key,
  text text,
  created_at timestamptz default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  pin text not null,
  balance numeric default 0,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id bigserial primary key,
  player_id uuid references players(id) on delete cascade,
  amount numeric not null,
  description text,
  type text default 'manual',
  created_at timestamptz default now()
);

create table if not exists agent_config (
  id int primary key default 1,
  system_prompt text default 'Você é o assistente e mestre do RPG. Responda SOMENTE com base no contexto fornecido dos arquivos e anotações do jogo. Seja imersivo, use a linguagem do universo do jogo. Se não souber a resposta com base nos materiais, diga claramente.',
  updated_at timestamptz default now()
);

insert into agent_config (id) values (1) on conflict do nothing;

create or replace function match_documents(query_embedding vector(1536), match_count int)
returns table (content text, source text, similarity float)
language sql stable as $$
  select content, source, 1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
