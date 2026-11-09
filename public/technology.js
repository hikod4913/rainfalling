'use strict';
(() => {
const root=document.documentElement,sections=magicSections,magic=$('#magic');
let entered=false,activePage=0,visit=0,transitionToken=0,running=false,ready=false,settleTimer,fxPreviewIndex=0;
const cover=$('#home'),header=$('header'),pages=[cover,...sections];
root.classList.add('paged');
new ResizeObserver(()=>root.style.setProperty('--page-header',header.offsetHeight+'px')).observe(header);
const contentAnimations=new WeakMap(),decodeFrames=new WeakMap();
// Preserve layout while keeping unvisited chapter content and controls truly hidden.
sections.forEach((section,i)=>{
 const shell=document.createElement('div');shell.className='stage-content';
 [...section.childNodes].forEach(n=>shell.append(n));section.append(shell);
 section.classList.add('memory-stage');section.dataset.stage=i;section.dataset.entrance=magicInfo[i][2];
 setHidden(i,true);
});
function stopDecode(heading){const state=decodeFrames.get(heading);if(state){cancelAnimationFrame(state.frame);heading.innerHTML=state.original;heading.classList.remove('decoding');decodeFrames.delete(heading)}}
document.addEventListener('page-copy-edit',event=>stopDecode(event.target));
function decodeHeading(heading){if(!heading||reduced.matches||!fxEnabled)return;stopDecode(heading);const original=heading.innerHTML,text=heading.textContent,start=performance.now(),chars='01◈◇░▒#<>/';const state={original,frame:0};heading.setAttribute('aria-label',text);heading.classList.add('decoding');function frame(t){const progress=Math.min(1,(t-start)/320);heading.textContent=[...text].map((c,i)=>/\s/.test(c)||i<text.length*progress?c:chars[(Math.floor(t/50)+i)%chars.length]).join('');if(progress<1){state.frame=requestAnimationFrame(frame)}else{heading.innerHTML=original;heading.classList.remove('decoding');decodeFrames.delete(heading)}}decodeFrames.set(heading,state);state.frame=requestAnimationFrame(frame)}
function setHidden(i,hidden){const section=sections[i],shell=section.querySelector('.stage-content');section.classList.toggle('awaiting-memory',hidden);shell.inert=hidden;if(hidden)shell.setAttribute('aria-hidden','true');else shell.removeAttribute('aria-hidden')}
function reveal(i,animate=true){const section=sections[i],shell=section.querySelector('.stage-content');setHidden(i,false);section.classList.remove('content-revealing');section.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));if(!animate||reduced.matches||!fxEnabled)return;
 const old=contentAnimations.get(section);if(old)clearTimeout(old);void shell.offsetWidth;section.classList.add('content-revealing');decodeHeading(section.querySelector('h2'));contentAnimations.set(section,setTimeout(()=>section.classList.remove('content-revealing'),650));}
function resetTransitions(){
 transitionToken++;
 running=false;
 ready=false;
 magic.classList.remove('play');
 updateScroll();
}

function setNav(i){
 $$('#main-nav a').forEach(a=>{
  const selected=!!sections[i]&&a.hash==='#'+sections[i].id;
  a.classList.toggle('active',selected);
  if(selected)a.setAttribute('aria-current','location');
  else a.removeAttribute('aria-current');
 });
}

async function playSigil(i){
 running=true;
 const token=++transitionToken,startedVisit=visit;
 const info=magicInfo[i];
 sections[i].querySelectorAll('h2').forEach(stopDecode);
 magic.dataset.effect=info[2];
 magic.style.setProperty('--fx',info[3]);
 $('#magic-name').textContent=info[0];
 $('#magic-sub').textContent=info[1];
 $('#magic-svg').innerHTML=sigil(i);
 const particleCount=24;
 $('.magic-particles').innerHTML=Array.from({length:particleCount},(_,j)=>{
  const angle=j/particleCount*Math.PI*2,radius=180+(j%4)*35;
  return `<i class="magic-spark" style="--x:${Math.cos(angle)*radius}px;--y:${Math.sin(angle)*radius}px"></i>`;
 }).join('');
 void magic.offsetWidth;
 magic.classList.add('play');
 // Wait for the veil and every moving part of the sigil to finish.
 await Promise.allSettled(magic.getAnimations({subtree:true}).map(animation=>animation.finished));
 if(token!==transitionToken)return;
 magic.classList.remove('play');
 running=false;
 ready=startedVisit===visit;
 if(settleTimer===undefined)updateScroll();
}

