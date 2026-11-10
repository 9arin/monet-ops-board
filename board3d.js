/* MONET 100 운영 보드 · 3D 보기
   배치도(state.markers)·인력 배정·물품을 그대로 읽어서 3D로 그려요. 보드가 다시 그려질 때마다 sync()로 바뀐 점만 반영.
   three.js r128 + OrbitControls 는 보드가 3D 탭을 처음 열 때 불러와요. */
(function(){
"use strict";
const WALLS={"4F":{"gw":400,"gh":268,"boxes":[[118,20,1,1],[262,20,1,1],[117,21,2,1],[261,21,3,2],[49,23,3,8],[261,23,2,17],[19,24,3,5],[14,29,8,2],[14,31,7,1],[285,51,2,1],[14,52,8,3],[49,52,2,1],[285,52,3,4],[49,53,3,7],[19,55,3,7],[286,56,2,1],[351,60,3,7],[361,60,4,5],[278,61,4,1],[277,62,6,2],[361,65,11,2],[352,67,2,1],[362,67,10,1],[93,68,5,1],[92,69,6,1],[319,69,2,1],[52,70,6,25],[93,70,5,1],[318,70,3,4],[146,71,4,2],[233,71,5,1],[234,72,4,1],[334,72,4,2],[319,74,2,1],[129,75,3,7],[144,75,2,1],[239,75,1,1],[254,75,3,7],[143,76,3,6],[238,76,2,6],[130,82,2,1],[254,82,2,1],[334,83,3,1],[334,84,4,1],[334,85,3,1],[129,86,3,7],[147,86,1,1],[241,86,1,1],[254,86,3,7],[146,87,3,6],[240,87,2,6],[296,87,2,1],[295,88,3,10],[314,88,3,10],[361,88,12,2],[361,90,11,1],[361,91,4,7],[130,93,2,1],[254,93,2,1],[242,94,1,1],[242,95,2,1],[296,98,2,1],[297,99,1,1],[11,104,2,11],[106,104,8,6],[151,104,8,6],[201,104,8,6],[238,104,7,7],[84,108,19,3],[107,110,7,1],[152,110,6,1],[202,110,6,1],[100,111,3,30],[12,115,1,1],[317,120,3,5],[318,125,2,1],[326,125,1,1],[325,126,2,6],[12,141,1,1],[11,142,2,7],[333,152,1,1],[12,153,1,1],[332,153,2,1],[11,154,3,1],[11,155,2,9],[100,162,3,30],[329,162,2,1],[330,163,1,1],[84,192,19,3],[107,192,6,1],[152,192,6,1],[202,192,7,1],[238,192,7,7],[11,193,2,4],[106,193,8,6],[151,193,8,6],[201,193,8,6],[12,197,1,1],[11,198,3,1],[346,198,1,1],[12,199,1,1],[345,199,2,2],[346,203,1,1],[15,204,31,1],[52,204,6,12],[345,204,2,1],[11,205,2,7],[14,205,32,1],[14,206,2,37],[44,206,2,19],[12,212,1,1],[52,216,5,1],[79,218,5,13],[137,218,2,1],[172,218,3,22],[208,218,2,1],[274,218,5,1],[301,218,41,2],[137,219,3,21],[208,219,3,21],[274,219,6,12],[301,220,2,5],[339,220,3,1],[339,221,2,4],[338,226,1,1],[338,227,2,1],[337,228,3,2],[12,229,1,1],[11,230,2,16],[337,230,2,3],[44,232,2,11],[301,232,2,11],[336,233,3,1],[336,234,2,3],[335,237,3,2],[335,239,2,3],[103,240,142,1],[102,241,143,2],[334,242,3,1],[14,243,32,2],[301,243,35,3],[15,245,31,1],[11,246,4,1],[42,246,3,2],[50,246,2,2],[294,246,2,3],[301,246,3,3],[333,246,2,1],[12,247,4,1],[327,247,8,2]]},"3F":{"gw":400,"gh":268,"boxes":[[133,30,2,2],[151,30,3,1],[171,30,3,2],[190,30,3,1],[210,30,3,2],[229,30,3,1],[249,30,2,3],[125,31,1,1],[152,31,2,1],[191,31,2,2],[230,31,2,1],[257,31,2,5],[125,32,2,4],[133,32,1,1],[152,32,1,1],[172,32,1,1],[211,32,1,1],[230,32,1,1],[149,73,3,2],[235,73,2,1],[234,74,3,1],[149,75,4,1],[233,75,4,1],[151,76,2,7],[233,76,3,6],[234,82,1,1],[334,83,2,1],[335,84,1,1],[151,86,2,8],[233,86,3,7],[86,90,7,2],[86,93,7,2],[234,93,1,1],[103,126,31,2],[150,126,127,3],[291,126,5,3],[104,128,9,1],[114,128,20,1],[108,129,2,1],[120,129,14,1],[150,129,126,1],[292,129,3,1],[107,130,3,2],[131,130,3,2],[150,130,3,18],[270,130,3,47],[106,132,3,2],[105,134,3,2],[105,136,2,1],[212,136,2,3],[104,137,3,2],[104,139,2,1],[103,140,3,2],[102,142,3,3],[131,144,2,1],[102,145,2,1],[131,145,3,2],[194,145,66,2],[101,146,3,2],[131,147,15,2],[198,147,2,1],[100,148,3,1],[149,148,4,4],[99,149,4,4],[140,149,4,1],[141,150,3,3],[150,152,3,43],[194,152,2,44],[100,153,2,1],[142,153,2,2],[99,154,3,4],[142,155,3,4],[99,158,2,2],[143,159,2,3],[98,160,3,7],[143,162,3,10],[98,167,2,13],[231,170,2,2],[144,172,2,1],[143,173,3,13],[270,177,8,4],[290,177,6,4],[98,180,3,7],[168,180,2,2],[270,181,3,48],[143,186,2,2],[99,187,2,2],[142,188,3,4],[99,189,3,4],[142,192,2,2],[100,193,2,1],[100,194,3,2],[141,194,3,3],[150,195,2,1],[141,197,2,1],[140,198,3,3],[140,201,2,1],[139,202,3,2],[202,202,43,2],[252,202,8,2],[139,204,2,1],[150,204,3,14],[250,204,3,36],[138,205,3,2],[138,207,2,1],[137,208,3,2],[136,210,3,3],[135,213,3,2],[134,215,3,2],[133,217,3,1],[102,218,4,2],[117,218,24,2],[148,218,5,1],[147,219,6,1],[150,220,3,3],[262,221,2,2],[150,223,2,1],[224,223,2,2],[133,230,3,1],[134,231,1,1],[150,236,3,4],[102,240,194,3],[103,243,192,1]]}}; // 도면의 회색 벽체·기둥에서 뽑은 상자 (400×268 격자)
const MPP={"4F":0.026,"3F":0.029}; // 도면 1px당 m (치수선 기준 근사)
const IMG_W=1600, IMG_H=1075, GAP=7, WALL_H=2.6, LOW_H=0.9;
const KINDS=["staff","stanchion","exhibit","pop","desk","chair","sticker","caution"];
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}}, lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const kstDay=(()=>{const d=new Date(Date.now()+9*3600e3).getUTCDay(); return (d+6)%7;})();
const el=(tag,cls,text)=>{const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e;};

