-- 손님 비밀번호: 그래픽만 읽기 (고치기·지우기 불가, 인력·물품·급여는 안 보임)
-- 손님 비밀번호 자체는 여기 없어요. 보드의 그래픽 탭에서 팀원이 정해요 (sha256 값만 저장).

create table if not exists public.board_guest (
  id int primary key default 1 check (id = 1),
  key_hash text not null
);
alter table public.board_guest enable row level security;  -- 정책 없음 = 브라우저에서 직접 못 읽음

create or replace function public.has_guest_key()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.board_guest
    where key_hash = lower(coalesce(current_setting('request.headers', true)::json ->> 'x-guest-key', ''))
  );
$$;

-- 그래픽(g-)과, 그래픽에 올린 파일(f-, 조각 f-…~k 포함)만
create or replace function public.guest_can_read(c text, i text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_guest_key() and (
    (c = 'markers' and i like 'g-%')
    or (c = 'items' and i like 'f-%' and exists (
      select 1 from public.board_docs g
      where g.col = 'markers' and g.id like 'g-%'
        and g.data -> 'files' @> jsonb_build_array(jsonb_build_object('fileId', split_part(i, '~', 1)))))
  );
$$;

-- 팀원만 손님 비밀번호를 정하거나 끌 수 있어요 (빈 값 = 끄기)
create or replace function public.set_guest_key(h text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_board() then raise exception 'no access'; end if;
  if coalesce(h, '') = '' then delete from public.board_guest;
  else insert into public.board_guest (id, key_hash) values (1, lower(h))
       on conflict (id) do update set key_hash = excluded.key_hash;
  end if;
end $$;

create or replace function public.guest_on()
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_board() and exists (select 1 from public.board_guest);
$$;

grant execute on function public.has_guest_key() to anon, authenticated;
grant execute on function public.guest_can_read(text, text) to anon, authenticated;
grant execute on function public.set_guest_key(text) to anon, authenticated;
grant execute on function public.guest_on() to anon, authenticated;

drop policy if exists "guest read" on public.board_docs;
create policy "guest read" on public.board_docs for select to anon, authenticated
  using (public.guest_can_read(col, id));
