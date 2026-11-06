-- 손님 비밀번호 바꾸기 (Supabase SQL Editor에서만 가능 → 팀원은 못 바꿔요)
-- 아래 작은따옴표 안 글자만 새 손님 비밀번호로 바꾸고 Run 하세요.
do $$
declare
  pw text := '여기에-손님-비밀번호';
begin
  if pw = '여기에-손님-비밀번호' or length(pw) < 4 then
    raise exception '비밀번호를 아직 안 바꿨거나 너무 짧아요.';
  end if;
  insert into public.board_guest (id, key_hash)
  values (1, encode(extensions.digest(pw, 'sha256'), 'hex'))
  on conflict (id) do update set key_hash = excluded.key_hash;
end $$;

-- 손님 입장을 끄려면 위 대신 이 한 줄만 실행: delete from public.board_guest;