let api=null, root, stage, cv, labels, legend, card, toolbar, renderer, scene, camera, controls, sun, wallMat, mats={}, extraMats;
const ui={floor:lsGet("m3d-floor")||"4F", day:kstDay, hidden:new Set(), tags:lsGet("m3d-tags")!=="0", low:lsGet("m3d-low")==="1", sel:null, viewSet:false};
if(!["4F","3F","both"].includes(ui.floor)) ui.floor="4F";
const floors={}; let pickables=[], tags=[], sig="", colorSig="", D=null, loopOn=false, raf=0;

function css(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function isDark(){ const c=new THREE.Color(css("--bg")||"#f3f4f2"); return (c.r*.3+c.g*.59+c.b*.11)<.45; }
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.05},o||{}));

function makeMats(){
  const cs={}; KINDS.forEach(k=>cs[k]=css("--t-"+k)||"#888"); cs.stage=css("--soft"); cs.bad=css("--bad"); cs.warn=css("--warn"); cs.muted=css("--muted");
  const s=JSON.stringify(cs)+isDark(); if(s===colorSig) return false; colorSig=s;
  KINDS.forEach(k=>{ if(mats[k]) mats[k].color.set(cs[k]); else mats[k]=M(cs[k]); });
  // 의자는 어두운 화면에서 밝은 색 토큰이라 3D에선 늘 진한 회색으로
  mats.chair.color.set(isDark()?"#9aa6a3":"#2b2b2b");
  if(!extraMats) extraMats={cover:M(cs.warn),empty:M(cs.bad),none:M(cs.muted),skin:M(0xF1D2B6),belt:M(0x1F1F1F),steel:M(0xB8BEC2,{metalness:.6,roughness:.35})};
  else { extraMats.cover.color.set(cs.warn); extraMats.empty.color.set(cs.bad); extraMats.none.color.set(cs.muted); }
  if(renderer) renderer.setClearColor(new THREE.Color(cs.stage||"#e9ecea"));
  if(wallMat) wallMat.color.set(isDark()?0x56625D:0xF4F1EC);
  return true;
}