function updateScroll(){
 if(!entered||document.querySelector('dialog[open]'))return;
 // The visible sliver of a neighboring page is still outside its snap position.
 const page=pages.findIndex(section=>Math.abs(section.getBoundingClientRect().top)<=2);
 if(page===-1)return;
 if(page!==activePage){
  if(activePage>0){
   const previous=sections[activePage-1];
   setHidden(activePage-1,true);
   previous.querySelectorAll('h2').forEach(stopDecode);
   previous.classList.remove('content-revealing');
   clearTimeout(contentAnimations.get(previous));
  }
  if(page>0)sections[page-1].dataset.flip=page>activePage?'forward':'back';
  activePage=page;
  visit++;
  ready=false;
  setNav(page-1);
  $('.scroll-progress').style.transform=`scaleX(${page/(pages.length-1)})`;
  header.classList.toggle('scrolled',page>0);
  sections.at(-1).classList.toggle('farewell-in-view',page===pages.length-1);
 }
 const stage=sections[page-1];
 if(!stage?.classList.contains('awaiting-memory'))return;
 if(!fxEnabled||reduced.matches)reveal(page-1,false);
 else if(ready)reveal(page-1,true);
 else if(!running)playSigil(page-1);
}

function scheduleScrollCheck(){
 clearTimeout(settleTimer);
 settleTimer=setTimeout(()=>{
  settleTimer=undefined;
  updateScroll();
 },90);
}
addEventListener('scroll',scheduleScrollCheck,{passive:true});
addEventListener('resize',scheduleScrollCheck);
$$('dialog').forEach(dialog=>dialog.addEventListener('close',scheduleScrollCheck));
$('#fx-toggle').onclick=()=>{fxEnabled=!fxEnabled;$('#fx-toggle').textContent='魔法特效：'+(fxEnabled?'開':'關');$('#fx-toggle').setAttribute('aria-pressed',fxEnabled);if(!fxEnabled)resetTransitions();toast(fxEnabled?'中央魔法與解碼效果已開啟':'特效已關閉，內容直接顯示')};
reduced.addEventListener('change',()=>{if(reduced.matches)resetTransitions()});
$('#preview-magic').onclick=()=>{const i=fxPreviewIndex;fxPreviewIndex=(i+1)%5;$('#preview-magic').textContent='✧ 下一段：'+['淡入淡出','左右合併','順時針描繪','多環展開','光柱升起'][fxPreviewIndex];navigateTo(i)};
function navigateTo(i){$('#main-nav').classList.remove('expanded');$('#nav-toggle').setAttribute('aria-expanded','false');const top=sections[i].getBoundingClientRect().top+scrollY;window.scrollTo({top,behavior:'instant'});history.replaceState(null,'','#'+sections[i].id);scheduleScrollCheck()}
$$('#main-nav a').forEach(a=>a.onclick=e=>{const i=sections.findIndex(s=>'#'+s.id===a.hash);if(i>=0){e.preventDefault();navigateTo(i)}});
$$('.hero-actions a,.hero-foot a').forEach(a=>a.onclick=e=>{const i=sections.findIndex(s=>'#'+s.id===a.hash);if(i>=0){e.preventDefault();navigateTo(i)}});
$('#nav-toggle').onclick=()=>{const open=$('#nav-toggle').getAttribute('aria-expanded')!=='true';$('#nav-toggle').setAttribute('aria-expanded',open);$('#main-nav').classList.toggle('expanded',open)};
// The homepage memory core: keyboard, pointer tilt, drag rotation and chapter links.
let coreRotation=0,dragOrigin=null,dragMoved=false,coreIsOpen=false;
function rotateCore(delta){coreRotation+=delta;$('#core-space').style.setProperty('--core-rotation',coreRotation+'deg')}
$('#core-rotate').onclick=()=>rotateCore(60);
const core=$('#memory-core');core.onclick=()=>{if(dragMoved){dragMoved=false;return}coreIsOpen=!coreIsOpen;core.setAttribute('aria-expanded',coreIsOpen);$('#core-chapters').hidden=!coreIsOpen;$('.core-module').classList.toggle('opened',coreIsOpen);$('#core-hint').textContent=coreIsOpen?'選一段記憶，再走一次':'點擊核心，展開四段記憶'};
core.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragOrigin={x:e.clientX,rotation:coreRotation};dragMoved=false;core.setPointerCapture(e.pointerId)});
core.addEventListener('pointermove',e=>{if(!dragOrigin||reduced.matches)return;const delta=e.clientX-dragOrigin.x;if(Math.abs(delta)>6)dragMoved=true;coreRotation=dragOrigin.rotation+delta;$('#core-space').style.setProperty('--core-rotation',coreRotation+'deg')});core.addEventListener('pointerup',()=>dragOrigin=null);core.addEventListener('pointercancel',()=>dragOrigin=null);
core.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotateCore(e.key==='ArrowLeft'?-30:30)}};
$$('[data-core-chapter]').forEach(b=>b.onclick=()=>{showChapter(Number(b.dataset.coreChapter),false);navigateTo(1)});
// Layered identity data stays independent of image navigation.
const profile=$('#profile-dialog');new MutationObserver(()=>{if(profile.open){profile.classList.remove('identity-ready');void profile.offsetWidth;profile.classList.add('identity-ready')}}).observe(profile,{attributes:true,attributeFilter:['open']});
// Real readiness: fonts, initial portrait previews, and document readiness; no fake timer.
const loader=$('#memory-loader'),enter=$('#enter-memory');let completed=0,failures=0,opening=false;
const tasks=[{name:'典藏標題字型',run:()=>document.fonts.load('400 28px "Noto Serif TC"')},{name:'介面文字字型',run:()=>document.fonts.load('400 14px "Noto Sans TC"')},{name:'首頁與圖鑑影像',run:()=>Promise.all($$('#member-grid img').slice(0,2).map(img=>{img.loading='eager';return img.decode()}))},{name:'頁面必要資源',run:()=>document.readyState==='complete'?Promise.resolve():new Promise(resolve=>addEventListener('load',resolve,{once:true}))}];
function updateLoading(name){const percent=Math.round(completed/tasks.length*100);$('#loader-fill').style.width=percent+'%';$('#loader-percent').textContent=percent+'%';$('#loader-status').textContent=name+' · '+completed+' / '+tasks.length}
async function boot(){const failSafe=setTimeout(()=>{enter.disabled=false;enter.textContent='略過等待，進入記憶';$('#loader-status').textContent='部分素材載入較慢，可先進入瀏覽。'},12000);await Promise.all(tasks.map(async task=>{try{await task.run()}catch{failures++}finally{completed++;updateLoading(task.name)}}));clearTimeout(failSafe);if(opening)return;enter.disabled=false;enter.textContent='進入雨落記憶 ↗';$('#loader-title').textContent='雨落記憶，連結完成';$('#loader-status').textContent=failures?'部分素材改以備援方式顯示，已可進入。':'必要素材已就緒。歡迎回到雨落。';}
function playMemoryPortal(){
 const canvas=$('#memory-portal');
 const context=canvas.getContext('2d');
 if(!context||reduced.matches)return Promise.resolve();

 loader.classList.add('portal-opening');
 $('#loader-status').textContent='正在進入雨落記憶';
 const duration=1740;
 const started=performance.now();
 const meteors=Array.from({length:30},(_,index)=>({
  angle:index*2.39996,
  radius:.75+(index%7)*.09,
  delay:(index%6)*.018,
  tilt:.78+(index%4)*.15,
  color:index%4===0?'175,168,255':'125,234,255'
 }));

 function project(meteor,time,span){
  const progress=Math.max(0,Math.min(1,(time-meteor.delay)/(1-meteor.delay)));
  const radius=span*meteor.radius*Math.pow(1-progress,1.23);
  const theta=meteor.angle+progress*(8.1+meteor.radius);
  const orbitY=Math.sin(theta)*radius;
  const depth=orbitY*Math.sin(meteor.tilt);
  const perspective=1/(1-depth/(span*2.5));
  const x=Math.cos(theta)*radius*perspective;
  const y=orbitY*Math.cos(meteor.tilt)*perspective;
  // Tilt the projected orbital plane so the approach crosses the whole frame.
  return {x:x*.89-y*.46,y:x*.46+y*.89,perspective};
 }

 return new Promise(resolve=>{
  function frame(now){
   if(reduced.matches){resolve();return}
   const width=canvas.clientWidth,height=canvas.clientHeight;
   const ratio=Math.min(devicePixelRatio||1,1.5);
   const pixelWidth=Math.round(width*ratio),pixelHeight=Math.round(height*ratio);
   if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){
    canvas.width=pixelWidth;
    canvas.height=pixelHeight;
   }
   const time=Math.min(1,(now-started)/duration);
   const span=Math.hypot(width,height)*.55;
   if(!span){resolve();return}
   context.setTransform(ratio,0,0,ratio,pixelWidth/2,pixelHeight/2);
   context.clearRect(-width/2,-height/2,width,height);

   const pulse=Math.max(0,(time-.78)/.22);
   const haloRadius=42+Math.min(width,height)*.24*pulse;
   const halo=context.createRadialGradient(0,0,0,0,0,haloRadius);
   halo.addColorStop(0,'rgba(203,249,255,'+(pulse*.8)+')');
   halo.addColorStop(.22,'rgba(122,199,255,'+(pulse*.33)+')');
   halo.addColorStop(1,'rgba(88,120,255,0)');
   context.fillStyle=halo;
   context.fillRect(-haloRadius,-haloRadius,haloRadius*2,haloRadius*2);

   for(const meteor of meteors){
    const alpha=Math.min(1,Math.max(0,(time-meteor.delay)*14));
    let head=project(meteor,time,span);
    for(let segment=1;segment<=10;segment++){
     const tail=project(meteor,time-segment*.011,span);
     context.beginPath();
     context.moveTo(head.x,head.y);
     context.lineTo(tail.x,tail.y);
     const trail=1-segment/11;
     context.strokeStyle='rgba('+meteor.color+','+(alpha*trail*.8)+')';
     context.lineWidth=(.8+trail*2.2)*head.perspective;
     context.lineCap='round';
     context.stroke();
     head=tail;
    }
    const tip=project(meteor,time,span);
    context.fillStyle='rgba(233,250,255,'+alpha+')';
    context.beginPath();
    context.arc(tip.x,tip.y,1.9*tip.perspective,0,Math.PI*2);
    context.fill();
   }

   if(time<1)requestAnimationFrame(frame);
   else resolve();
  }
  requestAnimationFrame(frame);
 });
}

enter.onclick=async()=>{
 if(entered||opening||enter.disabled)return;
 opening=true;
 enter.disabled=true;
 await playMemoryPortal();
 entered=true;
 root.classList.remove('js-booting');
 loader.classList.add('exiting');
 loader.inert=true;
 loader.setAttribute('aria-hidden','true');
 setTimeout(()=>loader.remove(),500);
 $('main').inert=false;
 $('header').inert=false;
 $('#music-bar').inert=false;
 $('footer').inert=false;
 $('#home-title').focus({preventScroll:true});
 scheduleScrollCheck();
 const url=new URL(location.href);
 if(url.searchParams.get('admin')==='1'){
  url.searchParams.delete('admin');
  history.replaceState(history.state,'',url);
  document.dispatchEvent(new Event('rain-admin-return'));
 }
};
$('main').inert=true;$('header').inert=true;$('#music-bar').inert=true;$('footer').inert=true;boot();updateScroll();
})();
