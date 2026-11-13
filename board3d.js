/* MONET 100 운영 보드 · 3D 보기
   배치도(state.markers)·인력 배정·물품을 그대로 읽어서 3D로 그려요. 보드가 다시 그려질 때마다 sync()로 바뀐 점만 반영.
   4층 건물(목재 웨인스코팅·창·문·아치·샹들리에·에스컬레이터)은 4층 현장 영상 기준.
   걸어보기(벽 충돌·화면 버튼), 관람객 시점 투어, 편집(물품 옮기기·돌리기 / 가벽 세우기 / 관람 동선) 포함.
   편집 결과: 물품 위치·방향 → 배치도 점(x, y, rot)에 바로 저장 / 가벽·동선 → 보드 설정(cfg-3dwalls, cfg-3dtour).
   three.js r128 + OrbitControls 는 보드가 3D 탭을 처음 열 때 불러와요. */
(function(){
"use strict";
const WALLS={"4F":{"gw":400,"gh":268,"boxes":[[118,20,1,1,"col"],[262,20,1,1,"col"],[117,21,2,1,"col"],[261,21,3,2,"col"],[49,23,3,8,"col"],[261,23,2,17,"core"],[19,24,3,5,"col"],[14,29,8,2,"col"],[14,31,7,1,"col"],[285,51,2,1,"col"],[14,52,8,3,"col"],[49,52,2,1,"col"],[285,52,3,4,"col"],[49,53,3,7,"col"],[19,55,3,7,"col"],[286,56,2,1,"col"],[351,60,3,7,"col"],[361,60,4,5,"col"],[278,61,4,1,"col"],[277,62,6,2,"col"],[361,65,11,2,"col"],[352,67,2,1,"col"],[362,67,10,1,"col"],[93,68,5,1,"col"],[92,69,6,1,"col"],[319,69,2,1,"col"],[52,70,6,25,"core"],[93,70,5,1,"col"],[318,70,3,4,"col"],[146,71,4,2,"skip"],[233,71,5,1,"skip"],[234,72,4,1,"skip"],[334,72,4,2,"col"],[319,74,2,1,"col"],[129,75,3,7,"skip"],[144,75,2,1,"skip"],[239,75,1,1,"skip"],[254,75,3,7,"skip"],[143,76,3,6,"skip"],[238,76,2,6,"skip"],[130,82,2,1,"skip"],[254,82,2,1,"skip"],[334,83,3,1,"col"],[334,84,4,1,"col"],[334,85,3,1,"col"],[129,86,3,7,"skip"],[147,86,1,1,"skip"],[241,86,1,1,"skip"],[254,86,3,7,"skip"],[146,87,3,6,"skip"],[240,87,2,6,"skip"],[296,87,2,1,"col"],[295,88,3,10,"col"],[314,88,3,10,"col"],[361,88,12,2,"col"],[361,90,11,1,"col"],[361,91,4,7,"col"],[130,93,2,1,"skip"],[254,93,2,1,"skip"],[242,94,1,1,"skip"],[242,95,2,1,"skip"],[296,98,2,1,"col"],[297,99,1,1,"col"],[11,104,2,11,"col"],[106,104,8,6,"col"],[151,104,8,6,"col"],[201,104,8,6,"col"],[238,104,7,7,"col"],[84,108,19,3,"white"],[107,110,7,1,"col"],[152,110,6,1,"col"],[202,110,6,1,"col"],[100,111,3,30,"white"],[12,115,1,1,"col"],[317,120,3,5,"col"],[318,125,2,1,"col"],[326,125,1,1,"col"],[325,126,2,6,"col"],[12,141,1,1,"col"],[11,142,2,7,"col"],[333,152,1,1,"col"],[12,153,1,1,"col"],[332,153,2,1,"col"],[11,154,3,1,"col"],[11,155,2,9,"col"],[100,162,3,30,"white"],[329,162,2,1,"col"],[330,163,1,1,"col"],[84,192,19,3,"white"],[107,192,6,1,"col"],[152,192,6,1,"col"],[202,192,7,1,"col"],[238,192,7,7,"col"],[11,193,2,4,"col"],[106,193,8,6,"col"],[151,193,8,6,"col"],[201,193,8,6,"col"],[12,197,1,1,"col"],[11,198,3,1,"col"],[346,198,1,1,"col"],[12,199,1,1,"col"],[345,199,2,2,"col"],[346,203,1,1,"col"],[15,204,31,1,"black"],[52,204,6,12,"col"],[345,204,2,1,"col"],[11,205,2,7,"col"],[14,205,32,1,"black"],[14,206,2,37,"black"],[44,206,2,19,"black"],[12,212,1,1,"col"],[52,216,5,1,"col"],[79,218,5,13,"col"],[137,218,2,1,"col"],[172,218,3,22,"black"],[208,218,2,1,"col"],[274,218,5,1,"col"],[301,218,41,2,"black"],[137,219,3,21,"black"],[208,219,3,21,"black"],[274,219,6,12,"col"],[301,220,2,5,"col"],[339,220,3,1,"col"],[339,221,2,4,"col"],[338,226,1,1,"col"],[338,227,2,1,"col"],[337,228,3,2,"col"],[12,229,1,1,"col"],[11,230,2,16,"black"],[337,230,2,3,"col"],[44,232,2,11,"col"],[301,232,2,11,"col"],[336,233,3,1,"col"],[336,234,2,3,"col"],[335,237,3,2,"col"],[335,239,2,3,"col"],[103,240,142,1,"black"],[102,241,143,2,"black"],[334,242,3,1,"col"],[14,243,32,2,"black"],[301,243,35,3,"black"],[15,245,31,1,"black"],[11,246,4,1,"col"],[42,246,3,2,"col"],[50,246,2,2,"col"],[294,246,2,3,"col"],[301,246,3,3,"col"],[333,246,2,1,"col"],[12,247,4,1,"col"],[327,247,8,2,"col"]]},"3F":{"gw":400,"gh":268,"boxes":[[133,30,2,2,"col"],[151,30,3,1,"col"],[171,30,3,2,"col"],[190,30,3,1,"col"],[210,30,3,2,"col"],[229,30,3,1,"col"],[249,30,2,3,"col"],[125,31,1,1,"col"],[152,31,2,1,"col"],[191,31,2,2,"col"],[230,31,2,1,"col"],[257,31,2,5,"col"],[125,32,2,4,"col"],[133,32,1,1,"col"],[152,32,1,1,"col"],[172,32,1,1,"col"],[211,32,1,1,"col"],[230,32,1,1,"col"],[149,73,3,2,"col"],[235,73,2,1,"col"],[234,74,3,1,"col"],[149,75,4,1,"col"],[233,75,4,1,"col"],[151,76,2,7,"col"],[233,76,3,6,"col"],[234,82,1,1,"col"],[334,83,2,1,"col"],[335,84,1,1,"col"],[151,86,2,8,"col"],[233,86,3,7,"col"],[86,90,7,2,"col"],[86,93,7,2,"col"],[234,93,1,1,"col"],[103,126,31,2,"white"],[150,126,127,3,"white"],[291,126,5,3,"col"],[104,128,9,1,"col"],[114,128,20,1,"white"],[108,129,2,1,"col"],[120,129,14,1,"white"],[150,129,126,1,"white"],[292,129,3,1,"col"],[107,130,3,2,"col"],[131,130,3,2,"col"],[150,130,3,18,"white"],[270,130,3,47,"white"],[106,132,3,2,"col"],[105,134,3,2,"col"],[105,136,2,1,"col"],[212,136,2,3,"col"],[104,137,3,2,"col"],[104,139,2,1,"col"],[103,140,3,2,"col"],[102,142,3,3,"col"],[131,144,2,1,"col"],[102,145,2,1,"col"],[131,145,3,2,"col"],[194,145,66,2,"white"],[101,146,3,2,"col"],[131,147,15,2,"white"],[198,147,2,1,"col"],[100,148,3,1,"col"],[149,148,4,4,"col"],[99,149,4,4,"col"],[140,149,4,1,"col"],[141,150,3,3,"col"],[150,152,3,43,"white"],[194,152,2,44,"white"],[100,153,2,1,"col"],[142,153,2,2,"col"],[99,154,3,4,"col"],[142,155,3,4,"col"],[99,158,2,2,"col"],[143,159,2,3,"col"],[98,160,3,7,"col"],[143,162,3,10,"col"],[98,167,2,13,"white"],[231,170,2,2,"col"],[144,172,2,1,"col"],[143,173,3,13,"white"],[270,177,8,4,"col"],[290,177,6,4,"col"],[98,180,3,7,"col"],[168,180,2,2,"col"],[270,181,3,48,"white"],[143,186,2,2,"col"],[99,187,2,2,"col"],[142,188,3,4,"col"],[99,189,3,4,"col"],[142,192,2,2,"col"],[100,193,2,1,"col"],[100,194,3,2,"col"],[141,194,3,3,"col"],[150,195,2,1,"col"],[141,197,2,1,"col"],[140,198,3,3,"col"],[140,201,2,1,"col"],[139,202,3,2,"col"],[202,202,43,2,"white"],[252,202,8,2,"col"],[139,204,2,1,"col"],[150,204,3,14,"white"],[250,204,3,36,"white"],[138,205,3,2,"col"],[138,207,2,1,"col"],[137,208,3,2,"col"],[136,210,3,3,"col"],[135,213,3,2,"col"],[134,215,3,2,"col"],[133,217,3,1,"col"],[102,218,4,2,"col"],[117,218,24,2,"white"],[148,218,5,1,"col"],[147,219,6,1,"col"],[150,220,3,3,"col"],[262,221,2,2,"col"],[150,223,2,1,"col"],[224,223,2,2,"col"],[133,230,3,1,"col"],[134,231,1,1,"col"],[150,236,3,4,"col"],[102,240,194,3,"white"],[103,243,192,1,"white"]]}}; // 도면에서 뽑은 벽체·기둥 상자 (400×268 격자) · 5번째 값: col 기둥, core 코어, black 전시 가벽, white 임시 가벽, skip 안 그림
const DEFAULT_WALLS=[{"id":"wmwalhykou3g8","fl":"4F","a":[12.12,37.31],"b":[12.12,45.35],"h":4.6,"kind":"white","label":""},{"id":"wmwalig82sykw","fl":"4F","a":[12.02,51.1],"b":[12.02,79.51],"h":4.6,"kind":"white","label":""},{"id":"wmwalijdswnfw","fl":"4F","a":[12.02,87.01],"b":[12.02,90.5],"h":4.6,"kind":"white","label":""},{"id":"wmwaljkkwuc84","fl":"4F","a":[20,37.1],"b":[65.44,37.1],"h":4.6,"kind":"white","label":""},{"id":"wmwbpowdu6buz","fl":"3F","a":[74.09,67.37],"b":[74.09,90.25],"h":2.4,"kind":"white","label":"","t":30}]; // 3D 페이지에서 세운 가벽 (보드에 저장된 게 없을 때 시작값)
const DEFAULT_LEGS=[{"fl":"4F","nodes":[{"p":[50.2,16.7],"s":{"d":"에스컬레이터에서 내리면 로비예요. 대기줄은 차단봉을 따라 이어지고, 에스컬레이터 내리는 곳은 늘 비워 둬요.","look":[40,18],"t":"4층 도착 · 로비"}},{"p":[44,17],"s":null},{"p":[32.5,25.8],"s":null},{"p":[21.2,29.7],"s":{"d":"메인 사이니지 앞에서 줄을 서요. 혼잡하면 대기 안내가 5분마다 대기 인원을 무전으로 알려요.","look":[21.5,32.8],"q":"현재 대기 시간은 약 ○분입니다. 순서대로 안내해 드리겠습니다.","st":["m-seed-002"],"t":"A 입구 사이니지 · 대기줄"}},{"p":[16.3,36],"s":null},{"p":[15.8,43.8],"s":{"d":"QR 검표 후 종이 티켓으로 바꿔요. 앱 미션을 안내하고, 앱이 어려우면 워크북을 드려요. 유아차·캐리어는 접수 옆 자리에 둬요.","look":[14,47],"q":"예매하신 QR 보여 주시겠어요? 종이 티켓으로 바꿔 드릴게요. 퇴장하실 때까지 꼭 가지고 계세요.","st":["m-seed-000","m-seed-001"],"t":"B 접수 · 안내"}},{"p":[16,51],"s":null},{"p":[16,62.2],"s":null},{"p":[17.1,77.4],"s":null},{"p":[16,83.3],"s":null},{"p":[12.5,84.5],"s":{"d":"약 17㎡의 좁은 방이라 14명 기준으로 들여보내요. 넘으면 앞에서 잠시 기다려요. 액자·회화는 만지지 않아요.","look":[5,85],"q":"이 오브제는 눈으로만 감상 부탁드려요.","st":["m-seed-004"],"t":"C 아카데미 살롱"}},{"p":[8,84.5],"s":null},{"p":[12.5,84.5],"s":null},{"p":[17.5,80.1],"s":null},{"p":[24,80],"s":null},{"p":[31,80],"s":{"d":"복도를 따라 시대가 바뀌어요. 관람은 한 방향으로만 진행돼요.","look":[46,81.5],"q":"관람은 한 방향으로 진행돼요. 돌아가셔야 하면 제가 함께 안내해 드릴게요.","st":["m-seed-004"],"t":"D 변화의 복도 · 시민사회 → 산업혁명"}},{"p":[38,80],"s":null},{"p":[45,80],"s":null},{"p":[52,80],"s":null},{"p":[59.1,81.9],"s":{"d":"물감 튜브와 사진기가 바꾼 그림 이야기. 셔터 장치는 정해진 범위에서만 써요.","look":[72,81.5],"q":"이 오브제는 눈으로만 감상 부탁드려요.","st":["m-seed-005"],"t":"D 변화의 복도 · 튜브물감 → 사진기"}},{"p":[67.5,81.4],"s":null},{"p":[71.5,81.8],"s":null},{"p":[74,85],"s":{"d":"모네 작품 공간이에요. 앱 미션 5종을 마치면 여기서 엠블럼과 등급을 확인해요.","look":[82,87],"q":"앱 이용이 어려우시면 워크북으로 미션을 이어서 하실 수 있어요.","st":["m-seed-005"],"t":"E 모네 전시관"}},{"p":[79,86],"s":null},{"p":[74,85],"s":null},{"p":[72.3,79.7],"s":null},{"p":[70.2,72.4],"s":null},{"p":[67.7,69.8],"s":null},{"p":[56.8,67],"s":{"d":"어두운 몰입 영상 공간이에요. 빈백에서 쉬어 가도 되지만, 한 번 나가면 다시 들어올 수 없어요.","look":[50,52],"q":"안이 어두워요. 잠시 눈이 적응하실 때까지 발밑 조심해 주세요.","st":["m-seed-003"],"t":"F 미디어 갤러리"}},{"p":[52,62],"s":null},{"p":[42,62.7],"s":null},{"p":[33,62.5],"s":null},{"p":[30,55.3],"s":{"d":"출구 안내가 에스컬레이터 쪽으로 안내해요. 역방향 입장은 막아요.","look":[35.4,68.1],"q":"관람 마치셨으면 이쪽으로 나가셔서 에스컬레이터로 3층 체험하는 공간으로 이어져요.","st":["m-seed-006"],"t":"미디어 갤러리 출구"}},{"p":[32.1,47.7],"s":null},{"p":[54.2,44.5],"s":null},{"p":[69.8,39.3],"s":null},{"p":[66.2,30.1],"s":{"d":"에스컬레이터를 타고 3층 체험하는 공간으로 내려가요.","look":[48,30.5],"t":"3층으로 이동"}}],"zone":"4층 · 이해하는 공간"},{"fl":"3F","nodes":[{"p":[48.8,38.5],"s":{"d":"에스컬레이터에서 내려 IN 쪽으로 걸어가요. 3층은 한 방향 통로로 이어져요.","look":[38,44],"t":"3층 도착 · KEY VISUAL 복도"}},{"p":[45,43.7],"s":null},{"p":[38,44],"s":null},{"p":[35.3,46.5],"s":{"d":"기차 여행처럼 티켓에 펀치를 찍고 기차표 스탬프를 체험해요. 펀치된 티켓으로는 다시 들어올 수 없어요.","look":[40.6,40.6],"q":"승차권 확인하겠습니다. … 즐거운 여행 되세요.","st":["m-seed-030"],"t":"IN · 역무원"}},{"p":[35,51],"s":null},{"p":[32.3,53.2],"s":null},{"p":[30.5,59],"s":null},{"p":[30.5,68.8],"s":{"d":"생라자르·루앙 대성당·국회의사당·수련·포플러·건초더미 연작 벽. 곡벽 앞 전시 차단봉 안쪽으로는 들어가지 않아요.","look":[34.5,70],"q":"만지지 말아 주세요.","st":["m-seed-031"],"t":"전시실1 · 모네 연작"}},{"p":[29.5,76],"s":null},{"p":[27.5,80],"s":null},{"p":[28,83.5],"s":null},{"p":[31.2,85],"s":null},{"p":[36.9,84.2],"s":null},{"p":[42.5,84],"s":{"d":"자갈 바닥, 다리, 천장 행잉이 있는 정원이에요. 식재는 만지지 않고, 휠체어는 우회 동선으로 직원이 함께 가요.","look":[46,80],"q":"바닥이 자갈이라 발밑 조심해 주세요. 위에 장식도 있어 머리 조심하세요.","st":["m-seed-031"],"t":"전시실2 · 지베르니"}},{"p":[48,84.5],"s":null},{"p":[53,83],"s":null},{"p":[46,78],"s":null},{"p":[44,68],"s":null},{"p":[44,60],"s":null},{"p":[46,55.5],"s":null},{"p":[50,55.5],"s":null},{"p":[53.5,59],"s":null},{"p":[54,64],"s":{"d":"방염 볏짚 언덕과 낮은 조도의 공간. 화기 엄금, 조형물 둘레로만 관람해요.","look":[58.5,64],"q":"조형물 둘레로만 관람 부탁드려요. 조용히 감상하시는 공간이에요.","st":["m-seed-031","m-seed-032"],"t":"전시실3 · 건초더미"}},{"p":[56,70],"s":null},{"p":[62,72.5],"s":null},{"p":[66,74],"s":null},{"p":[66.2,80],"s":null},{"p":[66.5,86.5],"s":null},{"p":[69.5,86.5],"s":null},{"p":[70.8,80],"s":null},{"p":[70.8,70],"s":{"d":"어두운 텍스트 공간이에요. 입구에서 인원을 조절하고 발밑을 살펴요.","look":[70.8,60],"q":"다른 분들 관람을 위해 조금만 조용히 부탁드려요.","st":["m-seed-032"],"t":"전시실4 · 감각의 계보"}},{"p":[70.6,62],"s":{"d":"여기서 나가면 재입장이 안 돼요. 바로 옆이 굿즈샵이에요.","look":[80,62],"q":"여기서 나가시면 다시 입장은 어려워요. 굿즈샵은 이쪽이에요.","st":["m-seed-032"],"t":"OUT"}},{"p":[75,62],"s":null},{"p":[79,64],"s":{"d":"굿즈 결제와 행사 답례품을 여기서 드려요. 관람은 여기서 끝나요.","look":[86,67],"q":"결제 도와드릴게요.","st":["m-seed-033"],"t":"ARTSHOP (굿즈샵)"}}],"zone":"3층 · 체험하는 공간"}]; // 3D 페이지에서 고친 관람 동선 (보드에 저장된 게 없을 때 시작값)
const MPP={"4F":0.026,"3F":0.029}; // 도면 1px당 m (치수선 기준 근사)
const IMG_W=1600, IMG_H=1075, GAP=7;
const WALL_FULL=4.6, WALL_CUT=2.4, WAIN=1.1, T=0.35, EYE=1.6, PACE=1.4, HOLD=5;
const KINDS=["staff","stanchion","exhibit","pop","desk","chair","sticker","caution"];
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}}, lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const kstDay=(()=>{const d=new Date(Date.now()+9*3600e3).getUTCDay(); return (d+6)%7;})();
const el=(tag,cls,text)=>{const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e;};
const clone=x=>JSON.parse(JSON.stringify(x));
const capture=(t,e)=>{ try{ t.setPointerCapture(e.pointerId); }catch(err){} };