function build(){
  root=el("div","t3"); 
  toolbar=el("div","t3-bar"); root.append(toolbar);
  stage=el("div","t3-stage"); root.append(stage);
  cv=el("canvas"); cv.setAttribute("aria-label","3D 배치도"); stage.append(cv);
  labels=el("div","t3-labels"); stage.append(labels);
  legend=el("aside","t3-float t3-legend"); stage.append(legend);
  card=el("aside","t3-float t3-card"); card.hidden=true; card.setAttribute("aria-live","polite"); stage.append(card);
  stage.append(el("div","t3-hint","드래그: 회전 · 오른쪽 드래그(두 손가락): 이동 · 휠/핀치: 확대 · 누르기: 상세"));

  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(42,1,.1,500);
  controls=new THREE.OrbitControls(camera,cv);
  controls.enableDamping=true; controls.maxPolarAngle=Math.PI*.49; controls.minDistance=4; controls.maxDistance=140;
  controls.addEventListener("change",draw);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8a948f,.85));
  sun=new THREE.DirectionalLight(0xffffff,.75); sun.position.set(-20,40,18); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:120}); scene.add(sun);
  wallMat=M(0xF4F1EC,{roughness:.9});
  makeMats();
  ["4F","3F"].forEach(buildFloor);

  // 누르면 상세
  const ray=new THREE.Raycaster(), mouse=new THREE.Vector2(); let down=null;
  cv.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY];});
  cv.addEventListener("pointerup",e=>{
    if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5) return;
    const r=cv.getBoundingClientRect(); mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObjects(pickables.filter(p=>p.visible&&p.parent.visible),true)[0];
    if(hit) select(hit.object.userData.root.userData.marker.id); else select(null);
  });
  new ResizeObserver(resize).observe(stage);
  const mq=matchMedia("(prefers-color-scheme: dark)"); if(mq.addEventListener) mq.addEventListener("change",()=>{ if(makeMats()) draw(); });
  new MutationObserver(()=>{ if(makeMats()) draw(); }).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  buildToolbar();
}

function buildFloor(fl){
  const g=new THREE.Group(); g.name=fl;
  const s=MPP[fl], W=IMG_W*s, H=IMG_H*s;
  const tex=new THREE.TextureLoader().load("img/"+fl+".jpg",draw);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy(); tex.encoding=THREE.sRGBEncoding;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({map:tex,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const slab=new THREE.Mesh(new THREE.BoxGeometry(W,.25,H),M(0xCBD3CE)); slab.position.y=-.13; g.add(slab);
  const wb=WALLS[fl], cell=(IMG_W/wb.gw)*s;
  const walls=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),wallMat,wb.boxes.length);
  walls.castShadow=true; walls.receiveShadow=true; walls.userData.cell=cell; walls.userData.W=W; walls.userData.H=H; walls.userData.boxes=wb.boxes;
  g.add(walls); g.userData.walls=walls;
  const marks=new THREE.Group(); g.add(marks); g.userData.marks=marks;
  floors[fl]={group:g,W,H}; scene.add(g);
}
function wallHeights(){
  const h=ui.low?LOW_H:WALL_H, m4=new THREE.Matrix4(), q=new THREE.Quaternion();
  for(const fl in floors){ const w=floors[fl].group.userData.walls, c=w.userData.cell;
    w.userData.boxes.forEach((b,i)=>{ const bw=b[2]*c, bd=b[3]*c; m4.compose(new THREE.Vector3(b[0]*c+bw/2-w.userData.W/2,h/2,b[1]*c+bd/2-w.userData.H/2),q,new THREE.Vector3(bw,h,bd)); w.setMatrixAt(i,m4); });
    w.instanceMatrix.needsUpdate=true; }
}
const toWorld=(fl,x,y)=>{const s=MPP[fl]; return new THREE.Vector3((x/100*IMG_W-IMG_W/2)*s,0,(y/100*IMG_H-IMG_H/2)*s);};

