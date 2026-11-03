-- 팀 비밀번호로 들어오기 (링크 + 비밀번호)
-- 비밀번호 자체는 저장하지 않고, 암호화한 값(sha256)만 저장해요.
-- 비밀번호를 바꿀 때는 맨 아래 update 문만 다시 실행하면 돼요.

create table if not exists public.board_secret (
  id int primary key default 1 check (id = 1),
  key_hash text not null
);
alter table public.board_secret enable row level security;  -- 정책 없음 = 브라우저에서 직접 못 읽음

create or replace function public.has_board_key()
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from public.board_secret
    -- 화면에서 비밀번호를 sha256으로 바꿔 x-board-key 헤더로 보내요 (한글 비밀번호도 가능)
    where key_hash = lower(coalesce(current_setting('request.headers', true)::json ->> 'x-board-key', ''))
  );
$$;

create or replace function public.can_board()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_member() or public.has_board_key();
$$;
grant execute on function public.has_board_key() to anon, authenticated;
grant execute on function public.can_board() to anon, authenticated;
grant select, insert, update, delete on public.board_docs to anon, authenticated;

drop policy if exists "members read"   on public.board_docs;
drop policy if exists "members insert" on public.board_docs;
drop policy if exists "members update" on public.board_docs;
drop policy if exists "members delete" on public.board_docs;
create policy "members read"   on public.board_docs for select to anon, authenticated using (public.can_board());
create policy "members insert" on public.board_docs for insert to anon, authenticated with check (public.can_board());
create policy "members update" on public.board_docs for update to anon, authenticated using (public.can_board()) with check (public.can_board());
create policy "members delete" on public.board_docs for delete to anon, authenticated using (public.can_board());

-- ▼ 팀 비밀번호 저장 · 변경 (이 블록만 따로 실행해도 돼요)
do $$
declare
  pw text := '여기에-팀-비밀번호';   -- ◀◀ 이 줄의 작은따옴표 안 글자만 지우고 비밀번호를 쓰세요
begin
  if md5(pw) = '56362bc41fb533c2e5328a32a6ba0b61' or length(pw) < 8 then
    raise exception '비밀번호를 아직 안 바꿨거나 8자보다 짧아요. 3번째 줄을 고친 뒤 다시 Run 해 주세요.';
  end if;
  insert into public.board_secret (id, key_hash)
  values (1, encode(extensions.digest(pw, 'sha256'), 'hex'))
  on conflict (id) do update set key_hash = excluded.key_hash;
end $$;