let api=null, root, stage, cv, labels, legend, card, toolbar, hintEl, exitBtn, padEl, editP, tourEl, fadeEl, renderer, scene, camera, controls, mats={}, X, MAT, woodTex, stoneTex;
const ui={floor:lsGet("m3d-floor")||"4F", day:kstDay, hidden:new Set(), tags:lsGet("m3d-tags")!=="0", full:lsGet("m3d-full")==="1", plan:lsGet("m3d-plan")!=="0", walk:false, tour:false, sel:null, viewSet:false, legendOpen:null};
if(!["4F","3F","both"].includes(ui.floor)) ui.floor="4F";
const floors={}, floorMeshes=[], OCC={}; let pickables=[], tags=[], editTags=[], sig="", colorSig="", D=null, loopOn=false, raf=0, lastT=0;
let CW=clone(DEFAULT_WALLS), cwSig="", TOURDATA=clone(DEFAULT_LEGS), tourSig="", LEGS=[], STOPS=[];

function css(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function isDark(){ const c=new THREE.Color(css("--bg")||"#f3f4f2"); return (c.r*.3+c.g*.59+c.b*.11)<.45; }
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.05},o||{}));
const toWorld=(fl,x,y)=>{const s=MPP[fl]; return new THREE.Vector3((x/100*IMG_W-IMG_W/2)*s,0,(y/100*IMG_H-IMG_H/2)*s);};
const pct=(fl,v)=>{ const s=MPP[fl]; return [+((v.x/s+IMG_W/2)/IMG_W*100).toFixed(2), +((v.z/s+IMG_H/2)/IMG_H*100).toFixed(2)]; };
const curFl=()=>ui.floor==="both"?"4F":ui.floor;
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const nameOf=m=>{ const s=m.type==="staff"&&D&&D.slots[m.id]; return (s&&s.name)||m.label||((D&&D.types[m.type])||{}).name||m.type; };

function makeMats(){
  const cs={}; KINDS.forEach(k=>cs[k]=css("--t-"+k)||"#888"); cs.stage=css("--soft"); cs.bad=css("--bad"); cs.warn=css("--warn"); cs.muted=css("--muted");
  const s=JSON.stringify(cs)+isDark(); if(s===colorSig) return false; colorSig=s;
  KINDS.forEach(k=>{ if(mats[k]) mats[k].color.set(cs[k]); else mats[k]=M(cs[k]); });
  mats.chair.color.set(isDark()?"#9aa6a3":"#2b2b2b"); // 의자는 어두운 화면에서 토큰이 밝은 색이라 3D에선 회색으로
  if(!X) X={cover:M(cs.warn),empty:M(cs.bad),none:M(cs.muted),skin:M(0xF1D2B6),belt:M(0x1F1F1F),steel:M(0xB8BEC2,{metalness:.6,roughness:.35})};
  else { X.cover.color.set(cs.warn); X.empty.color.set(cs.bad); X.none.color.set(cs.muted); }
  if(renderer) renderer.setClearColor(new THREE.Color(cs.stage||"#e9ecea"));
  return true;
}

