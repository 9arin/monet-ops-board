# MONET 100 운영 보드

3·4층 배치도, 인력, 물품, 할 일을 한 화면에서 관리하는 웹 페이지예요.
- 주소: https://9arin.github.io/monet-ops-board/
- 화면은 GitHub Pages에서 열리고, 데이터는 Supabase(`monet100` 프로젝트)에 저장돼요.
- 링크를 연 뒤 **팀 비밀번호**를 넣으면 보고 고칠 수 있어요. 한 번 넣으면 그 기기에서는 다음부터 자동으로 들어와요.
- 관리자는 "관리자 이메일 로그인"으로도 들어올 수 있어요.

## 폴더 구성
| 파일 | 내용 |
|---|---|
| `index.html` | 보드 화면 전체 (디자인과 동작) |
| `config.js` | Supabase 주소와 공개 키 |
| `img/4F.jpg`, `img/3F.jpg` | 층별 도면 |
| `supabase/1_setup.sql` | 테이블, 보안 규칙, 관리자 이메일 목록 (2026-11-03 실행 완료) |
| `supabase/2_team_key.sql` | 팀 비밀번호 방식 (2026-11-03 실행 완료) |

## 팀 비밀번호 바꾸기
알바가 그만두거나 비밀번호가 새면 바꿔요. Supabase → SQL Editor에서 `supabase/2_team_key.sql` 맨 아래 블록(`do $$ … end $$;`)을 붙여넣고, `pw text :=` 줄의 작은따옴표 안 글자만 새 비밀번호로 바꿔 Run 해요. 안 바꾸고 실행하면 오류가 나서 저장되지 않아요.
바꾸면 기존 비밀번호로 들어와 있던 기기는 저장이 막혀요. 새 비밀번호로 다시 들어오면 돼요.

## 관리자 이메일 추가 · 삭제
Supabase → SQL Editor에서 실행해요.
```sql
insert into public.board_members (email) values ('someone@example.com');
delete from public.board_members where email = 'someone@example.com';
```


## 클로드 코드로 고치기
```bash
git clone https://github.com/9arin/monet-ops-board.git
cd monet-ops-board
claude
```
- **고치기:** "물품 탭에 업체 연락처 칸 추가해줘"처럼 말해요.
- **미리보기:** `python3 -m http.server 8000` 실행 후 http://localhost:8000 을 열어요. 로그인하려면 Supabase → Authentication → URL Configuration의 Redirect URLs에 `http://localhost:8000/` 도 추가해야 해요.
- **반영하기:** "커밋하고 푸시해줘"라고 하면 1~2분 뒤 사이트에 반영돼요.

## 보안 메모
- 이 저장소와 사이트 주소는 공개예요. 데이터(이름, 배치, 물품, 할 일)는 Supabase에 있고, 팀 비밀번호나 관리자 로그인이 있어야만 보여요.
- 팀 비밀번호 방식은 10초마다 새로 불러와요. 관리자 이메일 로그인은 실시간으로 반영돼요.
- 도면 이미지(`img/`)는 공개 파일이에요. 숨겨야 한다면 클로드 코드에 "도면도 로그인 뒤에만 보이게 Supabase Storage로 옮겨줘"라고 요청해요.
- `config.js`에는 공개 키(`sb_publishable_…`)만 넣어요. secret 키는 어디에도 올리지 않아요.
- 직원 이름이나 연락처 같은 데이터를 이 저장소 파일에 직접 적지 않아요.
