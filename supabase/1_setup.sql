-- MONET 100 운영 보드: 테이블 + 보안 규칙 + 실시간
-- Supabase 대시보드 → SQL Editor → New query 에 붙여넣고 Run

create table if not exists public.board_docs (
  col text not null check (col in ('markers','items','staff','tasks')),
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

-- 보드를 보고 고칠 수 있는 팀원 이메일 목록
create table if not exists public.board_members (
  email text primary key
);
alter table public.board_members enable row level security;  -- 정책 없음 = 브라우저에서 직접 못 읽음

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.board_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_member() to authenticated;

alter table public.board_docs enable row level security;
drop policy if exists "members read"   on public.board_docs;
drop policy if exists "members insert" on public.board_docs;
drop policy if exists "members update" on public.board_docs;
drop policy if exists "members delete" on public.board_docs;
create policy "members read"   on public.board_docs for select to authenticated using (public.is_member());
create policy "members insert" on public.board_docs for insert to authenticated with check (public.is_member());
create policy "members update" on public.board_docs for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "members delete" on public.board_docs for delete to authenticated using (public.is_member());

-- 실시간 반영
do $$ begin
  alter publication supabase_realtime add table public.board_docs;
exception when duplicate_object then null; end $$;

-- 팀원 등록 (이메일을 바꾸거나 줄을 추가하세요)
insert into public.board_members (email) values
  ('you@example.com')  -- 실제 팀원 이메일은 Supabase에서 직접 추가 (이미 등록됨)
on conflict do nothing;
