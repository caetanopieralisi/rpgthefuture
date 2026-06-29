-- Rode isso no SQL Editor do Supabase
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
  created_at timestamptz default now()
);

create or replace function match_documents(query_embedding vector(1536), match_count int)
returns table (content text, source text, similarity float)
language sql stable as $$
  select content, source, 1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
