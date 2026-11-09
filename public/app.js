'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], reduced=matchMedia('(prefers-reduced-motion: reduce)');
const chapters=[{name:'初次相遇',title:'兩個公會，一個歸處。',glyph:'合',art:'meeting',caption:'TWO GUILDS. ONE HOME.',text:'合服後，原會長抱著試試運氣的心情，私訊詢問是否有意願合併。剛好，緣分讓我們遇見了彼此，兩個公會也因此合而為一。'},{name:'並肩挑戰',title:'還弱小，也一起向前。',glyph:'戰',art:'challenge',caption:'WE LEARNED. WE GREW. TOGETHER.',text:'面對各式各樣的副本，還弱小的我們持續嘗試，一點一點長大。\n那些一起挑戰、一起摸索的日子，都留在了這段旅程裡。'},{name:'平凡日常',title:'只有我們懂的日常。',glyph:'伴',art:'everyday',caption:'ORDINARY NIGHTS. EXTRAORDINARY US.',text:'沒什麼大事發生，上線就是聊聊天。\n看手術刀女王損汁男、說著要刷ㄇㄉJ卡、信仰布丁神教——這些只有我們懂的日常，就是最熟悉的公會風景。'},{name:'未完待續',title:'想念時，隨時回來。',glyph:'續',art:'afterward',caption:'THE SERVER CLOSES. OUR STORY STAYS.',text:'雨落即將落幕，我們把名字與回憶留在這裡。以後想念的時候，還能回來說一聲：好久不見。'}];
const names=['神思月','微雨','聽風','星河','暮色','月白','流螢','拾光','南風','晴空','夜航','初雪','墨染','星眠','雲深'];
let members=Array.from({length:18},(_,i)=>({id:'m'+i,kind:'member',role:i===0?'會長':i<3?'副會長':i<7?'理事':'成員',name:names[i]||'雨落夥伴 '+String(i-6).padStart(3,'0'),nickname:i===0?'—':'待留下的綽號',notes:i===0?'把名字與回憶留在這裡。\n以後想念的時候，還能回來說一聲：好久不見。':'示範資料：這裡可以留下這位夥伴的故事、口頭禪，以及想對大家說的一句話。',guild:'雨落傾城',seed:i,assets:[]}));
let guilds=['星海旅團','月光茶會','遠方來信'];
let friends=Array.from({length:9},(_,i)=>({id:'f'+i,kind:'friend',role:'公會好友',name:['晨星','晚風','星砂','小月','茶茶','眠兔','旅人','微光','歸舟'][i],nickname:'待留下的綽號',notes:'好友資料示範：記下我們相遇的契機、一起參加的活動，還有想留給彼此的一句話。',guild:guilds[Math.floor(i/3)],seed:i+23,assets:[]}));
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function avatar(p,angle=0){const h=(220+p.seed*29)%360,hair=['#b5c4e0','#bbb0d4','#d2c4ac','#858eac','#a8bac4'][p.seed%5],cloth=`hsl(${h} 32% 25%)`,edge=`hsl(${h} 42% 65%)`,back=angle===2,side=angle===1;return `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" aria-label="${esc(p.name)}角色示意${['正面','側面','背面'][angle]}"><defs><radialGradient id="a${p.id}${angle}"><stop stop-color="${edge}" stop-opacity=".22"/><stop offset="1" stop-color="${cloth}" stop-opacity="0"/></radialGradient></defs><circle cx="120" cy="140" r="110" fill="url(#a${p.id}${angle})"/><circle cx="120" cy="133" r="79" fill="none" stroke="${edge}" opacity=".17"/><path d="M45 280L66 170Q75 148 101 143H139Q165 150 174 170L195 280Z" fill="${cloth}" stroke="${edge}" stroke-opacity=".4"/><path d="M77 165L61 270 96 260 115 166M163 165L179 270 144 260 125 166" fill="#101a30"/><path d="M92 145L120 174 149 145 139 191 120 204 101 190Z" fill="${edge}" opacity=".65"/><path d="M110 125H130V154L120 164 109 153Z" fill="#d9bca9"/><path d="M82 80Q78 38 120 36Q166 36 159 89L155 133 139 147H99L80 130Z" fill="${hair}"/>${back?`<path d="M84 76Q120 40 156 76L162 151Q120 166 78 151Z" fill="${hair}"/><path d="M95 59L88 147M110 50L108 154M132 52L136 153M146 66L153 144" stroke="#293449" stroke-opacity=".2" fill="none"/>`:`<path d="M91 75Q120 60 151 76L148 115Q145 138 120 145Q96 137 92 116Z" fill="#e4c9b7"/><path d="M83 83Q79 40 119 37Q162 36 160 83L143 73 145 98 127 73 116 91 109 68 91 100Z" fill="${hair}"/><path d="M96 107L109 105M130 105L143 107" stroke="#263451" stroke-width="3" stroke-linecap="round"/><path d="M99 109L107 108M133 108L141 109" stroke="${edge}" stroke-width="3"/><path d="M115 128Q120 131 125 128" stroke="#ad7b7b" fill="none"/>`}${side?'<path d="M68 34H115V158H68Z" fill="'+cloth+'" opacity=".7"/>':''}<path d="M82 200L64 270M158 200L177 270M120 205V286" stroke="${edge}" stroke-opacity=".45"/><path d="M106 181L120 174 134 181 120 198Z" fill="#d9b990"/><path d="M116 183L120 178 124 183 120 191Z" fill="${edge}"/><path d="M80 235L92 241 80 247 68 241Z" fill="${edge}" opacity=".7"/><path d="M156 237L164 245 156 253 148 245Z" stroke="#d9b990" fill="none"/><path d="M45 280Q120 297 195 280" stroke="${edge}" stroke-opacity=".3" fill="none"/></svg>`}
function views(p){if(!p.assets.length)return [0,1,2].map(i=>({demo:i}));if(p.mode==='triptych')return p.assets.flatMap(a=>a.type==='mp4'||a.type==='gif'?[a]:[0,1,2].map(crop=>({...a,crop})));return p.assets}
function mediaHTML(p,index=0,large=false){const a=views(p)[index];if(a.demo!==undefined)return avatar(p,a.demo);if(a.type==='mp4')return `<video src="${a.url}" ${large?'autoplay loop':''} muted playsinline preload="metadata" ${a.poster?'poster="'+a.poster+'"':''} aria-label="${esc(p.name)}角色影片"></video>`;return `<img class="${a.crop!==undefined?'triptych-crop':''}" style="${a.crop!==undefined?'--crop:'+a.crop:''}" src="${large?a.url:(a.poster||a.url)}" alt="${esc(p.name)}${a.crop!==undefined?['正面','側面','背面'][a.crop]:'角色圖片'}" ${large?'':'loading="lazy"'}>`}
function card(p,i){const a=p.assets[0],label=p.mode==='triptych'?'三視圖':a?a.type.toUpperCase():'角色示意';return `<article class="person-card" style="--card-delay:${Math.min(Math.abs(i%5-2)*80,160)}ms" data-person="${p.id}" tabindex="0" role="button" aria-label="${esc(p.role+' '+p.name)}"><div class="portrait" style="--h:${220+p.seed*29%100}"><div class="card-media">${mediaHTML(p)}</div><span class="image-frame" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect class="frame-track" x="2" y="2" width="96" height="96" pathLength="100"/><rect class="frame-runner" x="2" y="2" width="96" height="96" pathLength="100"/><path class="frame-corner" d="M2 10V2H10"/><path class="frame-corner" d="M90 2H98V10"/><path class="frame-corner" d="M98 90V98H90"/><path class="frame-corner" d="M10 98H2V90"/></svg></span><span class="portrait-badge">${label}</span><span class="portrait-index">${String(i+1).padStart(3,'0')}</span>${views(p).length>1?`<button class="card-nav card-prev" data-card-dir="-1" aria-label="${esc(p.name)}上一個視角">‹</button><button class="card-nav card-next" data-card-dir="1" aria-label="${esc(p.name)}下一個視角">›</button><span class="card-view-count">1 / ${views(p).length}</span>`:''}</div><div class="person-label"><div><small>${esc(p.role)}</small><b>${esc(p.name)}</b>${p.kind==='friend'?'<small class="guild-name">'+esc(p.guild)+'</small>':''}</div><span>↗</span></div></article>`}
// A bundled, three-panel SVG demonstrates the crop interaction without external assets.
{const p=members[0];const sheet='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 300">'+[0,1,2].map(i=>`<g transform="translate(${i*240},0)">${avatar(p,i).replace('<svg ','<svg x="0" y="0" width="240" height="300" ')}</g>`).join('')+'</svg>';p.mode='triptych';p.assets=[{type:'png',url:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sheet),name:'三視圖示意.svg',size:sheet.length,width:720,height:300}];}
const demoCover=members[0].assets[0];
const defaultRecords={
 members:members.map(person=>({...person,mode:person.mode||'single',archived:false,assets:person.assets.length?[{demo:true}]:[]})),
 friends:friends.map(person=>({...person,mode:'single',archived:false})),
 guilds:guilds.map(name=>({name,disabled:false})),
 tracks:[]
};
let adminRecords;
let changeRecords;
let uploadRecordMedia;
const cloudflareAccess=document.documentElement.dataset.accessLogin==='1';
const mediaUrl=(id,draft=false)=>(draft&&cloudflareAccess?'/api/admin/media/':'/media/')+id;
function hydrateAsset(asset,draft=false){
 if(asset.demo)return demoCover;
 return {...asset,url:mediaUrl(asset.id,draft),poster:asset.posterId?mediaUrl(asset.posterId,draft):null};
}
function applyRecords(records=defaultRecords,draft=false){
 const activeGuilds=records.guilds.filter(guild=>!guild.disabled).map(guild=>guild.name);
 const hydrate=person=>({...person,assets:person.assets.map(asset=>hydrateAsset(asset,draft))});
 members=records.members.filter(person=>!person.archived).map(hydrate);
 friends=records.friends.filter(person=>!person.archived&&activeGuilds.includes(person.guild)).map(hydrate);
 guilds=activeGuilds;
 if(!guilds.includes(guildFilter))guildFilter='全部公會';
 renderMembers();
 renderGuildFilters();
 renderFriends();
 const currentId=tracks[trackIndex]?.id;
 const currentUrl=audio.getAttribute('src');
 tracks=records.tracks.map(track=>({...track,url:mediaUrl(track.id,draft)}));
 trackIndex=Math.max(0,tracks.findIndex(track=>track.id===currentId));
 if(tracks.length){
  if(currentUrl!==tracks[trackIndex].url)audio.pause();
  setTrack(trackIndex);
 }else{
  audio.pause();
  audio.removeAttribute('src');
  $('#music-name').textContent='雨落的旋律';
  $('#music-sub').textContent='尚未加入 BGM';
 }
}
let roleFilter='全部',showAll=false;function renderMembers(){const keyword=$('#member-search').value.trim().toLowerCase(),list=members.filter(p=>(roleFilter==='全部'||p.role===roleFilter)&&p.name.toLowerCase().includes(keyword));$('#member-grid').innerHTML=list.slice(0,showAll?list.length:15).map(card).join('')||'<p class="empty">找不到這位夥伴，換個名字試試。</p>';$('#member-more').hidden=list.length<=15;$('#member-more').innerHTML=showAll?'收起名冊 <span>−</span>':'展開所有雨落夥伴 <span>＋</span>';$('#member-count').textContent=`${Math.min(list.length,showAll?list.length:15)} / ${list.length} 位夥伴`;$$('#role-filters button').forEach(b=>{b.classList.toggle('active',b.textContent===roleFilter);b.setAttribute('aria-pressed',b.textContent===roleFilter)})}
['全部','會長','副會長','理事','成員'].forEach(r=>{const b=document.createElement('button');b.textContent=r;b.onclick=()=>{roleFilter=r;showAll=false;renderMembers()};$('#role-filters').append(b)});$('#member-search').oninput=()=>{showAll=false;renderMembers()};$('#member-more').onclick=()=>{showAll=!showAll;renderMembers()};renderMembers();
let guildFilter='全部公會',friendOffset=0;const mobile=matchMedia('(max-width:700px)');function friendList(){return friends.filter(p=>guildFilter==='全部公會'||p.guild===guildFilter)}function renderGuildFilters(){$('#guild-filters').innerHTML='';['全部公會',...guilds].forEach(g=>{const b=document.createElement('button');b.textContent=g;b.classList.toggle('active',g===guildFilter);b.setAttribute('aria-pressed',g===guildFilter);b.onclick=()=>{guildFilter=g;friendOffset=0;renderGuildFilters();renderFriends()};$('#guild-filters').append(b)})}function renderFriends(){const list=friendList(),n=mobile.matches?2:5,count=Math.min(n,list.length);friendOffset=list.length?((friendOffset%list.length)+list.length)%list.length:0;const visible=Array.from({length:count},(_,i)=>list[(friendOffset+i)%list.length]);$('#friend-grid').innerHTML=visible.map(card).join('')||'<p class="empty">這個公會的好友席位，等你來填。</p>';$('#friend-position').textContent=list.length?`${friendOffset+1} / ${list.length} 位好友`:'尚無好友';$('#friend-prev').disabled=$('#friend-next').disabled=list.length<=count;$('#friend-grid').classList.remove('stage-enter');void $('#friend-grid').offsetWidth;$('#friend-grid').classList.add('stage-enter')}$('#friend-prev').onclick=()=>{friendOffset--;renderFriends()};$('#friend-next').onclick=()=>{friendOffset++;renderFriends()};mobile.addEventListener('change',renderFriends);renderGuildFilters();renderFriends();
function swipe(el,prev,next){let x,y;el.addEventListener('touchstart',e=>{x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){dx>0?prev():next()}},{passive:true})}swipe($('#friend-viewport'),()=>$('#friend-prev').click(),()=>$('#friend-next').click());
let activePerson=null,mediaIndex=0;function getPerson(id){return [...members,...friends].find(p=>p.id===id)}function renderProfile(){const p=activePerson,n=views(p).length;mediaIndex=(mediaIndex+n)%n;$('#profile-image').innerHTML=mediaHTML(p,mediaIndex,true);$('#profile-role').textContent=p.role;$('#profile-name').textContent=p.name;$('#profile-nickname').textContent=p.nickname||'—';$('#profile-guild').textContent=p.guild;$('#profile-notes').textContent=p.notes||'—';$('#media-prev').hidden=$('#media-next').hidden=n<=1;$('#media-dots').innerHTML=Array.from({length:n},(_,i)=>`<button class="${i===mediaIndex?'active':''}" data-media="${i}" aria-label="查看第 ${i+1} 張圖片" aria-pressed="${i===mediaIndex}"></button>`).join('');$('#profile-media-note').textContent=p.assets.length?`${mediaIndex+1} / ${n} · ${(views(p)[mediaIndex].type||'示意').toUpperCase()} · 左右切換，首尾循環`:`${mediaIndex+1} / 3 · ${['正面','側面','背面'][mediaIndex]}示意圖 · 正式版可上傳獨立三視圖`;}
document.addEventListener('click',e=>{const c=e.target.closest('[data-person]');if(c){activePerson=getPerson(c.dataset.person);mediaIndex=Number(c.dataset.view||0);c.classList.add('selected');setTimeout(()=>c.classList.remove('selected'),1500);renderProfile();$('#profile-dialog').showModal()}const d=e.target.closest('[data-media]');if(d){mediaIndex=Number(d.dataset.media);renderProfile()}});$('#media-prev').onclick=()=>{mediaIndex--;renderProfile()};$('#media-next').onclick=()=>{mediaIndex++;renderProfile()};swipe($('.profile-media'),()=>$('#media-prev').click(),()=>$('#media-next').click());$('#profile-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft')$('#media-prev').click();if(e.key==='ArrowRight')$('#media-next').click()});$$('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>d.querySelectorAll('video').forEach(v=>v.pause()))});
function hoverMedia(e,on){const c=e.target.closest('[data-person]');if(!c)return;if(e.relatedTarget&&c.contains(e.relatedTarget))return;const p=getPerson(c.dataset.person),a=views(p)[Number(c.dataset.view||0)];if(!a||a.demo!==undefined)return;const v=c.querySelector('video'),img=c.querySelector('img');if(v){if(on)v.play().catch(()=>{});else{v.pause();v.currentTime=0}}if(img&&a.type==='gif'){img.src=on?a.url:(a.poster||a.url)}}document.addEventListener('pointerover',e=>hoverMedia(e,true));document.addEventListener('pointerout',e=>hoverMedia(e,false));document.addEventListener('focusin',e=>hoverMedia(e,true));document.addEventListener('focusout',e=>hoverMedia(e,false));
let chapterIndex=-1;
let chapterTransition;
const chapterStage=$('.chapter-stage');
const chapterArt=$('#chapter-art');
const chapterTabs=$('.chapter-tabs');
const chapterEntrances={
  meeting:{opacity:0,transform:'translateX(42px)'},
  challenge:{opacity:0,transform:'translateY(34px)'},
  everyday:{opacity:0,transform:'scale(.92)'},
  afterward:{opacity:.65,clipPath:'inset(0 100% 0 0)'}
};
chapters.forEach((chapter,index)=>{
  const button=document.createElement('button');
  button.setAttribute('role','tab');
  button.innerHTML=`<small>0${index+1}</small>${chapter.name}`;
  button.onclick=()=>showChapter(index);
  chapterTabs.append(button);
});

function setPageImage(element,fallback,cover,draft=false){
  element.src=cover?mediaUrl(cover.id,draft):fallback;
  element.classList.toggle('has-custom-crop',Boolean(cover));
  if(cover){
    element.style.setProperty('--crop-desktop',cover.desktopX+'% '+cover.desktopY+'%');
    element.style.setProperty('--crop-mobile',cover.mobileX+'% '+cover.mobileY+'%');
  }
}

function renderChapter(index){
  const chapter=chapters[index];
  setPageImage(chapterArt,'./assets/memory-'+chapter.art+'.svg',chapter.cover,chapter.draft);
  $('#chapter-title').textContent=chapter.title;
  $('#chapter-text').textContent=chapter.text;
  $('#chapter-glyph').textContent=chapter.glyph;
  $('#chapter-caption').textContent=chapter.caption;
  $('#chapter-num').textContent='CHAPTER 0'+(index+1);
  $('#chapter-index').textContent='0'+(index+1)+' / 04';
}

function showChapter(index, animate=true){
  const next=(index+chapters.length)%chapters.length;
  if(next===chapterIndex&&animate)return;
  chapterIndex=next;
  [...chapterTabs.children].forEach((button,index)=>{
    const selected=index===next;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-selected',selected);
  });

  if(!animate||reduced.matches){
    chapterTransition?.cancel();
    chapterTransition=null;
    renderChapter(next);
    return;
  }

  // Use the current visual position so repeated clicks can interrupt a transition.
  const {opacity,transform}=getComputedStyle(chapterStage);
  chapterTransition?.cancel();
  const exit=chapterStage.animate(
    [{opacity,transform},{opacity:0,transform:'translateX(-18px)'}],
    {duration:180,easing:'ease-in',fill:'forwards'}
  );
  chapterTransition=exit;
  exit.onfinish=()=>{
    if(chapterTransition!==exit)return;
    renderChapter(next);
    exit.cancel();
    const entrance=chapterEntrances[chapters[next].art];
    chapterTransition=chapterStage.animate(
      [entrance,{opacity:1,transform:'none',clipPath:'inset(0 0 0 0)'}],
      {duration:420,easing:'cubic-bezier(.2,.7,.3,1)'}
    );
  };
}
$('#chapter-prev').onclick=()=>showChapter(chapterIndex-1);
$('#chapter-next').onclick=()=>showChapter(chapterIndex+1);
showChapter(0,false);
let toastTimer;function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
// The admin studio is intentionally a preview: no credentials or server writes.
let editPerson=null,stagedAssets=[],uploadBusy=false;
const adminList=kind=>adminRecords[kind==='member'?'members':'friends'];
function adminPeople(selected){
 const kind=$('#admin-kind').value;
 $('#admin-person').innerHTML=adminList(kind).map(person=>
  `<option value="${person.id}">${esc((person.archived?'已封存 · ':'')+person.role+' · '+person.name)}</option>`
 ).join('')+'<option value="new">＋ 新增'+(kind==='member'?'成員':'好友')+'</option>';
 if(selected&&adminList(kind).some(person=>person.id===selected))$('#admin-person').value=selected;
 loadEditor();
}
function populateGuildSelect(selected){
 const options=editPerson?.kind==='member'?['雨落傾城']:adminRecords.guilds
  .filter(guild=>!guild.disabled||guild.name===selected).map(guild=>guild.name);
 $('#edit-guild').replaceChildren(...options.map(name=>new Option(name,name)));
 if(options.includes(selected))$('#edit-guild').value=selected;
}
function loadEditor(){
 const kind=$('#admin-kind').value,id=$('#admin-person').value;
 editPerson=adminList(kind).find(person=>person.id===id)??{
  id:crypto.randomUUID(),kind,role:kind==='friend'?'公會好友':'成員',name:'',nickname:'',notes:'',
  guild:kind==='member'?'雨落傾城':'',seed:Math.floor(Math.random()*90),assets:[],mode:'single',archived:false
 };
 stagedAssets=[...editPerson.assets];
 $('#edit-mode').value=editPerson.mode;
 $('#edit-role').value=editPerson.role;
 $('#edit-name').value=editPerson.name;
 $('#edit-nickname').value=editPerson.nickname;
 $('#edit-notes').value=editPerson.notes;
 populateGuildSelect(editPerson.guild);
 $('#edit-guild').disabled=kind==='member';
 $('#inline-guild').hidden=kind!=='friend';
 $('#person-archive').hidden=id==='new';
 $('#person-archive').textContent=editPerson.archived?'解除封存':'封存這筆資料';
 $('#person-upload').value='';
 $('#upload-feedback').textContent='';
 uploadQueue.length=0;
 renderQueue();
 renderUploadPreview();
}
$('#admin-kind').onchange=adminPeople;$('#admin-person').onchange=loadEditor;$$('[data-admin]').forEach(b=>b.onclick=()=>{$$('[data-admin]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-admin]').forEach(tab=>$('#admin-'+tab.dataset.admin).hidden=tab!==b)});
function renderUploadPreview(){$('#upload-preview').innerHTML=stagedAssets.map((asset,i)=>{const a=hydrateAsset(asset,true);return `<div class="upload-item">${a.type==='mp4'?`<video src="${a.url}" muted playsinline preload="metadata"></video>`:`<img src="${a.poster||a.url}" alt="素材預覽">`}<small>${i===0?'正面封面 · ':''}${a.type.toUpperCase()} · ${a.width} × ${a.height}<br>${esc(a.name)}<br>${(a.size/1024/1024).toFixed(2)} MB</small><button type="button" data-cover="${i}">設為正面封面</button><button type="button" data-remove="${i}">移除</button></div>`}).join('')}
$('#upload-preview').onclick=e=>{const cover=e.target.closest('[data-cover]'),remove=e.target.closest('[data-remove]');if(cover){const i=Number(cover.dataset.cover);stagedAssets.unshift(...stagedAssets.splice(i,1));renderUploadPreview()}if(remove){stagedAssets.splice(Number(remove.dataset.remove),1);renderUploadPreview()}};
async function detectFile(f){const bytes=new Uint8Array(await f.slice(0,32).arrayBuffer()),ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));if(ascii(0,6)==='GIF87a'||ascii(0,6)==='GIF89a')return 'gif';if(bytes[0]===137&&ascii(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)return 'png';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return 'webp';if(ascii(4,8)==='ftyp'&&['isom','iso2','mp41','mp42','avc1','M4V '].includes(ascii(8,12)))return 'mp4';if(ascii(0,3)==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224))return 'mp3';throw Error('無法辨識或不支援的檔案格式')}
function inspectMedia(f,type){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(f),el=document.createElement(type==='mp4'?'video':'img'),timeout=setTimeout(()=>fail('檔案讀取逾時或已損壞'),12000);function fail(msg){clearTimeout(timeout);URL.revokeObjectURL(url);reject(Error(msg))}el.onerror=()=>fail('檔案無法解碼，請確認內容有效');if(type==='mp4'){el.muted=true;el.preload='metadata';el.onloadedmetadata=()=>{if(!el.videoWidth||!el.videoHeight)return fail('無效影片');clearTimeout(timeout);resolve({url,type,width:el.videoWidth,height:el.videoHeight,poster:null,name:f.name,size:f.size})}}else el.onload=()=>{clearTimeout(timeout);let poster=null;if(type==='gif'){try{const c=document.createElement('canvas'),scale=Math.min(1,600/el.naturalWidth);c.width=el.naturalWidth*scale;c.height=el.naturalHeight*scale;c.getContext('2d').drawImage(el,0,0,c.width,c.height);poster=c.toDataURL('image/png')}catch{}}resolve({url,type,width:el.naturalWidth,height:el.naturalHeight,poster,name:f.name,size:f.size})};el.src=url})}
const uploadQueue=[];function renderQueue(){$('#upload-queue').innerHTML=uploadQueue.map((q,i)=>`<div class="queue-row"><span>${esc(q.file.name)}</span><b>${esc(q.status)}</b><progress max="100" value="${q.progress}"></progress>${q.error?`<small>${esc(q.error)}</small><button type="button" data-retry="${i}">重試</button>`:''}</div>`).join('')}
async function processItem(q){q.status='辨識與解碼中';q.error='';q.progress=25;renderQueue();try{if(q.file.size>25*1024*1024)throw Error('單檔上限為 25 MB');const type=await detectFile(q.file);if(type==='mp3')throw Error('請到背景音樂分頁加入 MP3');q.progress=55;renderQueue();const inspected=await inspectMedia(q.file,type);
 try{
  const {id}=await uploadRecordMedia(q.file);
  const poster=inspected.poster?await uploadRecordMedia(await fetch(inspected.poster).then(response=>response.blob())):null;
  q.asset={id,type,name:inspected.name.slice(0,255),size:inspected.size,width:inspected.width,height:inspected.height,
   ...(poster?{posterId:poster.id}:{})};
 }finally{URL.revokeObjectURL(inspected.url)}q.status='完成 · '+type.toUpperCase();q.progress=100}catch(err){q.status='失敗';q.error=err.message;q.progress=0}renderQueue()}
