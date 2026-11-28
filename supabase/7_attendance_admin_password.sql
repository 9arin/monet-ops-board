-- 출퇴근 관리자 비밀번호 정하기 · 바꾸기 (Supabase SQL Editor에서만 → 팀원은 못 바꿔요)
-- 아래 작은따옴표 안 글자만 새 관리자 비밀번호로 바꾸고 Run 하세요.
do $$
declare
  pw text := '여기에-관리자-비밀번호';
begin
  if pw = '여기에-관리자-비밀번호' or length(pw) < 6 then
    raise exception '비밀번호를 아직 안 바꿨거나 6자보다 짧아요.';
  end if;
  -- 화면에서 비밀번호를 sha256 한 값과 같은 값으로 저장해요
  insert into public.att_admin (id, key_hash)
  values (1, encode(extensions.digest(pw, 'sha256'), 'hex'))
  on conflict (id) do update set key_hash = excluded.key_hash;
  delete from public.att_fail where k = 'admin';
end $$;