function post(mat,h){
  const p=new THREE.Group(), st=extraMats.steel;
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.04,20),st); base.position.y=.02;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,h,12),st); pole.position.y=h/2;
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.08,12),mat); cap.position.y=h;
  [base,pole,cap].forEach(o=>{o.castShadow=true;p.add(o);}); return p;
}
function makeMarker(m){
  const fl=m.floor, g=new THREE.Group(); g.position.copy(toWorld(fl,+m.x||0,+m.y||0));
  const q=Math.max(1,Math.min(60,Math.round(+m.qty||1))), t=m.type;
  g.userData={marker:m,type:t};
  if(t==="staff"){
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,1.1,20),mats.staff); body.position.y=.55;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),extraMats.skin); head.position.y=1.32;
    const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.55,32),new THREE.MeshBasicMaterial({color:mats.staff.color,side:THREE.DoubleSide,transparent:true,opacity:.55}));
    ring.rotation.x=-Math.PI/2; ring.position.y=.02;
    [body,head].forEach(o=>{o.castShadow=true;g.add(o);}); g.add(ring); g.userData.body=body;
    const tag=el("div","t3-tag"); labels.append(tag); tags.push({el:tag,obj:g,y:1.75});
  } else if(t==="stanchion"||t==="exhibit"){
    if(/곡벽|세로/.test(m.label||"")) g.rotation.y=Math.PI/2;
    const gap=.6, h=t==="exhibit"?.8:.95, x0=-(q-1)*gap/2;
    for(let i=0;i<q;i++){ const p=post(mats[t],h); p.position.x=x0+i*gap; g.add(p); }
    if(q>1){ const belt=new THREE.Mesh(new THREE.BoxGeometry((q-1)*gap,.05,.012),t==="exhibit"?mats.exhibit:extraMats.belt); belt.position.y=h-.06; g.add(belt); }
  } else if(t==="pop"){
    for(let i=0;i<q;i++){ const s=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.2,10),extraMats.steel); pole.position.y=.6;
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.6,.85,.03),mats.pop); panel.position.y=1.35;
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.03,20),extraMats.steel); base.position.y=.015;
      [pole,panel,base].forEach(o=>{o.castShadow=true;s.add(o);}); s.position.x=(i-(q-1)/2)*.8; g.add(s); }
  } else if(t==="desk"){
    for(let i=0;i<q;i++){ const d=new THREE.Mesh(new THREE.BoxGeometry(1.4,.74,.6),mats.desk); d.position.set((i-(q-1)/2)*1.45,.37,0); d.castShadow=true; g.add(d); }
  } else if(t==="chair"){
    const cols=Math.min(6,q), sp=.55, rows=Math.ceil(q/cols);
    for(let i=0;i<q;i++){ const c=new THREE.Group();
      const seat=new THREE.Mesh(new THREE.BoxGeometry(.42,.05,.42),mats.chair); seat.position.y=.45;
      const back=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.04),mats.chair); back.position.set(0,.68,-.19);
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.45,8),extraMats.steel); leg.position.y=.225;
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
  g.traverse(o=>{ if(o.isMesh) o.userData.root=g; });
  pickables.push(g); return g;
}

/* ---------- 보드 데이터와 맞추기 ---------- */
function rebuildMarkers(){
  pickables=[]; tags.forEach(t=>t.el.remove()); tags=[];
  for(const fl in floors){ const mk=floors[fl].group.userData.marks; while(mk.children.length) mk.remove(mk.children[0]); }
  D.markers.forEach(m=>{ if(!floors[m.floor]) return; const g=makeMarker(m); if(g) floors[m.floor].group.userData.marks.add(g); });
}
function staffOf(m){ const w=D.week[m.id]; return w?{w:w[ui.day],slot:D.slots[m.id]||{}}:null; }
function refreshStaff(){
  tags.forEach(t=>{ const m=t.obj.userData.marker, s=staffOf(m);
    const kind=!s?"none":!s.w||!s.w.c?"empty":s.w.k==="cover"?"cover":"main";
    t.obj.userData.body.material=kind==="main"?mats.staff:extraMats[kind];
    t.el.className="t3-tag "+kind; t.el.textContent="";
    t.el.append((s&&s.slot.name)||m.label||"근무 자리");
    if(s){ const sm=el("small",null,s.w&&s.w.c?s.w.c+(kind==="cover"?" 대타":""):"공석"); t.el.append(sm); }
  });
}
function sync(data){
  D=data;
  const ns=JSON.stringify(D.markers.map(m=>[m.id,m.floor,m.type,m.x,m.y,m.qty,m.glyph,m.label]));
  if(ns!==sig){ sig=ns; rebuildMarkers(); applyVisibility(); }
  refreshStaff(); buildLegend(); buildToolbar();
  if(ui.sel){ if(D.markers.some(m=>m.id===ui.sel)) showCard(ui.sel); else select(null); }
  draw();
}