/* ---------- 재질 (4층 현장 영상 기준) ---------- */
function canvasTex(w,h,draw){
  const c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; t.anisotropy=renderer.capabilities.getMaxAnisotropy(); return t;
}
function makeWorldMats(){
  woodTex=canvasTex(256,128,(g,w,h)=>{ // 진한 원목 판재 웨인스코팅 + 윗 몰딩
    g.fillStyle="#4E301E"; g.fillRect(0,0,w,h);
    for(let y=22;y<h;y+=18){ g.fillStyle="rgba(0,0,0,.28)"; g.fillRect(0,y,w,2); g.fillStyle="rgba(255,210,170,.06)"; g.fillRect(0,y+2,w,6); }
    for(let i=0;i<260;i++){ g.fillStyle=`rgba(${90+Math.random()*40},${55+Math.random()*25},${30+Math.random()*15},.18)`; g.fillRect(Math.random()*w,22+Math.random()*(h-22),20+Math.random()*60,1); }
    g.fillStyle="#6B4429"; g.fillRect(0,0,w,14); g.fillStyle="#3A2216"; g.fillRect(0,14,w,4);
    for(let x=0;x<w;x+=8){ g.fillStyle="rgba(0,0,0,.25)"; g.fillRect(x,4,4,6); } });
  stoneTex=canvasTex(256,256,(g,w,h)=>{ // 엘리베이터 로비 베이지 석재 타일
    g.fillStyle="#CFC4B0"; g.fillRect(0,0,w,h);
    for(let i=0;i<900;i++){ g.fillStyle=`rgba(${150+Math.random()*60},${140+Math.random()*50},${120+Math.random()*40},.25)`; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
    g.strokeStyle="rgba(120,110,95,.45)"; g.lineWidth=2; g.strokeRect(1,1,w-2,h-2); });
  const S=(o)=>new THREE.MeshStandardMaterial(o);
  MAT={
    hall:S({color:0xA9ADAC,roughness:.28,metalness:.05}), lobby:S({map:stoneTex,roughness:.55}),
    plaster:S({color:0xF3F1EC,roughness:.9}), wood:S({map:woodTex,roughness:.55}), woodPlain:S({color:0x4A2C1B,roughness:.5}),
    black:S({color:0x26282A,roughness:.85}), white:S({color:0xF6F6F3,roughness:.92}), core:S({color:0xE6E0D4,roughness:.9}),
    blind:S({color:0xFFFFFF,emissive:0xEFF3F6,emissiveIntensity:.55,roughness:1}), glass:S({color:0xBFD8D4,transparent:true,opacity:.28,roughness:.1}),
    curtain:S({color:0x1D2A24,roughness:1}), bulb:S({color:0xFFF3D6,emissive:0xFFE2A8,emissiveIntensity:1.2}),
    brass:S({color:0xC9A867,metalness:.7,roughness:.35}), dark:S({color:0x2E3133,roughness:.6}), stepGold:S({color:0xD9B32E}),
    sel:S({color:0xE8771A,roughness:.6}) };
}

/* ---------- 4층 기존 건물 (도면 % 좌표 · 영상으로 재질 확인) ---------- */
const SHELL4={
  walls:[ // [시작 %, 끝 %, 창 위치(0~1), 문 위치(0~1)]
    [[3,6],[97,6],[],[]],
    [[3,6],[3,92.5],[.44,.555,.67,.88],[]],
    [[3,92.5],[85,92.5],[.11,.23,.34,.45,.56,.67,.78,.9],[]],
    [[85,92.5],[92,40],[.3,.62],[]],
    [[92,40],[97,6],[],[]],
    [[20,74],[74,74],[],[.18,.418,.65]], // 미디어관 ↔ 변화의 복도: 목재 양개문 3곳
    [[65,37],[65,74],[],[.89]],
    [[74,37],[74,74],[],[]],
    [[20,37],[20,74],[],[.18,.5,.78]] ], // 리셉션 ↔ 컨트롤룸 쪽 문
  colsTop:[[27.5,40],[38.5,40],[51.3,40],[60.3,40]],
  colsBot:[[27.5,73],[38.5,73],[51.3,73],[60.3,73]],
  chand:[[33,83],[45,83],[56.5,83],[8.5,82],[80,85]],
  curtains:[[20,56],[65,70.5]],
  escalator:{x0:33.5,x1:63,y0:27,y1:34},
  lobby:{x0:3,x1:97,y0:6,y1:37} };

function wallPiece(len,h,withWood){
  const g=new THREE.Group();
  if(withWood){
    const wd=woodTex.clone(); wd.needsUpdate=true; wd.repeat.set(Math.max(1,len/2.2),1);
    const wm=MAT.wood.clone(); wm.map=wd;
    const lo=new THREE.Mesh(new THREE.BoxGeometry(len,WAIN,T+.04),wm); lo.position.y=WAIN/2; g.add(lo);
    const up=new THREE.Mesh(new THREE.BoxGeometry(len,h-WAIN,T),MAT.plaster); up.position.y=WAIN+(h-WAIN)/2; g.add(up);
  } else { const m=new THREE.Mesh(new THREE.BoxGeometry(len,h,T),MAT.plaster); m.position.y=h/2; g.add(m); }
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
  return g;
}
function windowAt(h){ // 내부 면 기준: 롤 블라인드 내린 큰 창 + 목재 틀
  const g=new THREE.Group(), ww=1.7, wh=Math.min(h-1.35,3.0);
  const blind=new THREE.Mesh(new THREE.PlaneGeometry(ww,wh),MAT.blind); blind.position.set(0,1.2+wh/2,T/2+.02); g.add(blind);
  for(const [w,hh,x,y] of [[ww+.16,.08,0,1.2],[ww+.16,.08,0,1.2+wh],[.08,wh,-ww/2,1.2+wh/2],[.08,wh,ww/2,1.2+wh/2],[.05,wh,0,1.2+wh/2]]){
    const f=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.06),MAT.woodPlain); f.position.set(x,y,T/2+.04); g.add(f); }
  return g;
}
function doorAt(h){ // 목재 양개문 (열린 상태) + 상부 유리 트랜섬
  const g=new THREE.Group(), dw=1.8, dh=2.5;
  for(const s of [-1,1]){
    const post=new THREE.Mesh(new THREE.BoxGeometry(.12,dh+.6,T+.1),MAT.woodPlain); post.position.set(s*(dw/2+.06),(dh+.6)/2,0); g.add(post);
    const leaf=new THREE.Group(); const l=new THREE.Mesh(new THREE.BoxGeometry(dw/2,dh,.05),MAT.woodPlain); l.position.x=-s*dw/4; leaf.add(l);
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(dw/2-.25,dh*.55),MAT.glass); gl.position.set(-s*dw/4,.25,.03); leaf.add(gl);
    leaf.position.set(s*dw/2,dh/2,0); leaf.rotation.y=s*1.15; g.add(leaf); }
  const head=new THREE.Mesh(new THREE.BoxGeometry(dw+.24,.14,T+.1),MAT.woodPlain); head.position.y=dh+.07; g.add(head);
  const tr=new THREE.Mesh(new THREE.PlaneGeometry(dw,.45),MAT.glass); tr.position.set(0,dh+.38,0); g.add(tr);
  if(h-dh-.6>.05){ const top=new THREE.Mesh(new THREE.BoxGeometry(dw+.24,h-dh-.6,T),MAT.plaster); top.position.y=dh+.6+(h-dh-.6)/2; g.add(top); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  return g;
}
function buildShell(fl,h){
  const g=new THREE.Group();
  SHELL4.walls.forEach(([a,b,wins,doors])=>{
    const A=toWorld(fl,a[0],a[1]), B=toWorld(fl,b[0],b[1]), len=A.distanceTo(B), ang=Math.atan2(B.z-A.z,B.x-A.x);
    const seg=new THREE.Group(); seg.position.copy(A); seg.rotation.y=-ang;
    const cuts=doors.map(t=>[t*len-.96,t*len+.96]).sort((p,q)=>p[0]-q[0]);
    let x=0;
    [...cuts,[len,len]].forEach(([c0,c1])=>{
      if(c0-x>.05){ const p=wallPiece(c0-x,h,true); p.position.x=x+(c0-x)/2; seg.add(p); }
      if(c1>c0){ const d=doorAt(h); d.position.x=(c0+c1)/2; seg.add(d); }
      x=c1; });
    wins.forEach(t=>{ for(const side of [1,-1]){ const w=windowAt(h); w.position.x=t*len; if(side<0) w.rotation.y=Math.PI; seg.add(w); } });
    g.add(seg); });
  return g;
}
function archBetween(fl,p,q,spring){
  spring=spring||3.35;
  const A=toWorld(fl,p[0],p[1]), B=toWorld(fl,q[0],q[1]), span=A.distanceTo(B), rise=Math.min(span*.22,1.1), th=.32;
  const s=new THREE.Shape(), N=28, hw=span/2;
  s.moveTo(-hw,-.5); s.lineTo(-hw,0);
  for(let i=0;i<=N;i++){ const t=Math.PI-i/N*Math.PI; s.lineTo(Math.cos(t)*hw,Math.sin(t)*rise); }
  s.lineTo(hw,-.5); s.lineTo(hw-th,-.5); s.lineTo(hw-th,0);
  for(let i=0;i<=N;i++){ const t=i/N*Math.PI; s.lineTo(Math.cos(t)*(hw-th),Math.sin(t)*(rise-th*.8)); }
  s.lineTo(-hw+th,-.5); s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:.55,bevelEnabled:false}); geo.translate(0,0,-.275);
  const m=new THREE.Mesh(geo,MAT.plaster); m.castShadow=true;
  const g=new THREE.Group(); g.add(m);
  for(const sx of [-1,1]){ const c=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.7),MAT.plaster); c.position.set(sx*(hw-.15),-.6,0); g.add(c); } // 기둥 머리 코벨
  g.position.set((A.x+B.x)/2,spring,(A.z+B.z)/2); g.rotation.y=-Math.atan2(B.z-A.z,B.x-A.x);
  return g;
}
function chandelier(){
  const g=new THREE.Group();
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.9,6),MAT.brass); rod.position.y=4.15; g.add(rod);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.025,8,32),MAT.brass); ring.rotation.x=Math.PI/2; ring.position.y=3.6; g.add(ring);
  const ring2=ring.clone(); ring2.scale.setScalar(.6); ring2.position.y=3.78; g.add(ring2);
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, b=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),MAT.bulb); b.position.set(Math.cos(a)*.42,3.66,Math.sin(a)*.42); g.add(b); }
  const c=new THREE.Mesh(new THREE.SphereGeometry(.11,12,10),MAT.bulb); c.position.y=3.5; g.add(c);
  return g;
}
function curtainAt(fl,p){
  const g=new THREE.Group(); g.position.copy(toWorld(fl,p[0],p[1]));
  for(let i=0;i<9;i++){ const f=new THREE.Mesh(new THREE.BoxGeometry(.06,2.6,.22),MAT.curtain); f.position.set(-.24*4+i*.24,1.3,(i%2)*.08); g.add(f); }
  return g;
}
function escalator(fl,e){
  const g=new THREE.Group(), A=toWorld(fl,e.x0,e.y0), B=toWorld(fl,e.x1,e.y1);
  const w=B.x-A.x, d=B.z-A.z, cx=(A.x+B.x)/2, cz=(A.z+B.z)/2;
  const voidP=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color:0x2A2C2D})); voidP.rotation.x=-Math.PI/2; voidP.position.set(cx,.015,cz); g.add(voidP);
  for(const k of [0,1]){
    const z=A.z+d*(k?.72:.28);
    const belt=new THREE.Mesh(new THREE.BoxGeometry(w*.92,.08,1.05),MAT.dark); belt.position.set(cx,.05,z); g.add(belt);
    for(let i=0;i<26;i+=5){ const st=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,1),MAT.stepGold); st.position.set(A.x+.6+i*(w-1.2)/25,.1,z); g.add(st); }
    for(const s of [-1,1]){ const gl=new THREE.Mesh(new THREE.BoxGeometry(w*.92,.95,.03),MAT.glass); gl.position.set(cx,.55,z+s*.62); g.add(gl);
      const rail=new THREE.Mesh(new THREE.BoxGeometry(w*.92,.06,.08),MAT.dark); rail.position.set(cx,1.05,z+s*.62); g.add(rail); } }
  return g;
}
function buildFloorSurfaces(fl,W,H){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.PlaneGeometry(W,H),MAT.hall); base.rotation.x=-Math.PI/2; base.receiveShadow=true; g.add(base);
  if(fl==="4F"){
    const L=SHELL4.lobby, A=toWorld(fl,L.x0,L.y0), B=toWorld(fl,L.x1,L.y1);
    const lt=stoneTex.clone(); lt.needsUpdate=true; lt.repeat.set((B.x-A.x)/1.2,(B.z-A.z)/1.2);
    const lm=MAT.lobby.clone(); lm.map=lt;
    const lob=new THREE.Mesh(new THREE.PlaneGeometry(B.x-A.x,B.z-A.z),lm); lob.rotation.x=-Math.PI/2; lob.position.set((A.x+B.x)/2,.004,(A.z+B.z)/2); lob.receiveShadow=true; g.add(lob); }
  return g;
}
function buildFloor(fl){
  const g=new THREE.Group(); g.name=fl;
  const s=MPP[fl], W=IMG_W*s, H=IMG_H*s;
  const slab=new THREE.Mesh(new THREE.BoxGeometry(W,.25,H),M(0xCBD3CE)); slab.position.y=-.13; g.add(slab);
  const surf=buildFloorSurfaces(fl,W,H); g.add(surf); surf.traverse(o=>{ if(o.isMesh) floorMeshes.push(o); });
  const tex=new THREE.TextureLoader().load("img/"+fl+".jpg",draw); tex.anisotropy=renderer.capabilities.getMaxAnisotropy(); tex.encoding=THREE.sRGBEncoding;
  const plan=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.38,depthWrite:false}));
  plan.rotation.x=-Math.PI/2; plan.position.y=.012; g.add(plan); g.userData.plan=plan;
  const wb=WALLS[fl], cell=(IMG_W/wb.gw)*s, kinds={};
  wb.boxes.forEach(b=>{ if(b[4]!=="skip") (kinds[b[4]]=kinds[b[4]]||[]).push(b); });
  const KH={col:[WALL_FULL,WALL_CUT,MAT.plaster,true],core:[WALL_FULL,WALL_CUT,MAT.core,false],black:[2.7,2.7,MAT.black,false],white:[2.4,2.4,MAT.white,false]};
  const inst=[];
  for(const k in kinds){ const def=KH[k]||KH.col, list=kinds[k];
    const mk=(m,hFn,pad)=>{ const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,list.length); im.castShadow=im.receiveShadow=true; im.userData={list,hFn,pad,cell,W,H}; g.add(im); inst.push(im); };
    mk(def[2],()=>(ui.full||ui.walk?def[0]:def[1]),0);
    if(def[3]&&fl==="4F") mk(MAT.woodPlain,()=>WAIN,.04); }
  g.userData.inst=inst;
  if(fl==="4F"){
    const cut=buildShell(fl,WALL_CUT), full=buildShell(fl,WALL_FULL); full.visible=false; g.add(cut,full); g.userData.shell={cut,full};
    const deco=new THREE.Group(); deco.visible=false; const T4=SHELL4.colsTop, B4=SHELL4.colsBot;
    for(let i=0;i<T4.length-1;i++){ deco.add(archBetween(fl,T4[i],T4[i+1])); deco.add(archBetween(fl,B4[i],B4[i+1])); }
    T4.forEach((p,i)=>{ deco.add(archBetween(fl,p,B4[i],3.6)); deco.add(archBetween(fl,[B4[i][0],74],[B4[i][0],92.5])); });
    SHELL4.chand.forEach(p=>{ const c=chandelier(); c.position.copy(toWorld(fl,p[0],p[1])); deco.add(c); });
    g.add(deco); g.userData.deco=deco;
    SHELL4.curtains.forEach(p=>g.add(curtainAt(fl,p)));
    g.add(escalator(fl,SHELL4.escalator)); }
  const marks=new THREE.Group(); g.add(marks); g.userData.marks=marks;
  const cw=new THREE.Group(); g.add(cw); g.userData.cw=cw;
  floors[fl]={group:g,W,H}; scene.add(g);
}
function updateHeights(){
  const full=ui.full||ui.walk, m4=new THREE.Matrix4(), q=new THREE.Quaternion();
  for(const fl in floors){ const g=floors[fl].group;
    g.userData.inst.forEach(im=>{ const u=im.userData, h=u.hFn();
      u.list.forEach((b,i)=>{ const w=b[2]*u.cell+u.pad, d=b[3]*u.cell+u.pad, x=(b[0]*u.cell+(w-u.pad)/2)-u.W/2, z=(b[1]*u.cell+(d-u.pad)/2)-u.H/2;
        m4.compose(new THREE.Vector3(x,h/2,z),q,new THREE.Vector3(w,h,d)); im.setMatrixAt(i,m4); });
      im.instanceMatrix.needsUpdate=true; });
    if(g.userData.shell){ g.userData.shell.cut.visible=!full; g.userData.shell.full.visible=full; g.userData.deco.visible=full; }
    g.userData.plan.visible=ui.plan; g.userData.plan.material.opacity=ui.walk?.12:.38; }
  renderCustomWalls();
}

