# CLAUDE.md — MONET 100 운영 보드

Static single-page app served by GitHub Pages from a PUBLIC repo (no build step). Live: https://9arin.github.io/monet-ops-board/. User is a non-developer exhibition ops manager; reply in Korean, plain words.

## Structure
- `index.html`: all CSS + JS inline. Key parts in the script:
  - `TYPES` (marker types, colors match whiteboard pens), `GROUPS` (staff slots: rec-am, rec-pm, s2, s3, s4, s5, s8, s6a, s6b), `DAYS`.
  - `state` = {markers, items, staff, tasks}; `ui` = view state (some persisted in localStorage `mb-*`).
  - `save(col,obj)` / `remove(col,id)`: optimistic local update, then Supabase upsert/delete.
  - Boot section "boot (Supabase)": two ways in — team password (sent as `x-board-key` header, sha256 of the password sent as header, hash stored in localStorage `mb-teamkey-h`, 10s polling) or admin magic-link (realtime channel). `can_board()` RPC checks access.
  - `coverage()` computes per-day slot coverage (main / cover / ②③ merge / gap).
  - `render()` dispatches per tab; `mapCard()` draws mini floor plans; marker x/y are % of the plan image.
- `config.js`: `window.BOARD_CONFIG = {SUPABASE_URL, SUPABASE_KEY}` (publishable key only — never a secret/service_role key).
- `img/4F.jpg`, `img/3F.jpg`: floor plans (1600×1075).
- `supabase/1_setup.sql`: table `board_docs(col, id, data jsonb)`, `board_members` allowlist, `is_member()`, RLS, realtime. Already applied.
- `supabase/2_team_key.sql`: `board_secret` (sha256 of team password), `has_board_key()`, `can_board()`, policies for anon+authenticated. Already applied.

## Data model
One row per document: `col` ∈ markers | items | staff | tasks, `id` (e.g. `m-…`, `i-…`, `p-R1`, `t-…`), `data` jsonb with the fields the UI uses. Adding a field needs no SQL change. Adding a new collection: add to `COLS` and to the `check` constraint (give the user the `alter table` statement to run in Supabase SQL Editor).

## Rules
- Repo is public: never commit staff names, emails, pay data, or the database contents.
- Keep light/dark theme tokens on `:root` (both dark blocks) — no literal colors in components.
- Must work at phone width (~400px).
- Test locally: `python3 -m http.server 8000`.
- Commit with a short Korean message; push to `main` only when the user asks.
