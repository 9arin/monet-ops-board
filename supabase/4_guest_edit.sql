-- 손님: 그래픽 내용 고치기 + 시안 파일 올리기 (위치 이동·삭제·다른 자료는 불가)
-- 손님 비밀번호는 보드에서 못 바꾸고, Supabase(5_guest_password.sql)에서만 바꿔요.

revoke execute on function public.set_guest_key(text) from anon, authenticated;
drop function if exists public.set_guest_key(text);
drop function if exists public.guest_on();

-- 그래픽(g-) 고치기, 그래픽에 붙은 파일만 덮어쓰기
drop policy if exists "guest update" on public.board_docs;
create policy "guest update" on public.board_docs for update to anon, authenticated
  using (public.guest_can_read(col, id)) with check (public.guest_can_read(col, id));

-- 새 시안 파일(f-) 올리기 + 그래픽 저장(upsert는 insert 검사도 거쳐요)
drop policy if exists "guest insert" on public.board_docs;
create policy "guest insert" on public.board_docs for insert to anon, authenticated
  with check (public.has_guest_key() and ((col = 'items' and id like 'f-%') or (col = 'markers' and id like 'g-%')));