/* ---------- 가벽 (보드 설정 cfg-3dwalls) ---------- */
const WKIND={white:["흰 가벽","white"],black:["검정 가벽","black"],wood:["목재","wood"],glass:["유리","glass"]};
const WH=[[1.2,"1.2m (낮은 칸막이)"],[2.4,"2.4m (기본 가벽)"],[3,"3.0m"],[4.6,"4.6m (천장까지)"]];
const tOf=w=>Math.max(.02,Math.min(1,(+w.t||12)/100)); // 두께: cm로 저장
const wallLen=w=>toWorld(w.fl,w.a[0],w.a[1]).distanceTo(toWorld(w.fl,w.b[0],w.b[1]));
function renderCustomWalls(){
  if(!floors["4F"]) return;
  const full=ui.full||ui.walk;
  for(const fl in floors){ const cg=floors[fl].group.userData.cw; while(cg.children.length) cg.remove(cg.children[0]);
    CW.filter(w=>w.fl===fl).forEach(w=>{
      const A=toWorld(fl,w.a[0],w.a[1]), B=toWorld(fl,w.b[0],w.b[1]), L=A.distanceTo(B); if(L<.05) return;
      const h=full?(+w.h||2.4):Math.min(+w.h||2.4,WALL_CUT);
      const m=new THREE.Mesh(new THREE.BoxGeometry(L,h,tOf(w)),ed.on&&ed.selWall===w.id?MAT.sel:MAT[(WKIND[w.kind]||WKIND.white)[1]]);
      m.position.set((A.x+B.x)/2,h/2,(A.z+B.z)/2); m.rotation.y=-Math.atan2(B.z-A.z,B.x-A.x);
      m.castShadow=m.receiveShadow=true; m.userData.cwId=w.id; cg.add(m); }); }
  draw();
}
function cwBlocked(fl,x,z,r){
  for(const w of CW){ if(w.fl!==fl) continue;
    const A=toWorld(fl,w.a[0],w.a[1]), B=toWorld(fl,w.b[0],w.b[1]), dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz||1e-9;
    const t=Math.max(0,Math.min(1,((x-A.x)*dx+(z-A.z)*dz)/L2));
    if(Math.hypot(x-(A.x+dx*t),z-(A.z+dz*t))<r+tOf(w)/2) return true; }
  return false;
}
let wallTimer=null;
function saveWalls(now){ clearTimeout(wallTimer); const go=()=>{ wallTimer=null; cwSig=JSON.stringify(CW); if(D&&D.saveWalls) D.saveWalls(clone(CW)); note("저장했어요. 보드를 여는 팀원 모두에게 보여요."); };
  if(now) go(); else wallTimer=setTimeout(go,450); }
function putWall(w,now){ const i=CW.findIndex(x=>x.id===w.id); if(i<0) CW.push(w); else CW[i]=w; renderCustomWalls(); saveWalls(now); }
function deleteWall(id){ CW=CW.filter(x=>x.id!==id); if(ed.selWall===id) ed.selWall=null; renderCustomWalls(); saveWalls(true); renderEditPanel(); }

/* ---------- 배치도 점 → 3D 물건 ---------- */
function post(mat,h){
  const p=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.04,20),X.steel); base.position.y=.02;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,h,12),X.steel); pole.position.y=h/2;
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.08,12),mat); cap.position.y=h;
  [base,pole,cap].forEach(o=>{o.castShadow=true;p.add(o);}); return p;
}
function makeMarker(m){
  const g=new THREE.Group(); g.position.copy(toWorld(m.floor,+m.x||0,+m.y||0));
  const q=Math.max(1,Math.min(60,Math.round(+m.qty||1))), t=m.type;
  g.userData={marker:m,type:t,fl:m.floor};
  if(t==="staff"){
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,1.1,20),mats.staff); body.position.y=.55;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),X.skin); head.position.y=1.32;
    const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.55,32),new THREE.MeshBasicMaterial({color:mats.staff.color,side:THREE.DoubleSide,transparent:true,opacity:.55}));
    ring.rotation.x=-Math.PI/2; ring.position.y=.02;
    [body,head].forEach(o=>{o.castShadow=true;g.add(o);}); g.add(ring); g.userData.body=body;
    const tag=el("div","t3-tag"); labels.append(tag); tags.push({el:tag,obj:g,y:1.75});
  } else if(t==="stanchion"||t==="exhibit"){
    if(/곡벽|세로/.test(m.label||"")) g.rotation.y=Math.PI/2; // 전시실1 곡벽을 따라 세로로
    const gap=.6, h=t==="exhibit"?.8:.95, x0=-(q-1)*gap/2;
    for(let i=0;i<q;i++){ const p=post(mats[t],h); p.position.x=x0+i*gap; g.add(p); }
    if(q>1){ const belt=new THREE.Mesh(new THREE.BoxGeometry((q-1)*gap,.05,.012),t==="exhibit"?mats.exhibit:X.belt); belt.position.y=h-.06; g.add(belt); }
  } else if(t==="pop"){
    for(let i=0;i<q;i++){ const s=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.2,10),X.steel); pole.position.y=.6;
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.6,.85,.03),mats.pop); panel.position.y=1.35;
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.03,20),X.steel); base.position.y=.015;
      [pole,panel,base].forEach(o=>{o.castShadow=true;s.add(o);}); s.position.x=(i-(q-1)/2)*.8; g.add(s); }
  } else if(t==="desk"){
    for(let i=0;i<q;i++){ const d=new THREE.Mesh(new THREE.BoxGeometry(1.4,.74,.6),mats.desk); d.position.set((i-(q-1)/2)*1.45,.37,0); d.castShadow=true; g.add(d); }
  } else if(t==="chair"){
    const cols=Math.min(6,q), sp=.55, rows=Math.ceil(q/cols);
    for(let i=0;i<q;i++){ const c=new THREE.Group();
      const seat=new THREE.Mesh(new THREE.BoxGeometry(.42,.05,.42),mats.chair); seat.position.y=.45;
      const back=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.04),mats.chair); back.position.set(0,.68,-.19);
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.45,8),X.steel); leg.position.y=.225;
      [seat,back,leg].forEach(o=>{o.castShadow=true;c.add(o);}); c.position.set((i%cols-(cols-1)/2)*sp,0,(Math.floor(i/cols)-(rows-1)/2)*sp); g.add(c); }
  } else if(t==="sticker"){
    const sh=new THREE.Shape(); sh.moveTo(-.15,-.35); sh.lineTo(.15,-.35); sh.lineTo(.15,.05); sh.lineTo(.32,.05); sh.lineTo(0,.4); sh.lineTo(-.32,.05); sh.lineTo(-.15,.05); sh.closePath();
    const a=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:mats.sticker.color,side:THREE.DoubleSide}));
    a.rotation.x=-Math.PI/2; a.position.y=.02;
    const rot={"↑":0,"→":-Math.PI/2,"↓":Math.PI,"←":Math.PI/2}[m.glyph||"→"]; a.rotation.z=rot==null?-Math.PI/2:rot; g.add(a);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.04,16),new THREE.MeshBasicMaterial({visible:false})));
  } else if(t==="caution"){
    for(const s of [1,-1]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.34,.62,.02),mats.caution); p.position.set(0,.3,s*.09); p.rotation.x=s*.28; p.castShadow=true; g.add(p); }
  } else return null;
  if(m.rot!=null&&m.rot!=="") g.rotation.y=(+m.rot||0)*Math.PI/180; // 3D 편집에서 돌린 방향 (도)
  g.traverse(o=>{ if(o.isMesh) o.userData.root=g; });
  pickables.push(g); return g;
}
const degOf=g=>((Math.round(g.rotation.y*180/Math.PI)%360)+360)%360;

/* ---------- 보드 데이터와 맞추기 ---------- */
function rebuildMarkers(){
  const selId=ed.item&&ed.item.userData.marker.id;
  pickables=[]; tags.forEach(t=>t.el.remove()); tags=[];
  for(const fl in floors){ const mk=floors[fl].group.userData.marks; while(mk.children.length) mk.remove(mk.children[0]); }
  D.markers.forEach(m=>{ if(!floors[m.floor]) return; const g=makeMarker(m); if(g) floors[m.floor].group.userData.marks.add(g); });
  ed.item=selId?pickables.find(p=>p.userData.marker.id===selId)||null:null;
  if(ed.item) ed.item.scale.setScalar(1.15);
}
function staffOf(m){ const w=D.week[m.id]; return w?{w:w[ui.day],slot:D.slots[m.id]||{}}:null; }
const jobName=s=>{ s=String(s||""); const t=s.replace(/\s*\(?\s*인력\s*\)?\s*/g," ").trim(); return t||s; };
function staffKind(s){ return !s?"none":!s.w||!s.w.c?"empty":s.w.k==="cover"?"cover":"main"; }
function refreshStaff(){
  tags.forEach(t=>{ const m=t.obj.userData.marker, s=staffOf(m), kind=staffKind(s);
    t.obj.userData.body.material=kind==="main"?mats.staff:X[kind];
    t.el.className="t3-tag k-"+kind; t.el.textContent="";
    t.el.append(jobName((s&&s.slot.name)||m.label)||"근무 자리");
    if(s&&s.w&&s.w.c) t.el.append(el("small",null,s.w.c)); }); // 하는 일 · 이름만
}
function validLegs(x){ return Array.isArray(x)&&x.length&&x.every(L=>L&&(L.fl==="4F"||L.fl==="3F")&&Array.isArray(L.nodes)&&L.nodes.length>=2&&L.nodes.every(n=>Array.isArray(n.p)&&n.p.length===2)); }
function sync(data){
  D=data;
  const ns=JSON.stringify(D.markers.map(m=>[m.id,m.floor,m.type,m.x,m.y,m.qty,m.glyph,m.label,m.rot]));
  if(ns!==sig&&!ed.idrag){ sig=ns; rebuildMarkers(); applyVisibility(); }
  // 가벽·동선: 보드에 저장된 게 있으면 그걸, 없으면 3D 페이지에서 가져온 시작값
  const w=Array.isArray(D.walls3d)?D.walls3d:DEFAULT_WALLS, ws=JSON.stringify(w);
  if(ws!==cwSig&&!wallTimer){ cwSig=ws; CW=clone(w); renderCustomWalls(); if(ed.on&&ed.tab==="wall"&&!editP.contains(document.activeElement)) renderEditPanel(); }
  const t=validLegs(D.tour3d)?D.tour3d:DEFAULT_LEGS, ts=JSON.stringify(t);
  if(ts!==tourSig){ tourSig=ts; if(!ed.dirty){ TOURDATA=clone(t); rebuildTour(); if(ed.on) { drawHelpers(); if(!editP.contains(document.activeElement)) renderEditPanel(); } } }
  refreshStaff(); buildLegend(); buildToolbar();
  if(ui.tour) caption();
  else if(ed.on){ if(ed.tab==="item"&&!editP.contains(document.activeElement)) renderEditPanel(); }
  else if(ui.sel){ if(D.markers.some(m=>m.id===ui.sel)) showCard(ui.sel); else select(null); }
  draw();
}

