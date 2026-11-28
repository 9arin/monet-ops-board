-- 출퇴근 (현장 태블릿 + 관리자 화면)
-- 표는 브라우저에서 직접 못 읽어요 (정책 없음). 아래 함수로만 읽고 써요.
-- 관리자 비밀번호는 7_attendance_admin_password.sql 로 따로 정해요.

create table if not exists public.att_admin (id int primary key default 1 check (id = 1), key_hash text not null);
create table if not exists public.att_pin (person_id text primary key, pin_hash text not null, updated_at timestamptz not null default now());
create table if not exists public.att_kiosk (token_hash text primary key, label text, created_at timestamptz not null default now(), last_seen timestamptz);
create table if not exists public.att_log (
  id bigint generated always as identity primary key,
  person_id text not null,
  kind text not null check (kind in ('in','out')),
  at timestamptz not null default now(),
  note text,
  src text not null default 'kiosk',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists att_log_at on public.att_log (at);
create index if not exists att_log_person on public.att_log (person_id, at);
create table if not exists public.att_fail (k text primary key, n int not null default 0, since timestamptz not null default now());

alter table public.att_admin enable row level security;
alter table public.att_pin   enable row level security;
alter table public.att_kiosk enable row level security;
alter table public.att_log   enable row level security;
alter table public.att_fail  enable row level security;
revoke all on public.att_admin, public.att_pin, public.att_kiosk, public.att_log, public.att_fail from anon, authenticated;

-- ── 내부 도우미 (브라우저에서 못 불러요) ──
create or replace function public.att_h(t text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest(coalesce(t, ''), 'sha256'), 'hex');
$$;

-- 틀린 횟수: 10분 안에 8번 틀리면 10분 잠가요
create or replace function public.att_locked(key text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from att_fail f where f.k = key and f.n >= 8 and f.since > now() - interval '10 minutes');
$$;
create or replace function public.att_fail_add(key text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into att_fail (k, n, since) values (key, 1, now())
  on conflict (k) do update set
    n = case when att_fail.since < now() - interval '10 minutes' then 1 else att_fail.n + 1 end,
    since = case when att_fail.since < now() - interval '10 minutes' then now() else att_fail.since end;
end $$;

-- 관리자 확인 (k = 화면에서 sha256 한 관리자 비밀번호)
create or replace function public.att_admin_ok(k text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if att_locked('admin') then return false; end if;
  if exists (select 1 from att_admin where key_hash = lower(coalesce(k, ''))) then
    delete from att_fail where att_fail.k = 'admin';
    return true;
  end if;
  perform att_fail_add('admin');
  return false;
end $$;

create or replace function public.att_kiosk_ok(t text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update att_kiosk set last_seen = now() where token_hash = att_h(t);
  return found;
end $$;

-- 알바 명단 (매니저 빼고): 이름 · 조 · 비밀번호 있는지
create or replace function public.att_people() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', d.id,
    'name', coalesce(nullif(d.data->>'name', ''), '알바 ' || coalesce(nullif(regexp_replace(coalesce(d.data->>'code', ''), '\D', '', 'g'), ''), '?')),
    'roles', coalesce(d.data->'roles', '[]'::jsonb),
    'pin', exists (select 1 from att_pin p where p.person_id = d.id)
  ) order by d.data->>'name'), '[]'::jsonb)
  from board_docs d
  where d.col = 'staff' and d.id like 'p-%' and coalesce(d.data->>'kind', '') <> '관리자';
$$;

-- 그 사람의 오늘(서울) 상태
create or replace function public.att_state(pid text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('kind', l.kind, 'at', l.at) from att_log l
    where l.person_id = pid and (l.at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date
    order by l.at desc limit 1), '{}'::jsonb);
$$;

revoke execute on function public.att_h(text), public.att_locked(text), public.att_fail_add(text), public.att_admin_ok(text),
  public.att_kiosk_ok(text), public.att_people(), public.att_state(text) from public, anon, authenticated;

-- ── 현장 태블릿 ──
-- 태블릿 등록: 관리자 비밀번호로 한 번. token = 태블릿이 만든 긴 무작위 값
create or replace function public.att_kiosk_register(k text, token text, label text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_admin_ok(k) then return jsonb_build_object('error', 'admin'); end if;
  if length(coalesce(token, '')) < 32 then return jsonb_build_object('error', 'token'); end if;
  insert into att_kiosk (token_hash, label, last_seen) values (att_h(token), left(coalesce(label, ''), 40), now())
  on conflict (token_hash) do update set label = excluded.label;
  return jsonb_build_object('ok', true);
end $$;

-- 태블릿 첫 화면: 명단 + 오늘 출근 상태
create or replace function public.att_board(token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare ppl jsonb;
begin
  if not att_kiosk_ok(token) then return jsonb_build_object('error', 'kiosk'); end if;
  select coalesce(jsonb_agg(p || jsonb_build_object('state', att_state(p->>'id'))), '[]'::jsonb) into ppl
  from jsonb_array_elements(att_people()) p;
  return jsonb_build_object('people', ppl, 'now', now());
end $$;

-- 출근 · 퇴근 찍기
create or replace function public.att_punch(token text, pid text, pin text, kind text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare last_today record; last_any record; r record;
begin
  if not att_kiosk_ok(token) then return jsonb_build_object('error', 'kiosk'); end if;
  if kind not in ('in', 'out') then return jsonb_build_object('error', 'kind'); end if;
  if att_locked('pin:' || pid) then return jsonb_build_object('error', 'locked'); end if;
  if not exists (select 1 from att_pin where person_id = pid) then return jsonb_build_object('error', 'nopin'); end if;
  if not exists (select 1 from att_pin where person_id = pid and pin_hash = att_h(pid || ':' || coalesce(pin, ''))) then
    perform att_fail_add('pin:' || pid); return jsonb_build_object('error', 'pin');
  end if;
  delete from att_fail where k = 'pin:' || pid;
  select l.kind, l.at into last_today from att_log l
    where l.person_id = pid and (l.at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date order by l.at desc limit 1;
  select l.kind, l.at into last_any from att_log l where l.person_id = pid and l.at > now() - interval '16 hours' order by l.at desc limit 1;
  if kind = 'in' and last_today.kind = 'in' then return jsonb_build_object('error', 'already_in', 'at', last_today.at); end if;
  if kind = 'out' and coalesce(last_any.kind, '') <> 'in' then return jsonb_build_object('error', 'not_in'); end if;
  insert into att_log (person_id, kind) values (pid, kind) returning * into r;
  return jsonb_build_object('ok', true, 'kind', r.kind, 'at', r.at, 'since', case when kind = 'out' then last_any.at end);
end $$;

-- 내 기록 (최근 62일)
create or replace function public.att_mine(token text, pid text, pin text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_kiosk_ok(token) then return jsonb_build_object('error', 'kiosk'); end if;
  if att_locked('pin:' || pid) then return jsonb_build_object('error', 'locked'); end if;
  if not exists (select 1 from att_pin where person_id = pid and pin_hash = att_h(pid || ':' || coalesce(pin, ''))) then
    perform att_fail_add('pin:' || pid); return jsonb_build_object('error', 'pin');
  end if;
  delete from att_fail where k = 'pin:' || pid;
  return jsonb_build_object('logs', coalesce((select jsonb_agg(jsonb_build_object('kind', l.kind, 'at', l.at, 'note', l.note) order by l.at)
    from att_log l where l.person_id = pid and l.at > now() - interval '62 days'), '[]'::jsonb));
end $$;

-- ── 관리자 ──
create or replace function public.att_admin_check(k text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if att_locked('admin') then return jsonb_build_object('error', 'locked'); end if;
  if not att_admin_ok(k) then return jsonb_build_object('error', 'admin'); end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.att_admin_data(k text, d1 date, d2 date) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_admin_ok(k) then return jsonb_build_object('error', case when att_locked('admin') then 'locked' else 'admin' end); end if;
  return jsonb_build_object(
    'people', att_people(),
    'logs', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'person_id', l.person_id, 'kind', l.kind, 'at', l.at, 'note', l.note, 'src', l.src) order by l.at)
      from att_log l where (l.at at time zone 'Asia/Seoul')::date between d1 and d2), '[]'::jsonb),
    'kiosks', coalesce((select jsonb_agg(jsonb_build_object('id', t.token_hash, 'label', t.label, 'created_at', t.created_at, 'last_seen', t.last_seen) order by t.created_at)
      from att_kiosk t), '[]'::jsonb));
end $$;

-- 기록 고치기 · 더하기 (id 없으면 새로)
create or replace function public.att_admin_put(k text, rid bigint, pid text, kind text, at timestamptz, note text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_admin_ok(k) then return jsonb_build_object('error', 'admin'); end if;
  if kind not in ('in', 'out') or at is null or coalesce(pid, '') = '' then return jsonb_build_object('error', 'bad'); end if;
  if rid is null then
    insert into att_log (person_id, kind, at, note, src) values (pid, kind, at, nullif(note, ''), 'admin');
  else
    update att_log set kind = att_admin_put.kind, at = att_admin_put.at, note = nullif(att_admin_put.note, ''), src = 'admin', updated_at = now() where id = rid;
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.att_admin_del(k text, rid bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_admin_ok(k) then return jsonb_build_object('error', 'admin'); end if;
  delete from att_log where id = rid;
  return jsonb_build_object('ok', true);
end $$;

-- 개인 비밀번호 (숫자 4자리) 정하기 · 지우기 (pin 비우면 지워요)
create or replace function public.att_admin_pin(k text, pid text, pin text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_admin_ok(k) then return jsonb_build_object('error', 'admin'); end if;
  if coalesce(pin, '') = '' then delete from att_pin where person_id = pid; return jsonb_build_object('ok', true); end if;
  if pin !~ '^\d{4}$' then return jsonb_build_object('error', 'format'); end if;
  insert into att_pin (person_id, pin_hash, updated_at) values (pid, att_h(pid || ':' || pin), now())
  on conflict (person_id) do update set pin_hash = excluded.pin_hash, updated_at = now();
  delete from att_fail where att_fail.k = 'pin:' || pid;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.att_admin_kiosk_del(k text, tid text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not att_admin_ok(k) then return jsonb_build_object('error', 'admin'); end if;
  delete from att_kiosk where token_hash = tid;
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.att_kiosk_register(text, text, text), public.att_board(text), public.att_punch(text, text, text, text),
  public.att_mine(text, text, text), public.att_admin_check(text), public.att_admin_data(text, date, date),
  public.att_admin_put(text, bigint, text, text, timestamptz, text), public.att_admin_del(text, bigint),
  public.att_admin_pin(text, text, text), public.att_admin_kiosk_del(text, text) to anon, authenticated;