async function runQueue(){uploadBusy=true;$('#person-form button[type="submit"]').disabled=true;$('#admin-kind').disabled=$('#admin-person').disabled=true;let cursor=0;async function worker(){while(cursor<uploadQueue.length){const q=uploadQueue[cursor++];if(q.status==='排隊中')await processItem(q)}}await Promise.all([worker(),worker()]);stagedAssets.push(...uploadQueue.filter(q=>q.asset&&!q.applied).map(q=>{q.applied=true;return q.asset}));renderUploadPreview();$('#upload-feedback').textContent='批次處理完成：'+uploadQueue.filter(q=>q.asset).length+' 個成功；儲存成員草稿後才會保留。';uploadBusy=false;$('#person-form button[type="submit"]').disabled=false;$('#admin-kind').disabled=$('#admin-person').disabled=false}
$('#person-upload').onchange=async e=>{if(uploadBusy)return;if(!$('#edit-name').value.trim()||!$('#edit-guild').value){e.target.value='';toast('請先選擇公會並輸入成員名稱');return}const files=[...e.target.files];if(files.length>10||stagedAssets.length+files.length>30){e.target.value='';toast('每批最多 10 個，每位最多保留 30 個檔案');return}uploadQueue.length=0;files.forEach(file=>uploadQueue.push({file,status:'排隊中',progress:0}));renderQueue();await runQueue()};$('#upload-queue').onclick=async e=>{const b=e.target.closest('[data-retry]');if(!b||uploadBusy)return;const q=uploadQueue[Number(b.dataset.retry)];q.status='排隊中';await runQueue()};
$('#person-form').onsubmit=event=>{
 event.preventDefault();
 if(uploadBusy)return;
 const name=$('#edit-name').value.trim();
 const guild=$('#edit-guild').value;
 if(!name)return;
 if(!guild){toast('請先新增並選擇好友所屬公會');return}
 const person={...editPerson,name,guild,mode:$('#edit-mode').value,
  role:editPerson.kind==='friend'?'公會好友':$('#edit-role').value,
  nickname:$('#edit-nickname').value.trim(),notes:$('#edit-notes').value.trim(),assets:[...stagedAssets]};
 changeRecords(records=>{
  const list=records[person.kind==='member'?'members':'friends'];
  const index=list.findIndex(item=>item.id===person.id);
  if(index===-1)list.push(person);
  else list[index]=person;
 },'成員或好友草稿已儲存。',person.id);
};