/* ---------- 화면 ---------- */
function layoutFloors(){
  const both=ui.floor==="both";
  for(const fl in floors){ const g=floors[fl].group; g.visible=both||ui.floor===fl; g.position.y=both&&fl==="4F"?GAP:0; }
}
function applyVisibility(){ pickables.forEach(g=>{ g.visible=!ui.hidden.has(g.userData.type); }); updateHeights(); layoutFloors(); }
function setView(kind){
  const both=ui.floor==="both", f=floors[both?"4F":ui.floor];
  const cy=both?GAP/2:0, span=Math.max(f.W,f.H)*(camera.aspect<1?Math.min(1.9,1/camera.aspect)*.95:1);
  controls.target.set(0,cy,0);
  if(kind==="top") camera.position.set(0,cy+span*1.05,.01); else camera.position.set(-span*.38,cy+span*(both?.78:.62),span*.62);
  controls.update(); draw();
}
function setFloor(fl){ ui.floor=fl; lsSet("m3d-floor",fl); layoutFloors(); buildToolbar(); buildLegend(); }
function segBtns(list,cur,on,cls){ const s=el("div","seg"+(cls?" "+cls:"")); s.setAttribute("role","group"); list.forEach(([k,n,dis])=>{ const b=el("button",null,n); b.type="button"; b.setAttribute("aria-pressed",String(cur===k)); if(dis) b.disabled=true; b.onclick=()=>on(k); s.append(b); }); return s; }
function buildToolbar(){
  toolbar.textContent="";
  const f=el("div","t3-ctl"); f.append(el("span","small muted","층"), segBtns([["4F","4층"],["3F","3층"],["both","두 층",ed.on]],ui.floor,k=>{
    if(ui.tour) stopTour(true); select(null); setFloor(k);
    if(ed.on){ ed.a=null; ed.sel=null; ed.selWall=null; ed.lookPick=false; if(ed.item) selectItem(null); setView("top"); renderCustomWalls(); drawHelpers(); renderEditPanel(); }
    else if(ui.walk) startWalk(); else setView("iso"); }));
  let vs=null; if(D&&D.vers&&ui.floor!=="3F"){ vs=el("div","t3-ctl"); vs.append(el("span","small muted","4층 버전"), segBtns(D.vers,D.ver4,k=>{ if(ui.tour) stopTour(); select(null); D.setVer4(k); })); }
  const d=el("div","t3-ctl"); d.append(el("span","small muted","요일"), segBtns((D?D.days:["월","화","수","목","금","토","일"]).map((n,i)=>[i,n]),ui.day,k=>{
    ui.day=k; refreshStaff(); buildToolbar(); if(ui.tour) caption(); else if(ui.sel) showCard(ui.sel); draw(); }));
  const v=el("div","t3-ctl t3-tools");
  const btn=(t,fn,pressed,cls)=>{ const b=el("button","btn small"+(cls?" "+cls:""),t); b.type="button"; if(pressed!=null) b.setAttribute("aria-pressed",String(pressed)); b.onclick=fn; v.append(b); return b; };
  if(!ui.tour&&!ed.on){ btn("관람객 시점으로 걷기",()=>startTour(),null,"primary"); btn("편집 (물품·가벽·동선)",enterEdit); }
  if(!ui.walk&&!ed.on){ btn("걸어보기",()=>startWalk()); btn("위에서",()=>setView("top")); btn("비스듬히",()=>setView("iso")); }
  btn("실제 천장 높이",()=>{ ui.full=!ui.full; lsSet("m3d-full",ui.full?"1":"0"); updateHeights(); buildToolbar(); draw(); },ui.full||ui.walk);
  btn("도면",()=>{ ui.plan=!ui.plan; lsSet("m3d-plan",ui.plan?"1":"0"); updateHeights(); buildToolbar(); draw(); },ui.plan);
  btn("이름표",()=>{ ui.tags=!ui.tags; lsSet("m3d-tags",ui.tags?"1":"0"); buildToolbar(); draw(); },ui.tags);
  toolbar.append(f); if(vs) toolbar.append(vs); toolbar.append(d,v);
}
function buildLegend(){
  legend.textContent=""; if(!D) return;
  const det=el("details"); det.open=ui.legendOpen!=null?ui.legendOpen:!matchMedia("(max-width: 640px)").matches; // 휴대폰에선 접어 둬요
  const sm=el("summary",null,"보이기"); sm.addEventListener("click",()=>{ ui.legendOpen=!det.open; }); det.append(sm);
  const lg=el("div","t3-lg"), vis=m=>ui.floor==="both"||m.floor===ui.floor;
  KINDS.forEach(k=>{ const ms=D.markers.filter(m=>m.type===k&&vis(m)); if(!ms.length) return;
    const n=k==="staff"?ms.length+"자리":ms.reduce((a,m)=>a+Math.max(1,+m.qty||1),0)+"개";
    const b=el("button"); b.type="button"; b.setAttribute("aria-pressed",String(!ui.hidden.has(k)));
    const sw=el("span","t3-sw"); sw.style.background="var(--t-"+k+")";
    b.append(sw,el("span",null,(D.types[k]||{}).name||k),el("em",null,n));
    b.onclick=()=>{ ui.hidden.has(k)?ui.hidden.delete(k):ui.hidden.add(k); applyVisibility(); buildLegend(); draw(); };
    lg.append(b); });
  det.append(lg); legend.append(det);
}
function select(id){
  ui.sel=id; pickables.forEach(p=>p.scale.setScalar(p.userData.marker.id===id?1.15:1));
  if(id) showCard(id); else card.hidden=true;
  draw();
}
function showCard(id){
  const m=D.markers.find(x=>x.id===id); if(!m){ card.hidden=true; return; }
  const tn=(D.types[m.type]||{}).name||m.type, fl=m.floor==="4F"?"4층":"3층";
  card.textContent=""; card.hidden=false;
  const x=el("button","x","×"); x.type="button"; x.setAttribute("aria-label","닫기"); x.onclick=()=>select(null); card.append(x);
  const s=m.type==="staff"?staffOf(m):null;
  card.append(el("div","t3-title",(s&&s.slot.name)||m.label||tn), el("div","small muted",fl+" · "+tn+(m.label&&s&&s.slot.name&&s.slot.name!==m.label?" · "+m.label:"")));
  const dl=el("dl","t3-kv"), kv=(k,v)=>{ dl.append(el("dt",null,k)); const dd=el("dd"); typeof v==="string"?dd.textContent=v:dd.append(v); dl.append(dd); };
  if(m.type==="staff"){
    if(s){ const w=s.w; kv(D.days[ui.day]+"요일",w&&w.c?w.c+(w.k==="cover"?" (대타)":" (담당)"):"공석");
      if(s.slot.time) kv("근무",s.slot.time); if(s.slot.brk) kv("휴게",s.slot.brk); if(s.slot.cover) kv("휴게 커버",s.slot.cover); }
    else kv("근무","배정 대상 아님 (운영매니저·예비 자리)");
    if(m.note) kv("메모",m.note);
    card.append(dl);
    if(s){ card.append(el("div","small muted","요일별 근무")); const wk=el("div","t3-week");
      D.days.forEach((dn,i)=>{ const ww=D.week[m.id][i], c=el("div",(i===ui.day?"today ":"")+(ww&&ww.k==="cover"?"cov":"")+(ww&&!ww.c?" gap":"")); c.append(el("b",null,dn),ww&&ww.c?ww.c:"공석"); wk.append(c); });
      card.append(wk); }
  } else {
    kv("수량",Math.max(1,+m.qty||1)+"개"); if(m.glyph&&m.type==="sticker") kv("방향",m.glyph);
    if(m.note&&!/사진 기준 대략 위치/.test(m.note)) kv("메모",m.note);
    D.items.filter(i=>i.link===m.type).forEach(i=>{ kv("물품",i.name||"이름 없음"); kv("상태",el("span","pill",(i.status||"필요")+" · "+(i.kind||""))); });
    card.append(dl);
    const same=D.markers.filter(y=>y.type===m.type&&y.floor===m.floor);
    card.append(el("p","small muted",fl+" "+tn+" 전체: "+same.length+"곳 · "+same.reduce((a,y)=>a+Math.max(1,+y.qty||1),0)+"개"));
  }
  const go=el("button","btn small primary","배치도에서 보기·옮기기"); go.type="button"; go.onclick=()=>api&&api.openPlan(m); card.append(go);
}

/* ---------- 걸어보기 (눈높이 1.6m · 직접 조종 · 벽 충돌) ---------- */
const walk={yaw:0,pitch:-.05,target:null,keys:new Set(),drag:null};
const HINT="드래그: 회전 · 오른쪽 드래그(두 손가락): 이동 · 휠/핀치: 확대 · 누르기: 상세";
function buildOcc(fl){ // 층별 통행 불가 격자 (도면 4px = 1칸)
  const GW=400, GH=Math.ceil(IMG_H/4), g=new Uint8Array(GW*GH), s=MPP[fl];
  const mark=(cx,cy)=>{ if(cx>=0&&cy>=0&&cx<GW&&cy<GH) g[cy*GW+cx]=1; };
  WALLS[fl].boxes.forEach(b=>{ if(b[4]==="skip") return; for(let y=b[1];y<b[1]+b[3];y++) for(let x=b[0];x<b[0]+b[2];x++) mark(x,y); });
  if(fl==="4F"){
    SHELL4.walls.forEach(([p,q,,doors])=>{
      const x0=p[0]/100*IMG_W, y0=p[1]/100*IMG_H, x1=q[0]/100*IMG_W, y1=q[1]/100*IMG_H, lenPx=Math.hypot(x1-x0,y1-y0), len=lenPx*s;
      for(let d=0;d<=lenPx;d+=1.5){ const t=d/lenPx, m=t*len;
        if(doors.some(u=>Math.abs(m-u*len)<.9)) continue;
        mark(Math.floor((x0+(x1-x0)*t)/4),Math.floor((y0+(y1-y0)*t)/4)); } });
    const e=SHELL4.escalator; for(let y=Math.floor(e.y0/100*IMG_H/4);y<=e.y1/100*IMG_H/4;y++) for(let x=Math.floor(e.x0/100*IMG_W/4);x<=e.x1/100*IMG_W/4;x++) mark(x,y);
  }
  OCC[fl]={g,GW,GH};
}
function blocked(fl,x,z,r){
  r=r||.17; if(cwBlocked(fl,x,z,r)) return true;
  const o=OCC[fl], s=MPP[fl], c=4*s, px=(x/s+IMG_W/2)/4, pz=(z/s+IMG_H/2)/4, n=Math.ceil(r/c);
  for(let dy=-n;dy<=n;dy++) for(let dx=-n;dx<=n;dx++){
    const cx=Math.floor(px)+dx, cy=Math.floor(pz)+dy;
    if(cx<0||cy<0||cx>=o.GW||cy>=o.GH) return true;
    if(o.g[cy*o.GW+cx]&&Math.hypot((cx+.5-px)*c,(cy+.5-pz)*c)<r+c*.5) return true; }
  return false;
}
function tryMove(dx,dz){ // 벽에 막히면 벽을 따라 미끄러지듯 이동
  const fl=curFl(), p=camera.position;
  if(!blocked(fl,p.x+dx,p.z+dz)){ p.x+=dx; p.z+=dz; return true; }
  if(dx&&!blocked(fl,p.x+dx,p.z)){ p.x+=dx; return true; }
  if(dz&&!blocked(fl,p.x,p.z+dz)){ p.z+=dz; return true; }
  return false;
}
function showWalkUI(on){
  exitBtn.hidden=!on; padEl.hidden=!on; legend.hidden=on;
  hintEl.textContent=on?"화면 드래그: 보는 방향 · 아래 버튼 또는 방향키: 앞뒤로 걷기·돌기 · 바닥 누르기: 그 자리로 이동":HINT;
}
function startWalk(from){
  if(ui.floor==="both") setFloor("4F");
  ui.walk=true; controls.enabled=false; select(null); walk.target=null; walk.keys.clear();
  const fl=ui.floor;
  if(from){ camera.position.set(from.x,EYE,from.z); walk.yaw=from.yaw; walk.pitch=from.pitch; }
  else { const sp=fl==="4F"?[44,36.5,Math.PI]:[39,33,Math.PI]; // 4층: 에스컬레이터 앞 · 3층: IN 앞
    const p=toWorld(fl,sp[0],sp[1]); camera.position.set(p.x,EYE,p.z); walk.yaw=sp[2]; walk.pitch=-.06; }
  applyLook(); showWalkUI(true);
  camera.fov=66; camera.updateProjectionMatrix(); updateHeights(); buildToolbar(); draw();
}
function stopWalk(){
  ui.walk=false; controls.enabled=true; walk.target=null; walk.keys.clear(); showWalkUI(false);
  camera.fov=42; camera.updateProjectionMatrix(); updateHeights(); buildToolbar(); setView("iso");
}
function applyLook(){ camera.rotation.order="YXZ"; camera.rotation.set(walk.pitch,walk.yaw,0); }
const KEYMAP={w:"fwd",arrowup:"fwd",s:"back",arrowdown:"back",a:"left",arrowleft:"left",d:"right",arrowright:"right",q:"sl",e:"sr"};
function walkStep(dt){
  let moved=false; const k=walk.keys, f=k.has("fwd")-k.has("back"), turn=k.has("left")-k.has("right"), side=k.has("sr")-k.has("sl");
  if(turn){ walk.yaw+=turn*1.7*dt; applyLook(); moved=true; }
  const fx=-Math.sin(walk.yaw), fz=-Math.cos(walk.yaw);
  if(f||side){ const sp=1.9*dt; tryMove((fx*f-fz*side)*sp,(fz*f+fx*side)*sp); moved=true; }
  if(walk.target){ const d=walk.target.clone().sub(camera.position); d.y=0; const L=d.length();
    if(L<.08) walk.target=null;
    else { const want=Math.atan2(-d.x,-d.z); walk.yaw+=wrapA(want-walk.yaw)*Math.min(1,dt*4); applyLook();
      d.normalize(); const st=Math.min(L,1.9*dt); if(!tryMove(d.x*st,d.z*st)) walk.target=null; moved=true; } }
  if(moved) draw();
}
const keyOk=e=>root&&document.body.contains(root)&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||"");

/* ---------- 관람객 시점 (자동 투어 · 편집 가능) ---------- */
// 층마다 점(node) 목록, 점에 s가 있으면 멈춤 구간 { t: 제목, d: 설명, st: 그 자리 스태프(배치도 점 id), q: 안내 멘트, look: 바라볼 곳, hold: 멈추는 초 }
function rebuildTour(){
  LEGS=TOURDATA.map(L=>{ const P=L.nodes.map(n=>{ const v=toWorld(L.fl,n.p[0],n.p[1]); v.y=EYE; return v; }), cum=[0];
    for(let i=1;i<P.length;i++) cum.push(cum[i-1]+P[i].distanceTo(P[i-1])); return Object.assign({},L,{P,cum,len:cum[cum.length-1]||0}); });
  STOPS=[]; LEGS.forEach((L,li)=>L.nodes.forEach((n,i)=>{ if(n.s) STOPS.push(Object.assign({},n.s,{leg:li,at:L.cum[i],node:i})); }));
}
const tour={leg:0,at:0,cur:-1,hold:0,speed:1,playing:true,yaw:0,pitch:-.05,offYaw:0,offPitch:0,drag:null,busy:false,done:false};
const TE={};
function posAt(L,s){ s=Math.max(0,Math.min(L.len,s)); let k=1; while(k<L.cum.length-1&&L.cum[k]<s) k++;
  const a=L.cum[k-1], b=L.cum[k], t=b>a?(s-a)/(b-a):0; return L.P[k-1].clone().lerp(L.P[k],t); }
const yawTo=(from,to)=>Math.atan2(-(to.x-from.x),-(to.z-from.z));
function lookPoint(st){ const L=LEGS[st.leg]; return st.look?toWorld(L.fl,st.look[0],st.look[1]):null; }
function staffRow(id){ const m=D&&D.markers.find(x=>x.id===id); if(!m) return null; const s=staffOf(m), kind=staffKind(s), w=s&&s.w;
  const r=el("div","t3-trow"); r.append(el("span","t3-tdot k-"+kind),el("b",null,jobName((s&&s.slot.name)||m.label)||"근무 자리"),
    el("span",null,w&&w.c?w.c:"")); if(s&&s.slot.time) r.append(el("em",null,s.slot.time)); return r; }