/* ---------- 화면 ---------- */
function layoutFloors(){
  const both=ui.floor==="both";
  for(const fl in floors){ const g=floors[fl].group; g.visible=both||ui.floor===fl; g.position.y=both&&fl==="4F"?GAP:0; }
}
function applyVisibility(){
  pickables.forEach(g=>{ g.visible=!ui.hidden.has(g.userData.type); });
  wallHeights(); layoutFloors();
}
function setView(kind){
  const both=ui.floor==="both", f=floors[both?"4F":ui.floor];
  const cy=both?GAP/2:0, span=Math.max(f.W,f.H)*(camera.aspect<1?Math.min(1.9,1/camera.aspect)*.95:1);
  controls.target.set(0,cy,0);
  if(kind==="top") camera.position.set(0,cy+span*1.05,.01); else camera.position.set(-span*.38,cy+span*(both?.78:.62),span*.62);
  controls.update(); draw();
}
function segBtns(list,cur,on){ const s=el("div","seg"); s.setAttribute("role","group"); list.forEach(([k,n])=>{ const b=el("button",null,n); b.type="button"; b.setAttribute("aria-pressed",String(cur===k)); b.onclick=()=>on(k); s.append(b); }); return s; }
function buildToolbar(){
  toolbar.textContent="";
  const f=el("div","t3-ctl"); f.append(el("span","small muted","층"), segBtns([["4F","4층"],["3F","3층"],["both","두 층"]],ui.floor,k=>{ ui.floor=k; lsSet("m3d-floor",k); select(null); layoutFloors(); buildToolbar(); buildLegend(); setView("iso"); }));
  const d=el("div","t3-ctl"); d.append(el("span","small muted","요일"), segBtns((D?D.days:["월","화","수","목","금","토","일"]).map((n,i)=>[i,n]),ui.day,k=>{ ui.day=k; refreshStaff(); buildToolbar(); if(ui.sel) showCard(ui.sel); draw(); }));
  const v=el("div","t3-ctl t3-tools");
  const btn=(t,fn,pressed)=>{ const b=el("button","btn small",t); b.type="button"; if(pressed!=null) b.setAttribute("aria-pressed",String(pressed)); b.onclick=fn; v.append(b); };
  btn("위에서",()=>setView("top")); btn("비스듬히",()=>setView("iso"));
  btn("이름표",()=>{ ui.tags=!ui.tags; lsSet("m3d-tags",ui.tags?"1":"0"); buildToolbar(); draw(); },ui.tags);
  btn("벽 낮추기",()=>{ ui.low=!ui.low; lsSet("m3d-low",ui.low?"1":"0"); wallHeights(); buildToolbar(); draw(); },ui.low);
  toolbar.append(f,d,v);
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
  if(id) showCard(id); else { card.hidden=true; }
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

/* ---------- 그리기 ---------- */
function resize(){ const r=stage.getBoundingClientRect(); if(!r.width) return; renderer.setSize(r.width,r.height,false); camera.aspect=r.width/Math.max(1,r.height); camera.updateProjectionMatrix(); draw(); }
const v3=new THREE.Vector3();
function placeTags(){
  const r=cv.getBoundingClientRect();
  tags.forEach(t=>{ const show=ui.tags&&t.obj.visible&&t.obj.parent.parent.visible;
    if(!show){ t.el.hidden=true; return; }
    t.obj.getWorldPosition(v3); v3.y+=t.y; v3.project(camera);
    if(v3.z>1){ t.el.hidden=true; return; }
    t.el.hidden=false; t.el.style.left=((v3.x+1)/2*r.width)+"px"; t.el.style.top=((1-v3.y)/2*r.height)+"px"; });
}
function draw(){ if(!raf&&renderer) raf=requestAnimationFrame(()=>{ raf=0; renderer.render(scene,camera); placeTags(); }); }
function loop(){ if(!root||!document.body.contains(root)){ loopOn=false; return; } if(controls.update()) draw(); requestAnimationFrame(loop); }

window.Board3D={
  mount(host,a){
    api=a; if(!root) build();
    if(root.parentNode!==host) host.append(root);
    if(!loopOn){ loopOn=true; requestAnimationFrame(loop); }
    sync(a.data());
    resize(); if(!ui.viewSet){ ui.viewSet=true; layoutFloors(); setView("iso"); }
  },
  select(id){ if(root) select(id); }
};
})();