$('#person-archive').onclick=()=>{
 if(uploadBusy||$('#admin-person').value==='new')return;
 const {id,kind,archived}=editPerson;
 changeRecords(records=>{
  records[kind==='member'?'members':'friends'].find(person=>person.id===id).archived=!archived;
 },archived?'已在草稿解除封存。':'已在草稿封存，發布後會從前台隱藏。',id);
};

function validGuildName(name,except){
 return Boolean(name)&&!['雨落傾城','全部公會'].includes(name)&&
  !adminRecords.guilds.some(guild=>guild.name===name&&guild.name!==except);
}
$('#inline-add-guild').onclick=()=>{$$('[data-admin]').find(b=>b.dataset.admin==='guilds').click();$('#new-guild-name').focus()};
$('#guild-form').onsubmit=event=>{
 event.preventDefault();
 const input=$('#new-guild-name');
 const name=input.value.trim();
 if(!validGuildName(name)){toast('請輸入不重複的公會名稱');return}
 changeRecords(records=>{records.guilds.push({name,disabled:false})},'公會已加入草稿。')
  .then(saved=>{if(saved)input.value=''});
};

function renderGuildAdmin(){
 $('#guild-list').innerHTML=adminRecords.guilds.map((guild,index)=>`<div class="guild-row">
  <input aria-label="公會名稱 ${index+1}" value="${esc(guild.name)}" maxlength="40">
  <small>${guild.disabled?'已停用':'使用中'}</small>
  <button type="button" data-rename="${index}">儲存名稱</button>
  <button type="button" data-guild-toggle="${index}">${guild.disabled?'重新啟用':'停用'}</button>
 </div>`).join('');
}
$('#guild-list').onclick=event=>{
 const button=event.target.closest('[data-rename],[data-guild-toggle]');
 if(!button)return;
 const index=Number(button.dataset.rename??button.dataset.guildToggle);
 const guild=adminRecords.guilds[index];
 if(button.hasAttribute('data-guild-toggle')){
  changeRecords(records=>{records.guilds[index].disabled=!guild.disabled},
   guild.disabled?'已在草稿重新啟用公會。':'已在草稿停用公會，發布後會隱藏相關好友。');
  return;
 }
 const name=button.parentElement.querySelector('input').value.trim();
 if(!validGuildName(name,guild.name)){toast('請輸入不重複的公會名稱');return}
 changeRecords(records=>{
  records.guilds[index].name=name;
  records.friends.filter(person=>person.guild===guild.name).forEach(person=>{person.guild=name});
 },'公會名稱已更新至草稿。');
};
let tracks=[],trackIndex=0;const audio=$('#bgm');audio.volume=.5;function setTrack(i,autoplay=false){if(!tracks.length)return;trackIndex=(i+tracks.length)%tracks.length;if(audio.getAttribute('src')!==tracks[trackIndex].url)audio.src=tracks[trackIndex].url;$('#music-name').textContent=tracks[trackIndex].name;$('#music-sub').textContent=`${trackIndex+1} / ${tracks.length} · ${tracks.length===2?'雙曲循環':'單曲循環'} `;if(autoplay)audio.play().catch(()=>toast('請按播放按鈕開始音樂'));}
$('#music-toggle').onclick=()=>{if(!tracks.length){toast('目前沒有可播放的背景音樂');return}if(!audio.src)setTrack(0);if(audio.paused)audio.play().catch(()=>toast('無法播放這個檔案'));else audio.pause()};$('#music-next').onclick=()=>{if(!tracks.length)return toast('尚未加入歌曲');setTrack(trackIndex+1,!audio.paused)};$('#music-volume').oninput=e=>audio.volume=Number(e.target.value);audio.onended=()=>setTrack(trackIndex+1,true);audio.onplay=()=>{$('#music-bar').classList.add('playing');$('#music-toggle').textContent='Ⅱ';$('#music-toggle').setAttribute('aria-label','暫停背景音樂')};audio.onpause=()=>{$('#music-bar').classList.remove('playing');$('#music-toggle').textContent='▶';$('#music-toggle').setAttribute('aria-label','播放背景音樂')};audio.onerror=()=>{if(tracks.length)toast('音訊無法播放，請重新上傳有效的 MP3')};
function renderMusicList(){
 const list=adminRecords.tracks;
 $('#music-list').innerHTML=list.length?list.map((track,index)=>`<div class="music-row">
  <span>${index+1}. ${esc(track.name)}</span><small>${(track.size/1024/1024).toFixed(2)} MB</small>
  <button type="button" data-move-track="${index}">${index===0?'下移':'上移'}</button>
  <button type="button" data-remove-track="${index}">移除</button>
 </div>`).join(''):'<p class="demo-caption">尚未加入音樂。</p>';
 $('#music-list').querySelectorAll('[data-move-track]').forEach(button=>{button.disabled=list.length<2});
}
$('#music-list').onclick=event=>{
 const button=event.target.closest('[data-move-track],[data-remove-track]');
 if(!button)return;
 const move=button.hasAttribute('data-move-track');
 changeRecords(records=>{
  if(move)records.tracks.reverse();
  else records.tracks.splice(Number(button.dataset.removeTrack),1);
 },move?'播放順序已儲存到草稿。':'歌曲已從草稿移除。');
};
$('#music-upload').onchange=async event=>{
 const files=[...event.target.files];
 event.target.value='';
 if(!files.length)return;
 if(files.length>2){toast('一次最多加入兩首歌曲');return}
 const feedback=[];
 await changeRecords(async records=>{
  for(const file of files){
   try{
    if(file.size>25*1024*1024)throw Error('單檔上限 25 MB');
    if(await detectFile(file)!=='mp3')throw Error('請選擇有效的 MP3 檔案');
    const {id}=await uploadRecordMedia(file);
    if(records.tracks.length===2){
     const [first,second]=records.tracks;
     records.tracks.splice(first.addedAt<=second.addedAt?0:1,1);
    }
    const addedAt=Math.max(Date.now(),...records.tracks.map(track=>track.addedAt+1));
    records.tracks.push({id,name:(file.name.replace(/\.mp3$/i,'').trim()||'未命名歌曲').slice(0,255),size:file.size,addedAt});
    feedback.push('已加入 '+file.name);
   }catch(error){feedback.push(file.name+'：'+error.message)}
  }
 },'音樂草稿已處理。');
 $('#music-feedback').textContent=feedback.join(' ／ ');
};
// Five distinct, viewport-centered chapter transitions.
const magicInfo=[['雨落的開始','01 / OUR HOME','fade','#c4d3ff'],['回憶正在展開','02 / OUR JOURNEY','split','#b2d9eb'],['每一個你，都在','03 / OUR PEOPLE','trace','#d9b990'],['同行，不分旗幟','04 / OUR FRIENDS','bloom','#d3bdf2'],['雨會停，故事不會','05 / UNTIL WE MEET AGAIN','ascend','#d0d9fb']];let fxEnabled=!reduced.matches,magicTimer,lastMagic=-1;function polygon(n,r,offset=0){return Array.from({length:n},(_,i)=>{const a=i*2*Math.PI/n+offset;return `${300+Math.cos(a)*r},${300+Math.sin(a)*r}`}).join(' ')}
function sigil(i){let details='';const n=[8,12,6,10,16][i];for(let j=0;j<n;j++){const a=j*360/n;details+=`<g transform="rotate(${a} 300 300)"><path d="M300 48L307 65 300 78 293 65Z"/><path d="M300 105V124M294 115H306"/></g>`}const inner=i===0?`<polygon points="${polygon(8,165,Math.PI/8)}"/><polygon points="${polygon(4,190)}"/>`:i===1?'<circle cx="300" cy="300" r="177"/><circle cx="300" cy="300" r="142" stroke-dasharray="4 12"/>':i===2?`<polygon points="${polygon(3,193,-Math.PI/2)}"/><polygon points="${polygon(3,193,Math.PI/2)}"/>`:i===3?`<polygon points="${polygon(5,180,-Math.PI/2)}"/><polygon points="${polygon(5,180,Math.PI/2)}"/>`:`<polygon points="${polygon(4,180,Math.PI/4)}"/><circle cx="300" cy="300" r="165"/><path d="M300 50V170M300 430V550M50 300H170M430 300H550"/>`;const base=`<g class="magic-ring outer-ring"><circle cx="300" cy="300" r="245"/><circle cx="300" cy="300" r="228" stroke-dasharray="2 10"/>${details}</g><g class="magic-ring magic-inner">${inner}<circle cx="300" cy="300" r="115"/></g>`;return i===1?`<defs><clipPath id="left-half"><rect width="300" height="600"/></clipPath><clipPath id="right-half"><rect x="300" width="300" height="600"/></clipPath></defs><g class="half-left" clip-path="url(#left-half)">${base}</g><g class="half-right" clip-path="url(#right-half)">${base}</g>`:base}
// Navigation and transitions are coordinated by technology.js after required media loads.
const magicSections=['story','memories','members','friends','farewell'].map(id=>$('#'+id));
let candle=false;try{candle=localStorage.getItem('rainfall-candle')==='1'}catch{}function renderCandle(){$('#light-candle').textContent=candle?'✦ 這盞燈，為雨落亮著':'✧ 為雨落留一盞燈';$('#light-candle').setAttribute('aria-pressed',candle);$('#light-status').textContent=candle?'你留下的微光，下次回來還會在。':''}renderCandle();$('#light-candle').onclick=()=>{candle=!candle;try{localStorage.setItem('rainfall-candle',candle?'1':'0')}catch{}renderCandle();if(candle&&!reduced.matches){for(let i=0;i<12;i++){const el=document.createElement('i');el.className='lantern';el.style.left=(12+i*6.5)+'%';el.style.setProperty('--wind',(i-6)*18+'px');el.style.animationDelay=(i%4)*.1+'s';$('.farewell').append(el);el.onanimationend=()=>el.remove()}}};
// Lightweight rain remains decorative and pauses when out of view or hidden.
const canvas=$('#rain'),ctx=canvas.getContext('2d');let drops=[],rainTime=0,frameId;function sizeRain(){canvas.width=canvas.clientWidth;canvas.height=canvas.clientHeight;drops=Array.from({length:mobile.matches?35:75},(_,i)=>({x:(i*197)%canvas.width,y:(i*137)%canvas.height,s:1+(i%4)*.3,l:10+i%18}))}sizeRain();addEventListener('resize',sizeRain);function drawRain(time){frameId=requestAnimationFrame(drawRain);if(reduced.matches||document.hidden||scrollY>canvas.height||time-rainTime<32)return;rainTime=time;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#becfff24';ctx.lineWidth=.7;for(const d of drops){d.y+=d.s*6;d.x-=d.s;if(d.y>canvas.height){d.y=-30;d.x=Math.random()*canvas.width}if(d.x<0)d.x=canvas.width;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-3,d.y+d.l);ctx.stroke()}}if(!reduced.matches)frameId=requestAnimationFrame(drawRain);

// Card controls stay separate from opening a portrait.
document.addEventListener('click',e=>{const nav=e.target.closest('[data-card-dir]');if(!nav)return;e.preventDefault();e.stopImmediatePropagation();const card=nav.closest('[data-person]'),p=getPerson(card.dataset.person),n=views(p).length;const i=((Number(card.dataset.view||0)+Number(nav.dataset.cardDir))%n+n)%n;card.dataset.view=i;card.querySelector('.card-media').innerHTML=mediaHTML(p,i);card.querySelector('.card-view-count').textContent=(i+1)+' / '+n},true);
document.addEventListener('keydown',e=>{const c=e.target.closest('.person-card');if(c&&e.target===c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();c.click()}});
document.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const c=e.target.closest('.person-card');if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--tilt-x',((.5-y)*9)+'deg');c.style.setProperty('--tilt-y',((x-.5)*12)+'deg');c.style.setProperty('--glow-x',x*100+'%');c.style.setProperty('--glow-y',y*100+'%')});document.addEventListener('pointerout',e=>{const c=e.target.closest('.person-card');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--tilt-x','0deg');c.style.setProperty('--tilt-y','0deg')}});