function caption(){
  if(!LEGS.length) return;
  const done=tour.done, L=LEGS[Math.max(0,tour.leg)], st=STOPS[tour.cur]||{t:L.zone,d:""};
  TE.step.textContent=done?"관람 끝":(tour.cur+1)+" / "+STOPS.length;
  TE.fill.style.width=(done?100:(tour.cur+1)/Math.max(1,STOPS.length)*100)+"%";
  TE.zone.textContent=done?"4층 → 3층 전체 동선":L.zone;
  TE.title.textContent=done?"관람을 모두 마쳤어요":st.t;
  TE.desc.textContent=done?"4층 "+STOPS.filter(x=>x.leg===0).length+"구간, 3층 "+STOPS.filter(x=>x.leg===1).length+"구간을 손님 동선대로 걸었어요. 처음부터 다시 보거나 끝내기를 눌러 주세요.":st.d||"";
  TE.staff.textContent="";
  const rows=!done&&st.st?st.st.map(staffRow).filter(Boolean):[];
  if(rows.length){ TE.staff.append(el("div","t3-tlab",D.days[ui.day]+"요일 이 자리 스태프")); rows.forEach(r=>TE.staff.append(r)); }
  TE.staff.hidden=!rows.length;
  TE.quote.hidden=done||!st.q; if(st.q) TE.quote.textContent=st.q;
  TE.play.textContent=done?"처음부터":tour.playing?"일시정지":"계속 걷기";
  TE.prev.disabled=tour.cur<=0&&!done; TE.next.disabled=done;
  const ids=new Set(done?[]:st.st||[]);
  pickables.forEach(p=>p.scale.setScalar(ids.has(p.userData.marker.id)?1.2:1));
}
function arrive(k,snap){
  tour.cur=k; tour.done=false; const st=STOPS[k]; tour.hold=+st.hold>0?+st.hold:HOLD;
  if(snap){ const L=LEGS[st.leg], p=posAt(L,st.at), lp=lookPoint(st), ahead=posAt(L,st.at+1.5);
    tour.yaw=lp?yawTo(p,lp):p.distanceTo(ahead)>.05?yawTo(p,ahead):tour.yaw; tour.offYaw=tour.offPitch=0; }
  caption();
}
function goLeg(leg,then){
  tour.busy=true; fadeEl.classList.add("on");
  setTimeout(()=>{ if(!ui.tour){ tour.busy=false; fadeEl.classList.remove("on"); return; }
    tour.leg=leg; tour.at=0; setFloor(LEGS[leg].fl); then(); place(); fadeEl.classList.remove("on"); setTimeout(()=>{ tour.busy=false; },350); },420);
}
function jump(k){
  if(!STOPS.length){ goLeg(0,()=>{ tour.cur=-1; tour.hold=0; caption(); }); return; }
  k=Math.max(0,Math.min(STOPS.length-1,k)); const st=STOPS[k];
  const go=()=>{ tour.at=st.at; arrive(k,true); };
  if(st.leg!==tour.leg||ui.floor!==LEGS[st.leg].fl) goLeg(st.leg,go); else { go(); place(); } }
function startTour(k){
  rebuildTour();
  if(ui.walk){ ui.walk=false; walk.keys.clear(); showWalkUI(false); }
  ui.tour=true; ui.walk=true; controls.enabled=false; select(null);
  legend.hidden=true; hintEl.hidden=true; tourEl.hidden=false; tour.playing=true; tour.done=false; tour.leg=-1;
  camera.fov=66; camera.updateProjectionMatrix(); updateHeights(); buildToolbar(); jump(typeof k==="number"?k:0);
}
function stopTour(quiet){
  ui.tour=false; ui.walk=false; controls.enabled=true; tourEl.hidden=true; fadeEl.classList.remove("on"); tour.busy=false; tour.drag=null;
  legend.hidden=false; hintEl.hidden=false; hintEl.textContent=HINT; exitBtn.hidden=true; padEl.hidden=true;
  pickables.forEach(p=>p.scale.setScalar(1));
  if(!quiet){ camera.fov=42; camera.updateProjectionMatrix(); updateHeights(); setView("iso"); }
  buildToolbar();
}
function walkFromHere(){ // 투어를 멈추고 지금 자리·방향 그대로 직접 걷기
  const p=camera.position.clone(), yaw=tour.yaw+tour.offYaw, pitch=Math.max(-1.1,Math.min(.9,tour.pitch+tour.offPitch));
  stopTour(true); startWalk({x:p.x,z:p.z,yaw,pitch});
}
function place(){ const L=LEGS[tour.leg]; if(!L) return; camera.position.copy(posAt(L,tour.at));
  camera.rotation.order="YXZ"; camera.rotation.set(Math.max(-1.2,Math.min(1,tour.pitch+tour.offPitch)),tour.yaw+tour.offYaw,0); draw(); }
function endOfLeg(){
  if(tour.leg<LEGS.length-1) goLeg(tour.leg+1,()=>{ const nx=STOPS[tour.cur+1];
    if(nx&&nx.leg===tour.leg&&nx.at<.01) arrive(tour.cur+1,true);
    else { tour.hold=0; const L=LEGS[tour.leg]; if(L.P.length>1) tour.yaw=yawTo(L.P[0],L.P[1]); caption(); } });
  else { tour.done=true; tour.playing=false; caption(); }
}
function tourStep(dt){
  if(tour.busy||tour.done||tour.leg<0) return;
  const L=LEGS[tour.leg];
  if(tour.playing){
    if(tour.hold>0){ tour.hold-=dt*tour.speed;
      if(tour.hold<=0&&tour.at>=L.len-.01){ endOfLeg(); return; } }
    else { const nx=STOPS[tour.cur+1], ns=tour.at+PACE*tour.speed*dt;
      if(nx&&nx.leg===tour.leg&&nx.at<=ns){ tour.at=nx.at; arrive(tour.cur+1,false); }
      else if(ns>=L.len){ tour.at=L.len; endOfLeg(); return; }
      else tour.at=ns; }
  }
  const p=posAt(L,tour.at), st=STOPS[tour.cur], lp=tour.hold>0&&st?lookPoint(st):null, ahead=posAt(L,tour.at+1.6);
  const want=lp?yawTo(p,lp):p.distanceTo(ahead)>.05?yawTo(p,ahead):tour.yaw;
  tour.yaw+=wrapA(want-tour.yaw)*Math.min(1,dt*2.6);
  if(!tour.drag){ const k=Math.min(1,dt*.7); tour.offYaw*=1-k; tour.offPitch*=1-k; }
  place();
}
function buildTourUI(){
  tourEl=el("section","t3-float t3-tour"); tourEl.hidden=true; tourEl.setAttribute("aria-live","polite"); tourEl.setAttribute("aria-label","관람객 시점 투어");
  const prog=el("div","t3-tprog"); TE.step=el("span"); const bar=el("div","t3-tbar"); TE.fill=el("i"); bar.append(TE.fill); prog.append(TE.step,bar);
  TE.zone=el("div","t3-tzone"); TE.title=el("div","t3-ttitle"); TE.desc=el("p","t3-tdesc"); TE.staff=el("div","t3-tstaff"); TE.quote=el("blockquote");
  const ctl=el("div","t3-tctl"), b=(t,cls)=>{ const x=el("button","btn small"+(cls?" "+cls:""),t); x.type="button"; ctl.append(x); return x; };
  TE.prev=b("이전 구간"); TE.play=b("일시정지","primary"); TE.next=b("다음 구간"); TE.speed=b("1배속"); TE.free=b("여기서 직접 걷기"); TE.exit=b("끝내기","t3-end");
  TE.prev.onclick=()=>{ if(tour.done){ jump(STOPS.length-1); return; } jump(tour.hold>0?tour.cur-1:tour.cur); };
  TE.play.onclick=()=>{ if(tour.done){ tour.playing=true; jump(0); return; } tour.playing=!tour.playing; caption(); };
  TE.next.onclick=()=>{ if(tour.cur>=STOPS.length-1){ tour.done=true; tour.playing=false; caption(); return; } jump(tour.cur+1); };
  TE.speed.onclick=()=>{ tour.speed=tour.speed===1?2:1; TE.speed.textContent=tour.speed+"배속"; TE.speed.setAttribute("aria-pressed",String(tour.speed===2)); };
  TE.free.onclick=walkFromHere;
  TE.exit.onclick=()=>stopTour();
  tourEl.append(prog,TE.zone,TE.title,TE.desc,TE.staff,TE.quote,ctl);
  fadeEl=el("div","t3-fade");
  stage.append(tourEl,fadeEl);
}

/* ---------- 편집: 물품 옮기기·돌리기 · 가벽 세우기 · 관람 동선 고치기 ---------- */
const ed={on:false,tab:"item",tool:"draw",a:null,hover:null,selWall:null,opts:{h:2.4,kind:"white",snap:true,t:12},
  sel:null,drag:null,lookPick:false,item:null,idrag:null,dirty:false,msg:"",discardArmed:false};
const legOf=fl=>TOURDATA.findIndex(L=>L.fl===fl);
function note(m){ ed.msg=m; const s=root&&root.querySelector("#t3EdMsg"); if(s) s.textContent=m; }
const newId=()=>"w"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function selectItem(g){ ed.item=g; pickables.forEach(p=>p.scale.setScalar(p===g?1.15:1)); draw(); renderEditPanel(); }
function saveItem(g){ // 물품 위치·방향 → 배치도 점에 바로 저장 (배치도 탭에도 같이 옮겨져요)
  const m=g.userData.marker, p=pct(g.userData.fl,g.position);
  if(D&&D.moveMarker) D.moveMarker(m.id,{x:p[0],y:p[1],rot:degOf(g)});
  note("저장했어요. 배치도에도 같은 자리로 옮겨졌어요.");
}
let rotTimer=null;
function rotateItem(d){ const g=ed.item; if(!g) return; g.rotation.y+=d*Math.PI/180; draw(); const s=root.querySelector("#t3EdDeg"); if(s) s.value=degOf(g);
  clearTimeout(rotTimer); rotTimer=setTimeout(()=>saveItem(g),400); }
function markDirty(){ ed.dirty=true; ed.discardArmed=false; rebuildTour(); drawHelpers(); saveBtnState(); }
function saveTour(){ if(D&&D.saveTour) D.saveTour(clone(TOURDATA)); tourSig=JSON.stringify(TOURDATA); ed.dirty=false; renderEditPanel(); note("동선을 저장했어요. 관람객 시점에 바로 반영돼요."); }
function saveBtnState(){ const b=root&&root.querySelector("#t3EdSave"); if(b){ b.textContent=ed.dirty?"저장하기 •":"저장됨"; b.disabled=!ed.dirty; } }

/* 동선 도우미 (바닥에 경로·점 표시) */
let hMat=null;
function clearHelpers(){
  for(const fl in floors){ const g=floors[fl].group; if(g.userData.help){ g.remove(g.userData.help); g.userData.help=null; } }
  editTags.forEach(t=>t.el.remove()); editTags=[];
}
function drawHelpers(){
  clearHelpers(); if(!ed.on){ draw(); return; }
  if(!hMat) hMat={line:new THREE.MeshBasicMaterial({color:0x2F5D50}),node:new THREE.MeshBasicMaterial({color:0x2F5D50}),stop:new THREE.MeshBasicMaterial({color:0x1F7A5C}),
    sel:new THREE.MeshBasicMaterial({color:0xE8771A}),look:new THREE.MeshBasicMaterial({color:0xC2410C}),prev:new THREE.MeshBasicMaterial({color:0xE8771A,transparent:true,opacity:.55})};
  const fl=curFl(), g=floors[fl].group, hg=new THREE.Group(); g.userData.help=hg; g.add(hg);
  if(ed.tab==="tour"){
    const li=legOf(fl); if(li>=0){
      const L=TOURDATA[li], P=L.nodes.map(n=>toWorld(fl,n.p[0],n.p[1]));
      for(let i=1;i<P.length;i++){ const A=P[i-1], B=P[i], d=A.distanceTo(B); if(d<.01) continue;
        const r=new THREE.Mesh(new THREE.BoxGeometry(d,.03,.14),hMat.line); r.position.set((A.x+B.x)/2,.06,(A.z+B.z)/2); r.rotation.y=-Math.atan2(B.z-A.z,B.x-A.x); r.userData.seg=i; hg.add(r);
        const grp=new THREE.Group(), ar=new THREE.Mesh(new THREE.ConeGeometry(.17,.36,12),hMat.line);
        ar.rotation.z=-Math.PI/2; grp.add(ar); grp.position.set(r.position.x,.1,r.position.z); grp.rotation.y=r.rotation.y; hg.add(grp); }
      L.nodes.forEach((n,i)=>{
        const isSel=ed.sel&&ed.sel.leg===li&&ed.sel.i===i, isStop=!!n.s;
        const m=new THREE.Mesh(isStop?new THREE.CylinderGeometry(.42,.42,.08,28):new THREE.SphereGeometry(.2,16,12),isSel?hMat.sel:isStop?hMat.stop:hMat.node);
        m.position.copy(P[i]); m.position.y=isStop?.08:.2; m.userData.node={leg:li,i}; hg.add(m);
        if(isStop){ const e=el("div","t3-tag t3-etag"+(isSel?" sel":""),(STOPS.findIndex(s=>s.leg===li&&s.node===i)+1)+". "+(n.s.t||"멈춤")); labels.append(e); editTags.push({el:e,obj:m,y:.5}); }
        if(isStop&&n.s.look){ const T=toWorld(fl,n.s.look[0],n.s.look[1]), d=P[i].distanceTo(T);
          const c=new THREE.Mesh(new THREE.ConeGeometry(.2,.5,16),hMat.look); c.position.set(T.x,.3,T.z); c.rotation.x=Math.PI; hg.add(c);
          if(d>.1){ const l=new THREE.Mesh(new THREE.BoxGeometry(d,.02,.05),hMat.look); l.position.set((P[i].x+T.x)/2,.05,(P[i].z+T.z)/2); l.rotation.y=-Math.atan2(T.z-P[i].z,T.x-P[i].x); hg.add(l); } }
      }); }
  } else if(ed.tab==="wall"&&ed.a){
    const A=toWorld(fl,ed.a[0],ed.a[1]), s=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),hMat.sel); s.position.set(A.x,.16,A.z); hg.add(s);
    if(ed.hover){ const B=toWorld(fl,ed.hover[0],ed.hover[1]), L=A.distanceTo(B);
      if(L>.02){ const h=Math.min(ed.opts.h,WALL_CUT), m=new THREE.Mesh(new THREE.BoxGeometry(L,h,ed.opts.t/100),hMat.prev);
        m.position.set((A.x+B.x)/2,h/2,(A.z+B.z)/2); m.rotation.y=-Math.atan2(B.z-A.z,B.x-A.x); hg.add(m); } }
  }
  draw();
}

/* 편집 마우스·터치 */
let eRay=null, eM=null, ePlane=null, eDown=null;
function evRay(e){ const r=cv.getBoundingClientRect(); eM.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); eRay.setFromCamera(eM,camera); }
function floorWorld(e){ evRay(e); const v=new THREE.Vector3(); return eRay.ray.intersectPlane(ePlane,v)?v:null; }
function floorPct(e){ evRay(e); const v=new THREE.Vector3(); if(!eRay.ray.intersectPlane(ePlane,v)) return null; const p=pct(curFl(),v);
  return p[0]<0||p[0]>100||p[1]<0||p[1]>100?null:p; }
