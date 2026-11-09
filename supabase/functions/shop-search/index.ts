// 물품 찾기: 국내 쇼핑몰(쿠팡 · 11번가 · 스마트스토어 등)에서 상품을 찾아 사진 · 가격 · 링크를 돌려줘요.
// (네이버 쇼핑 검색 API는 2026-07-31 종료 → SerpApi 구글 쇼핑 한국 검색 사용)
// 열쇠(API 키)는 Supabase Edge Function Secrets 에만 있어요 (코드 · 보드에는 없음):
//   SERPAPI_KEY                            — serpapi.com (무료 월 250회)
//   COUPANG_ACCESS_KEY, COUPANG_SECRET_KEY — 쿠팡 파트너스 Open API (있을 때만)
// 보드에 들어온 사람만 쓸 수 있어요 (can_board 확인).
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-board-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

type Item = { src: string; id: string; title: string; price: number; image: string; url: string; mall: string; rocket?: boolean; brand?: string; cat?: string };

// SerpApi는 횟수를 세니까 같은 검색은 6시간 동안 기억해 둬요.
const sCache = new Map<string, { t: number; items: Item[] }>();
async function shop(q: string, n: number): Promise<Item[]> {
  const key = Deno.env.get("SERPAPI_KEY");
  if (!key) throw new Error("no-key");
  const hit = sCache.get(q);
  if (hit && Date.now() - hit.t < 6 * 3600_000) return hit.items.slice(0, n);
  const u = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&gl=kr&hl=ko&google_domain=google.co.kr&location=South+Korea&api_key=${key}`;
  const r = await fetch(u);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) {
    if (/hasn't returned any results/i.test(d.error || "")) return [];
    throw new Error("serpapi " + r.status + " " + String(d.error || "").slice(0, 120));
  }
  const items: Item[] = (d.shopping_results || []).map((x: Record<string, unknown>) => ({
    src: "shop", id: String(x.product_id || x.position || ""), title: String(x.title || ""),
    price: Math.round(Number(x.extracted_price) || 0), image: String(x.thumbnail || x.serpapi_thumbnail || ""),
    url: String(x.link || x.product_link || ""), mall: String(x.source || ""),
  })).filter((x: Item) => x.url);
  sCache.set(q, { t: Date.now(), items });
  return items.slice(0, n);
}

// 쿠팡 파트너스는 1시간 호출 횟수 제한이 있어서 같은 검색은 1시간 동안 기억해 둬요.
const cCache = new Map<string, { t: number; items: Item[] }>();
async function hmacHex(key: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function coupang(q: string, n: number): Promise<Item[]> {
  const ak = Deno.env.get("COUPANG_ACCESS_KEY"), sk = Deno.env.get("COUPANG_SECRET_KEY");
  if (!ak || !sk) throw new Error("no-key");
  const hit = cCache.get(q);
  if (hit && Date.now() - hit.t < 3600_000) return hit.items;
  const path = "/v2/providers/affiliate_open_api/apis/openapi/products/search";
  const query = `keyword=${encodeURIComponent(q)}&limit=${Math.min(n, 10)}`;
  const iso = new Date().toISOString(); // 2026-11-09T01:02:03.000Z → 261109T010203Z
  const dt = iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10) + "T" + iso.slice(11, 13) + iso.slice(14, 16) + iso.slice(17, 19) + "Z";
  const sig = await hmacHex(sk, dt + "GET" + path + query);
  const r = await fetch(`https://api-gateway.coupang.com${path}?${query}`, {
    headers: { Authorization: `CEA algorithm=HmacSHA256, access-key=${ak}, signed-date=${dt}, signature=${sig}`, "Content-Type": "application/json;charset=UTF-8" },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || (d.rCode && d.rCode !== "0")) throw new Error("coupang " + r.status + " " + (d.rMessage || d.message || ""));
  const items: Item[] = ((d.data && d.data.productData) || []).map((x: Record<string, unknown>) => ({
    src: "coupang", id: String(x.productId), title: String(x.productName || ""), price: Number(x.productPrice) || 0,
    image: String(x.productImage || ""), url: String(x.productUrl || ""), mall: "쿠팡", rocket: !!x.isRocket, cat: String(x.categoryName || ""),
  }));
  cCache.set(q, { t: Date.now(), items });
  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  // 보드에 들어온 사람인지 확인 (팀 비밀번호 헤더 또는 로그인)
  const h: Record<string, string> = {};
  for (const k of ["x-board-key", "authorization"]) { const v = req.headers.get(k); if (v) h[k] = v; }
  const apikey = req.headers.get("apikey") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, apikey, { global: { headers: h }, auth: { persistSession: false } });
  const { data: ok, error } = await sb.rpc("can_board");
  if (error || ok !== true) return json({ error: "no-access" }, 403);

  let body: { q?: string; n?: number } = {};
  try { body = await req.json(); } catch (_) { /* 빈 요청 */ }
  const q = String(body.q || "").trim().slice(0, 100);
  if (q.length < 2) return json({ error: "short" }, 400);
  const n = Math.max(1, Math.min(Number(body.n) || 20, 40));

  const run = async (f: (q: string, n: number) => Promise<Item[]>) => {
    try { return { ok: true, items: await f(q, n) }; }
    catch (e) { const m = String((e as Error).message || e); return { ok: false, error: m === "no-key" ? "no-key" : m.slice(0, 200), items: [] }; }
  };
  const [sh, cp] = await Promise.all([run(shop), run(coupang)]);
  return json({ q, shop: sh, coupang: cp });
});