function snapWall(a,b){
  if(!ed.opts.snap||!a) return b; const fl=curFl(), A=toWorld(fl,a[0],a[1]), B=toWorld(fl,b[0],b[1]), ang=Math.abs(Math.atan2(B.z-A.z,B.x-A.x))%Math.PI;
  const tol=.21; if(ang<tol||Math.PI-ang<tol) return [b[0],a[1]]; if(Math.abs(ang-Math.PI/2)<tol) return [a[0],b[1]]; return b;
}
function edDown(e){
  eDown=[e.clientX,e.clientY];
  if(ed.tab==="item"){ evRay(e); const fl=curFl(), hit=eRay.intersectObjects(pickables.filter(g=>g.visible&&g.userData.fl===fl),true)[0];
    if(hit){ const g=hit.object.userData.root, v=floorWorld(e); ed.idrag={g,off:v?v.sub(g.position):new THREE.Vector3(),moved:false}; controls.enabled=false; capture(cv,e); } return; }
  if(ed.tab==="tour"&&!ed.lookPick){ evRay(e); const hg=floors[curFl()].group.userData.help;
    const hit=hg&&eRay.intersectObjects(hg.children,false).find(h=>h.object.userData.node);
    if(hit){ ed.drag=Object.assign({},hit.object.userData.node,{moved:false}); ed.sel={leg:ed.drag.leg,i:ed.drag.i}; controls.enabled=false; capture(cv,e); } }
}
function edMove(e){
  if(ed.idrag){ const v=floorWorld(e); if(!v) return; const d=ed.idrag; d.g.position.set(v.x-d.off.x,0,v.z-d.off.z); d.moved=true; draw(); return; }
  if(ed.drag){ const p=floorPct(e); if(!p) return; TOURDATA[ed.drag.leg].nodes[ed.drag.i].p=[+p[0].toFixed(1),+p[1].toFixed(1)]; ed.drag.moved=true; markDirty(); return; }
  if(ed.tab==="wall"&&ed.tool==="draw"&&ed.a){ const p=floorPct(e); if(!p) return; ed.hover=snapWall(ed.a,p); drawHelpers();
    const s=root.querySelector("#t3EdLen"); if(s) s.textContent="길이 "+wallLen({fl:curFl(),a:ed.a,b:ed.hover}).toFixed(1)+"m"; }
}
function edUp(e){
  if(ed.idrag){ const d=ed.idrag, id=d.g.userData.marker.id; ed.idrag=null; controls.enabled=true; if(d.moved) saveItem(d.g); selectItem(pickables.find(p=>p.userData.marker.id===id)||null); eDown=null; return; }
  if(ed.drag){ ed.drag=null; controls.enabled=true; drawHelpers(); renderEditPanel(); return; }
  if(!eDown||Math.hypot(e.clientX-eDown[0],e.clientY-eDown[1])>6) return; eDown=null;
  const fl=curFl(), p=floorPct(e);
  if(ed.tab==="item"){ selectItem(null); return; }
  if(ed.tab==="wall"){
    if(ed.tool==="draw"){ if(!p) return;
      if(!ed.a){ ed.a=[+p[0].toFixed(2),+p[1].toFixed(2)]; ed.hover=null; drawHelpers(); renderEditPanel(); return; }
      const b=snapWall(ed.a,p), w={id:newId(),fl,a:ed.a,b:[+b[0].toFixed(2),+b[1].toFixed(2)],h:ed.opts.h,kind:ed.opts.kind,t:ed.opts.t,label:""};
      ed.a=null; ed.hover=null; drawHelpers();
      if(wallLen(w)<.2){ note("너무 짧아요. 시작점과 끝점을 떨어뜨려 찍어 주세요."); renderEditPanel(); return; }
      ed.selWall=w.id; putWall(w,true); renderEditPanel(); return; }
    evRay(e); const cg=floors[fl].group.userData.cw, hit=cg&&eRay.intersectObjects(cg.children,false)[0];
    ed.selWall=hit?hit.object.userData.cwId:null; renderCustomWalls(); renderEditPanel(); return;
  }
  const li=legOf(fl); if(li<0||!p) return; const L=TOURDATA[li];
  if(ed.lookPick&&ed.sel&&L.nodes[ed.sel.i]&&L.nodes[ed.sel.i].s){ L.nodes[ed.sel.i].s.look=[+p[0].toFixed(1),+p[1].toFixed(1)]; ed.lookPick=false; markDirty(); renderEditPanel(); return; }
  const W=toWorld(fl,p[0],p[1]); let best=null; // 선 위를 누르면 점 추가
  for(let i=1;i<L.nodes.length;i++){ const A=toWorld(fl,L.nodes[i-1].p[0],L.nodes[i-1].p[1]), B=toWorld(fl,L.nodes[i].p[0],L.nodes[i].p[1]);
    const dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz||1e-9, t=Math.max(0,Math.min(1,((W.x-A.x)*dx+(W.z-A.z)*dz)/L2));
    const d=Math.hypot(W.x-A.x-dx*t,W.z-A.z-dz*t); if(d<.45&&(!best||d<best.d)) best={d,i}; }
  if(best){ L.nodes.splice(best.i,0,{p:[+p[0].toFixed(1),+p[1].toFixed(1)],s:null}); ed.sel={leg:li,i:best.i}; markDirty(); renderEditPanel(); note("점을 추가했어요. 끌어서 옮길 수 있어요."); }
  else { ed.sel=null; drawHelpers(); renderEditPanel(); }
}

/* 편집 패널 */
function inp(label,value,on,opts){ opts=opts||{};
  const w=el("label","ef"); w.append(el("span",null,label));
  const i=opts.area?el("textarea"):el("input"); if(!opts.area) i.type=opts.type||"text"; if(opts.rows) i.rows=opts.rows;
  if(opts.step) i.step=opts.step; if(opts.min!=null) i.min=opts.min; i.value=value==null?"":value; if(opts.ph) i.placeholder=opts.ph;
  i.addEventListener("input",()=>on(i.value)); w.append(i); return w; }
function selBox(label,value,list,on){
  const w=el("label","ef"); w.append(el("span",null,label)); const s=el("select");
  list.forEach(([v,t])=>{ const o=el("option",null,t); o.value=String(v); if(String(v)===String(value)) o.selected=true; s.append(o); });
  s.addEventListener("change",()=>on(s.value)); w.append(s); return w; }
function ebtn(t,cls,on){ const b=el("button","btn small"+(cls?" "+cls:""),t); b.type="button"; b.onclick=on; return b; }
function renderEditPanel(){
  if(!ed.on||!editP) return; const fl=curFl(); editP.textContent="";
  const head=el("div","t3-ehead"); head.append(el("b",null,(fl==="4F"?"4층":"3층")+" 편집"),ebtn(ed.dirty&&ed.discardArmed?"버리고 끝내기":"편집 끝내기","",()=>exitEdit())); editP.append(head);
  editP.append(segBtns([["item","물품 옮기기"],["wall","가벽 세우기"],["tour","관람 동선"]],ed.tab,v=>{ ed.tab=v; ed.a=null; ed.lookPick=false; ed.sel=null; ed.selWall=null; if(ed.item) selectItem(null); renderCustomWalls(); drawHelpers(); renderEditPanel(); setHint(); },"t3-eseg"));
  if(ed.tab==="item"){
    editP.append(el("p","t3-ehelp","물품이나 근무 위치를 끌어서 옮겨요. 눌러서 고르면 방향을 돌릴 수 있어요. (R: 15° 돌리기)"));
    const g=ed.item;
    if(g){ const m=g.userData.marker, box=el("div","t3-ebox");
      box.append(el("div","t3-etitle",nameOf(m)+" · "+((D.types[m.type]||{}).name||m.type)+(m.type!=="staff"&&+m.qty>1?" "+m.qty+"개":"")));
      const r=el("div","t3-erow"); r.append(ebtn("↺ 90°","",()=>rotateItem(90)),ebtn("↺ 15°","",()=>rotateItem(15)),ebtn("↻ 15°","",()=>rotateItem(-15)),ebtn("↻ 90°","",()=>rotateItem(-90))); box.append(r);
      const di=inp("방향 (도)",degOf(g),v=>{ g.rotation.y=(+v||0)*Math.PI/180; draw(); clearTimeout(rotTimer); rotTimer=setTimeout(()=>saveItem(g),500); },{type:"number",step:5}); di.querySelector("input").id="t3EdDeg"; box.append(di);
      editP.append(box); }
    editP.append(el("p","t3-ehelp small","3D에서 옮기거나 돌린 건 운영 보드 배치도에도 그대로 저장돼요. 지금 고른 4층 버전에만 반영돼요."));
  }
  if(ed.tab==="wall"){
    editP.append(segBtns([["draw","그리기"],["pick","고르기·지우기"]],ed.tool,v=>{ ed.tool=v; ed.a=null; drawHelpers(); renderEditPanel(); setHint(); },"t3-eseg"));
    if(ed.tool==="draw"){
      editP.append(el("p","t3-ehelp",ed.a?"끝점을 누르세요. (Esc: 취소)":"바닥을 눌러 시작점, 한 번 더 눌러 끝점을 찍으면 가벽이 서요."));
      if(ed.a){ const r=el("div","t3-erow"), ln=el("span","t3-elen","길이 -"); ln.id="t3EdLen"; r.append(ln,ebtn("취소","",()=>{ ed.a=null; ed.hover=null; drawHelpers(); renderEditPanel(); })); editP.append(r); }
      editP.append(selBox("높이",ed.opts.h,WH,v=>{ ed.opts.h=+v; }), inp("두께 (cm)",ed.opts.t,v=>{ ed.opts.t=Math.max(2,Math.min(100,+v||12)); },{type:"number",min:2,step:1}), selBox("종류",ed.opts.kind,Object.entries(WKIND).map(([k,v])=>[k,v[0]]),v=>{ ed.opts.kind=v; }));
      const c=el("label","t3-echk"), cb=el("input"); cb.type="checkbox"; cb.checked=ed.opts.snap; cb.onchange=()=>{ ed.opts.snap=cb.checked; }; c.append(cb,el("span",null,"가로·세로로 반듯하게 맞추기")); editP.append(c);
    }
    const w=CW.find(x=>x.id===ed.selWall);
    if(w){ const box=el("div","t3-ebox"); box.append(el("div","t3-etitle","고른 가벽 · "+wallLen(w).toFixed(1)+"m"));
      const upd=patch=>{ Object.assign(w,patch); putWall(w); };
      box.append(inp("이름 (선택)",w.label,v=>{ w.label=v; saveWalls(); },{ph:"예: 포토존 뒤 가벽"}));
      box.append(selBox("높이",w.h,WH.some(x=>x[0]===+w.h)?WH:WH.concat([[w.h,w.h+"m"]]),v=>upd({h:+v})),
        inp("두께 (cm)",w.t||12,v=>upd({t:Math.max(2,Math.min(100,+v||12))}),{type:"number",min:2,step:1}),
        selBox("종류",w.kind,Object.entries(WKIND).map(([k,v])=>[k,v[0]]),v=>upd({kind:v})));
      box.append(ebtn("이 가벽 지우기","danger",()=>deleteWall(w.id))); editP.append(box); }
    const mine=CW.filter(x=>x.fl===fl); editP.append(el("h4",null,"이 층 가벽 "+mine.length+"개"));
    const lst=el("div","t3-elist"); mine.forEach(x=>lst.append(ebtn((x.label||(WKIND[x.kind]||WKIND.white)[0])+" · "+wallLen(x).toFixed(1)+"m · 높이 "+x.h+"m · "+Math.round(tOf(x)*100)+"cm",x.id===ed.selWall?"on":"",()=>{ ed.tool="pick"; ed.selWall=x.id; renderCustomWalls(); renderEditPanel(); })));
    if(!mine.length) lst.append(el("p","t3-ehelp","아직 없어요.")); editP.append(lst);
  } else if(ed.tab==="tour"){
    const li=legOf(fl);
    if(li<0) editP.append(el("p","t3-ehelp","이 층에는 관람 동선이 없어요."));
    else {
      const L=TOURDATA[li];
      editP.append(el("p","t3-ehelp","점을 끌어서 옮겨요 · 초록 선 위를 누르면 점이 생겨요 · 점을 누르면 멈춤 구간을 정할 수 있어요."));
      editP.append(inp("층 안내 문구",L.zone,v=>{ L.zone=v; ed.dirty=true; saveBtnState(); }));
      const n=ed.sel&&ed.sel.leg===li?L.nodes[ed.sel.i]:null;
      if(n){ const box=el("div","t3-ebox"), i=ed.sel.i; box.append(el("div","t3-etitle","점 "+(i+1)+" / "+L.nodes.length+(n.s?" · 멈춤 구간":"")));
        const c=el("label","t3-echk"), cb=el("input"); cb.type="checkbox"; cb.checked=!!n.s;
        cb.onchange=()=>{ n.s=cb.checked?{t:"새 구간",d:"",st:[],q:"",hold:HOLD}:null; markDirty(); renderEditPanel(); };
        c.append(cb,el("span",null,"여기서 멈춰서 설명 보여 주기")); box.append(c);
        if(n.s){ const s=n.s, ch=()=>{ ed.dirty=true; ed.discardArmed=false; rebuildTour(); saveBtnState(); };
          box.append(inp("제목",s.t,v=>{ s.t=v; ch(); }));
          box.append(inp("공간 설명",s.d,v=>{ s.d=v; ch(); },{area:true,rows:3}));
          box.append(inp("스태프 안내 멘트",s.q,v=>{ s.q=v; ch(); },{area:true,rows:2,ph:"비우면 멘트 칸이 안 보여요"}));
          box.append(inp("멈추는 시간 (초)",s.hold||HOLD,v=>{ s.hold=Math.max(1,Math.min(60,+v||HOLD)); ch(); },{type:"number",min:1,step:1}));
          const sf=el("div","ef"); sf.append(el("span",null,"이 자리 스태프"));
          const grid=el("div","t3-estaff"); D.markers.filter(m=>m.type==="staff"&&m.floor===fl).forEach(m=>{
            const lb=el("label","t3-echk"), x=el("input"); x.type="checkbox"; x.checked=(s.st||[]).includes(m.id);
            x.onchange=()=>{ s.st=(s.st||[]).filter(id=>id!==m.id); if(x.checked) s.st.push(m.id); ch(); }; lb.append(x,el("span",null,nameOf(m))); grid.append(lb); });
          sf.append(grid); box.append(sf);
          const lr=el("div","t3-erow"); lr.append(el("span","t3-elen",s.look?"바라볼 곳: 지정됨":"바라볼 곳: 걷는 방향"));
          lr.append(ebtn(ed.lookPick?"바닥을 누르세요…":"바닥에서 지정",ed.lookPick?"on":"",()=>{ ed.lookPick=!ed.lookPick; renderEditPanel(); }));
          if(s.look) lr.append(ebtn("지우기","",()=>{ delete s.look; markDirty(); renderEditPanel(); })); box.append(lr); }
        const br=el("div","t3-erow");
        br.append(ebtn("다음 점과 사이에 점 추가","",()=>{ const a=L.nodes[i], b=L.nodes[i+1]||L.nodes[i-1]; L.nodes.splice(i+1,0,{p:[+((a.p[0]+b.p[0])/2).toFixed(1),+((a.p[1]+b.p[1])/2+(L.nodes[i+1]?0:1)).toFixed(1)],s:null}); ed.sel={leg:li,i:i+1}; markDirty(); renderEditPanel(); }));
        br.append(ebtn("이 점 지우기","danger",()=>{ if(L.nodes.length<=2){ note("한 층에 점이 2개는 있어야 해요."); return; } L.nodes.splice(i,1); ed.sel=null; markDirty(); renderEditPanel(); }));
        if(n.s) br.append(ebtn("여기부터 재생","",()=>{ const k=STOPS.findIndex(x=>x.leg===li&&x.node===i); exitEdit(true); startTour(Math.max(0,k)); }));
        box.append(br); editP.append(box); }
      editP.append(el("h4",null,"멈춤 구간 ("+(fl==="4F"?"4층":"3층")+")"));
      const lst=el("div","t3-elist"); L.nodes.forEach((x,i)=>{ if(!x.s) return; lst.append(ebtn((STOPS.findIndex(s=>s.leg===li&&s.node===i)+1)+". "+(x.s.t||"멈춤"),ed.sel&&ed.sel.i===i?"on":"",()=>{ ed.sel={leg:li,i}; drawHelpers(); renderEditPanel(); })); });
      editP.append(lst);
    }
    const f=el("div","t3-erow t3-efoot");
    const sv=ebtn(ed.dirty?"저장하기 •":"저장됨","primary",saveTour); sv.id="t3EdSave"; sv.disabled=!ed.dirty; f.append(sv);
    f.append(ebtn("저장한 대로 되돌리기","",()=>{ ed.dirty=false; ed.sel=null; TOURDATA=clone(validLegs(D.tour3d)?D.tour3d:DEFAULT_LEGS); rebuildTour(); drawHelpers(); renderEditPanel(); note("마지막 저장 상태로 돌렸어요."); }));
    f.append(ebtn("처음 동선으로","",()=>{ TOURDATA=clone(DEFAULT_LEGS); ed.sel=null; markDirty(); renderEditPanel(); note("처음 동선을 불러왔어요. 저장해야 반영돼요."); }));
    editP.append(f);
  }
  const m=el("p","t3-emsg",ed.msg); m.id="t3EdMsg"; editP.append(m);
  editP.append(el("p","t3-ehelp small","저장하면 보드를 여는 팀원 모두에게 똑같이 보여요."));
}
function setHint(){ hintEl.textContent=!ed.on?HINT:
  ed.tab==="item"?"물품 끌기: 옮기기 · 누르기: 고르기 · R: 돌리기 · 빈 곳 드래그: 화면 이동":
  ed.tab==="wall"?(ed.tool==="draw"?"바닥 두 번 누르기: 가벽 세우기 · 드래그: 화면 이동 · 휠: 확대":"가벽 누르기: 고르기 · 드래그: 화면 이동"):"점 끌기: 옮기기 · 선 누르기: 점 추가 · 드래그: 화면 이동"; }
function enterEdit(){
  if(ui.tour) stopTour(true); if(ui.walk) stopWalk();
  if(ui.floor==="both") setFloor("4F");
  ed.on=true; ed.msg=""; select(null);
  legend.hidden=true; editP.hidden=false;
  controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN}; controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_PAN};
  buildToolbar(); setView("top"); renderCustomWalls(); drawHelpers(); renderEditPanel(); setHint();
}
function exitEdit(keep){
  if(keep!==true&&ed.dirty&&!ed.discardArmed){ ed.discardArmed=true; note("저장 안 한 동선 변경이 있어요. 저장하거나, 한 번 더 누르면 버려요."); renderEditPanel(); return; }
  if(keep!==true&&ed.dirty){ ed.dirty=false; TOURDATA=clone(validLegs(D.tour3d)?D.tour3d:DEFAULT_LEGS); rebuildTour(); }
  if(ed.item) selectItem(null);
  ed.on=false; ed.a=null; ed.sel=null; ed.selWall=null; ed.lookPick=false; ed.discardArmed=false; editP.hidden=true; legend.hidden=false;
  controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN}; controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  clearHelpers(); renderCustomWalls(); setHint(); buildToolbar(); setView("iso");
}

/* ---------- 만들기 ---------- */
function build(){
  root=el("div","t3");
  toolbar=el("div","t3-bar"); root.append(toolbar);
  stage=el("div","t3-stage"); root.append(stage);
  cv=el("canvas"); cv.setAttribute("aria-label","3D 배치도"); stage.append(cv);
  labels=el("div","t3-labels"); stage.append(labels);
  legend=el("aside","t3-float t3-legend"); stage.append(legend);
  editP=el("aside","t3-float t3-editp"); editP.hidden=true; editP.setAttribute("aria-label","편집"); stage.append(editP);
  card=el("aside","t3-float t3-card"); card.hidden=true; card.setAttribute("aria-live","polite"); stage.append(card);
  hintEl=el("div","t3-hint",HINT); stage.append(hintEl);
  exitBtn=el("button","btn primary t3-exitwalk","걸어보기 끝내기"); exitBtn.type="button"; exitBtn.hidden=true; exitBtn.onclick=stopWalk; stage.append(exitBtn);
  padEl=el("div","t3-pad"); padEl.hidden=true; padEl.setAttribute("aria-label","걷기 조종");
  [["up","fwd","▲","앞으로"],["lt","left","◀","왼쪽"],["dn","back","▼","뒤로"],["rt","right","▶","오른쪽"]].forEach(([c,k,a,t])=>{
    const b=el("button","t3-pb "+c); b.type="button"; b.setAttribute("aria-label",t); b.append(a,el("small",null,t));
    const on=e=>{ e.preventDefault(); walk.keys.add(k); walk.target=null; capture(b,e); }, off=()=>walk.keys.delete(k);
    b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("lostpointercapture",off);
    b.addEventListener("contextmenu",e=>e.preventDefault()); padEl.append(b); });
  stage.append(padEl);

  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(42,1,.1,500);
  controls=new THREE.OrbitControls(camera,cv);
  controls.enableDamping=true; controls.maxPolarAngle=Math.PI*.49; controls.minDistance=4; controls.maxDistance=140;
  controls.addEventListener("change",draw);
  scene.add(new THREE.HemisphereLight(0xFFF8EE,0x7D857F,.8));
  const sun=new THREE.DirectionalLight(0xffffff,.75); sun.position.set(-20,40,18); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:120}); scene.add(sun);
  makeMats(); makeWorldMats();
  ["4F","3F"].forEach(fl=>{ buildFloor(fl); buildOcc(fl); });
  rebuildTour(); buildTourUI();
  eRay=new THREE.Raycaster(); eM=new THREE.Vector2(); ePlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);

  // 누르기: 상세 / 걸어보기에선 바닥 누르면 그 자리로 / 편집 중엔 편집
  const ray=new THREE.Raycaster(), mouse=new THREE.Vector2(); let down=null;
  cv.addEventListener("pointerdown",e=>{ down=[e.clientX,e.clientY];
    if(ed.on){ edDown(e); return; }
    if(ui.tour){ tour.drag=[e.clientX,e.clientY,tour.offYaw,tour.offPitch]; capture(cv,e); }
    else if(ui.walk){ walk.drag=[e.clientX,e.clientY,walk.yaw,walk.pitch]; capture(cv,e); } });
  cv.addEventListener("pointermove",e=>{
    if(ed.on){ edMove(e); return; }
    if(ui.tour&&tour.drag){ const d=tour.drag; tour.offYaw=d[2]-(e.clientX-d[0])*.005; tour.offPitch=Math.max(-.9,Math.min(.8,d[3]-(e.clientY-d[1])*.004)); place(); }
    else if(ui.walk&&walk.drag){ const d=walk.drag; walk.yaw=d[2]-(e.clientX-d[0])*.005; walk.pitch=Math.max(-1.1,Math.min(.9,d[3]-(e.clientY-d[1])*.004)); applyLook(); draw(); } }); // 끄는 쪽으로 고개가 돌아가요
  cv.addEventListener("pointerup",e=>{
    if(ed.on){ edUp(e); return; }
    walk.drag=null; tour.drag=null;
    if(ui.tour) return;
    if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5) return;
    const r=cv.getBoundingClientRect(); mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObjects(pickables.filter(p=>p.visible&&p.parent.parent.visible),true)[0];
    if(ui.walk&&!hit){ const fh=ray.intersectObjects(floorMeshes.filter(m=>m.parent.parent.visible),false)[0]; if(fh) walk.target=new THREE.Vector3(fh.point.x,EYE,fh.point.z); return; }
    if(hit) select(hit.object.userData.root.userData.marker.id); else select(null); });
  addEventListener("keydown",e=>{ if(!keyOk(e)) return;
    if(ed.on){ if(e.key==="Escape"){ if(ed.a){ ed.a=null; ed.hover=null; drawHelpers(); renderEditPanel(); } else if(ed.lookPick){ ed.lookPick=false; renderEditPanel(); } else if(ed.item) selectItem(null); }
      else if(ed.tab==="item"&&ed.item&&(e.key==="r"||e.key==="R")){ rotateItem(e.shiftKey?-15:15); e.preventDefault(); } return; }
    if(ui.tour){ if(e.key===" "){ TE.play.click(); e.preventDefault(); } else if(e.key==="ArrowRight"){ TE.next.click(); e.preventDefault(); } else if(e.key==="ArrowLeft"){ TE.prev.click(); e.preventDefault(); } else if(e.key==="Escape") stopTour(); return; }
    const k=KEYMAP[e.key.toLowerCase()];
    if(ui.walk&&k){ walk.keys.add(k); walk.target=null; e.preventDefault(); }
    else if(ui.walk&&e.key==="Escape") stopWalk(); });
  addEventListener("keyup",e=>{ const k=KEYMAP[e.key.toLowerCase()]; if(k) walk.keys.delete(k); });
  addEventListener("blur",()=>walk.keys.clear());
  new ResizeObserver(resize).observe(stage);
  const mq=matchMedia("(prefers-color-scheme: dark)"); if(mq.addEventListener) mq.addEventListener("change",()=>{ if(makeMats()) draw(); });
  new MutationObserver(()=>{ if(makeMats()) draw(); }).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  buildToolbar();
}

/* ---------- 그리기 ---------- */
function resize(){ const r=stage.getBoundingClientRect(); if(!r.width) return; renderer.setSize(r.width,r.height,false); camera.aspect=r.width/Math.max(1,r.height); camera.updateProjectionMatrix(); draw(); }
let v3=null;
function placeTags(){
  const r=cv.getBoundingClientRect(); v3=v3||new THREE.Vector3();
  editTags.forEach(t=>{ t.obj.getWorldPosition(v3); v3.y+=t.y; v3.project(camera); const off=v3.z>1;
    t.el.hidden=off; if(!off){ t.el.style.left=((v3.x+1)/2*r.width)+"px"; t.el.style.top=((1-v3.y)/2*r.height)+"px"; } });
  tags.forEach(t=>{ const show=ui.tags&&t.obj.visible&&t.obj.parent.parent.visible;
    if(!show){ t.el.hidden=true; return; }
    t.obj.getWorldPosition(v3); v3.y+=t.y; v3.project(camera);
    if(v3.z>1){ t.el.hidden=true; return; }
    t.el.hidden=false; t.el.style.left=((v3.x+1)/2*r.width)+"px"; t.el.style.top=((1-v3.y)/2*r.height)+"px"; });
}
function draw(){ if(!raf&&renderer) raf=requestAnimationFrame(()=>{ raf=0; renderer.render(scene,camera); placeTags(); }); }
function loop(t){
  if(!root||!document.body.contains(root)){ loopOn=false; walk.keys.clear(); return; }
  const dt=Math.min(.05,Math.max(0,(t-lastT)/1000)); lastT=t;
  if(ui.tour) tourStep(dt); else if(ui.walk) walkStep(dt); else if(controls.update()) draw();
  requestAnimationFrame(loop);
}

window.Board3D={
  mount(host,a){
    api=a; if(!root) build();
    if(root.parentNode!==host) host.append(root);
    if(!loopOn){ loopOn=true; lastT=performance.now(); requestAnimationFrame(loop); }
    sync(a.data());
    resize(); if(!ui.viewSet){ ui.viewSet=true; layoutFloors(); setView("iso"); }
  },
  select(id){ if(root) select(id); }
};
})();
