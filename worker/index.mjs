const uploadLimit=5*1024*1024;
const imageSlots=['home','chapter-0','chapter-1','chapter-2','chapter-3'];
const assetId=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const copyLimits={
 home:[100,160,800],story:[100,1600,100,800],memories:[100,800],
 'chapter-0':[100,1600],'chapter-1':[100,1600],'chapter-2':[100,1600],'chapter-3':[100,1600],
 members:[100,800],friends:[100,800],farewell:[100,160,1600]
};
const json=(data,status=200)=>Response.json(data,{
 status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
});
const fail=(message,status)=>json({error:message},status);
const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const isOwner=(request,env)=>Boolean(
 env.GUILD_ADMIN_EMAIL&&request.headers.get('oai-authenticated-user-id')&&
 request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.GUILD_ADMIN_EMAIL.toLowerCase()
);

const personRoles=['會長','副會長','理事','成員'];
const personMedia=['jpg','png','gif','webp','mp4'];
const shortText=(value,max,required=false)=>typeof value==='string'&&value.length<=max&&(!required||Boolean(value.trim()));
const onlyKeys=(value,keys)=>Object.keys(value).every(key=>keys.includes(key));
const validId=id=>typeof id==='string'&&assetId.test(id);

function validateRecords(records){
 if(!isRecord(records)||!onlyKeys(records,['members','friends','guilds','tracks'])||
  !Array.isArray(records.guilds)||records.guilds.length>200||!Array.isArray(records.tracks)||records.tracks.length>2)return false;
 const names=new Set();
 for(const guild of records.guilds){
  if(!isRecord(guild)||!onlyKeys(guild,['name','disabled'])||!shortText(guild.name,40,true)||
   ['雨落傾城','全部公會'].includes(guild.name)||names.has(guild.name)||typeof guild.disabled!=='boolean')return false;
  names.add(guild.name);
 }
 const ids=new Set();
 for(const kind of ['member','friend']){
  const people=records[kind==='member'?'members':'friends'];
  if(!Array.isArray(people)||people.length>500)return false;
  for(const person of people){
   if(!isRecord(person)||!onlyKeys(person,['id','kind','role','name','nickname','notes','guild','seed','assets','mode','archived'])||
    typeof person.id!=='string'||!(/^[mf][0-9]+$/.test(person.id)||validId(person.id))||ids.has(person.id)||
    person.kind!==kind||!shortText(person.name,40,true)||!shortText(person.nickname,60)||!shortText(person.notes,1000)||
    !Number.isInteger(person.seed)||person.seed<0||person.seed>999||!['single','triptych'].includes(person.mode)||
    typeof person.archived!=='boolean'||!Array.isArray(person.assets)||person.assets.length>30||
    (kind==='member'?person.guild!=='雨落傾城'||!personRoles.includes(person.role):!names.has(person.guild)||person.role!=='公會好友'))return false;
   ids.add(person.id);
   for(const asset of person.assets){
    if(isRecord(asset)&&person.id==='m0'&&asset.demo===true&&onlyKeys(asset,['demo']))continue;
    if(!isRecord(asset)||!onlyKeys(asset,['id','posterId','type','name','size','width','height'])||!validId(asset.id)||
     (asset.posterId!==undefined&&!validId(asset.posterId))||!personMedia.includes(asset.type)||
     !shortText(asset.name,255,true)||![asset.size,asset.width,asset.height].every(n=>Number.isSafeInteger(n)&&n>0))return false;
   }
  }
 }
 return records.tracks.every(track=>isRecord(track)&&onlyKeys(track,['id','name','size','addedAt'])&&validId(track.id)&&
  shortText(track.name,255,true)&&Number.isSafeInteger(track.size)&&track.size>0&&Number.isSafeInteger(track.addedAt));
}

function publicSnapshot(content){
 const snapshot=JSON.parse(content);
 if(snapshot.records){
  const records=snapshot.records;
  const guilds=records.guilds.filter(guild=>!guild.disabled);
  const active=new Set(guilds.map(guild=>guild.name));
  snapshot.records={guilds,tracks:records.tracks,members:records.members.filter(person=>!person.archived),
   friends:records.friends.filter(person=>!person.archived&&active.has(person.guild))};
 }
 return snapshot;
}

function publicAsset(snapshot,id){
 if(Object.values(snapshot.images).some(image=>image.id===id))return true;
 const records=snapshot.records;
 return Boolean(records&&(records.tracks.some(track=>track.id===id)||
  [...records.members,...records.friends].some(person=>person.assets.some(asset=>asset.id===id||asset.posterId===id))));
}

function validateDraft(value){
 if(!isRecord(value)||!isRecord(value.copy)||!isRecord(value.images))return false;
 for(const [section,values] of Object.entries(value.copy)){
  const limits=Object.hasOwn(copyLimits,section)&&copyLimits[section];
  if(!limits||!Array.isArray(values)||values.length!==limits.length||
   values.some((text,index)=>typeof text!=='string'||!text.trim()||text.length>limits[index]))return false;
 }
 for(const [slot,image] of Object.entries(value.images)){
  if(!imageSlots.includes(slot)||!isRecord(image)||typeof image.id!=='string'||!assetId.test(image.id)||
   [image.desktopX,image.desktopY,image.mobileX,image.mobileY].some(n=>!Number.isInteger(n)||n<0||n>100))return false;
 }
 return value.records===undefined||validateRecords(value.records);
}

function detectImage(bytes){
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 const prefix=String.fromCharCode(...bytes.subarray(0,12));
 if(prefix.startsWith('\x89PNG\r\n\x1a\n'))return 'image/png';
 if(prefix.startsWith('RIFF')&&prefix.slice(8)==='WEBP')return 'image/webp';
 return null;
}

function detectMedia(bytes){
 const image=detectImage(bytes);
 if(image)return image;
 const prefix=String.fromCharCode(...bytes.subarray(0,32));
 if(/^GIF8[79]a/.test(prefix))return 'image/gif';
 if(prefix.slice(4,8)==='ftyp'&&['isom','iso2','mp41','mp42','avc1','M4V '].includes(prefix.slice(8,12)))return 'video/mp4';
 if(prefix.startsWith('ID3')||(bytes[0]===255&&(bytes[1]&224)===224))return 'audio/mpeg';
 return null;
}

async function uploadFile(request,env,media){
 const limit=media?25*1024*1024:uploadLimit;
 const stream=request.body?.getReader();
 if(!stream)return fail('請選擇圖片',400);
 const chunks=[];
 let size=0;
 while(true){
  const {value,done}=await stream.read();
  if(done)break;
  size+=value.byteLength;
  if(size>limit){await stream.cancel();return fail(media?'檔案上限為 25 MB':'圖片上限為 5 MB',413)}
  chunks.push(value);
 }
 const bytes=new Uint8Array(size);
 let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 const type=media?detectMedia(bytes):detectImage(bytes);
 if(!type)return fail('檔案格式不支援',415);
 const id=crypto.randomUUID();
 await env.BUCKET.put(id,bytes,{httpMetadata:{contentType:type}});
 return json({id},201);
}

async function readState(env){
 return env.DB.prepare('SELECT revision, draft, published FROM content_state WHERE id = 1').first();
}

async function admin(request,env,path){
 if(!isOwner(request,env)){
  return fail(request.headers.has('oai-authenticated-user-id')?'此帳號沒有會長權限':'請先登入會長帳號',
   request.headers.has('oai-authenticated-user-id')?403:401);
 }
 if(path==='state'&&request.method==='GET'){
  const row=await readState(env);
  const history=await env.DB.prepare('SELECT version, published_at FROM content_versions ORDER BY version DESC LIMIT 40').all();
  return json({revision:row.revision,draft:JSON.parse(row.draft),history:history.results,
   dirty:row.draft!==row.published});
 }
 if(request.method!=='POST')return fail('操作不存在',404);
 if(request.headers.get('Origin')!==new URL(request.url).origin||
  request.headers.get('X-Rain-Admin')!=='1')return fail('來源驗證失敗',403);
 if(path==='image'||path==='media')return uploadFile(request,env,path==='media');

 const contentLength=Number(request.headers.get('Content-Length'));
 if(contentLength>1500000)return fail('內容太大',413);
 let body;
 try{const text=await request.text();if(text.length>1500000)return fail('內容太大',413);body=JSON.parse(text)}catch{return fail('資料格式錯誤',400)}
 if(!isRecord(body)||!Number.isSafeInteger(body.revision))return fail('資料版本錯誤',400);
 const revision=body.revision;
 let result;
 if(path==='draft'){
  if(!validateDraft(body.draft))return fail('欄位或圖片設定不正確',400);
  result=await env.DB.prepare('UPDATE content_state SET draft = ?, revision = revision + 1 WHERE id = 1 AND revision = ?')
   .bind(JSON.stringify(body.draft),revision).run();
 }else if(path==='restore'){
  const version=Number.isSafeInteger(body.version)&&await env.DB.prepare('SELECT content FROM content_versions WHERE version = ?')
   .bind(body.version).first();
  if(!version)return fail('找不到這個版本',404);
  result=await env.DB.prepare('UPDATE content_state SET draft = ?, revision = revision + 1 WHERE id = 1 AND revision = ?')
   .bind(version.content,revision).run();
 }else if(path==='publish'){
  [,result]=await env.DB.batch([
   env.DB.prepare('INSERT INTO content_versions (version, content) SELECT revision + 1, draft FROM content_state WHERE id = 1 AND revision = ? AND published <> draft').bind(revision),
   env.DB.prepare('UPDATE content_state SET published = draft, revision = revision + 1 WHERE id = 1 AND revision = ? AND published <> draft').bind(revision)
  ]);
 }else return fail('操作不存在',404);
 if(!result.meta.changes)return fail('資料已更新或沒有可發布的變更，請重新載入草稿',409);
 return json({revision:revision+1});
}

async function serveMedia(request,env,id){
 const range=request.headers.get('Range');
 const metadata=await env.BUCKET.head(id);
 if(!metadata)return fail('找不到檔案',404);
 const {size}=metadata;
 const headers={
  'Content-Type':metadata.httpMetadata.contentType,'Cache-Control':'private, no-store',
  'X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'
 };
 let options,status=200;
 if(range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  const start=match?.[1]?Number(match[1]):Math.max(0,size-Number(match?.[2]));
  const end=match?.[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
  if(!match||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||start>end){
   return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  }
  const length=end-start+1;
  options={range:{offset:start,length}};
  headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  headers['Content-Length']=String(length);
  status=206;
 }else headers['Content-Length']=String(size);
 const object=request.method==='HEAD'?null:await env.BUCKET.get(id,options);
 if(request.method!=='HEAD'&&!object)return fail('找不到檔案',404);
 return new Response(object?.body??null,{status,headers});
}

export default {
 async fetch(request,env){
  const {pathname}=new URL(request.url);
  try{
   if(pathname.startsWith('/api/admin/'))return await admin(request,env,pathname.slice(11));
   if(request.method!=='GET'&&request.method!=='HEAD')return fail('不支援的操作',405);
   if(pathname==='/api/content'){
    const {published}=await readState(env);
    return new Response(request.method==='HEAD'?null:JSON.stringify(publicSnapshot(published)),{
     headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
    });
   }
   if(pathname.startsWith('/media/')){
    const id=pathname.slice(7);
    if(!assetId.test(id))return fail('找不到圖片',404);
    if(!isOwner(request,env)){
     const {published}=await readState(env);
     if(!publicAsset(publicSnapshot(published),id))return fail('找不到圖片',404);
    }
    return await serveMedia(request,env,id);
   }
   const asset=assets[pathname==='/'?'/index.html':pathname];
   if(!Array.isArray(asset))return fail('找不到頁面',404);
   const [type,encoded]=asset;
   return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(encoded),char=>char.charCodeAt(0)),{
    headers:{'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}
   });
  }catch(error){
   console.error(error);
   return fail('暫時無法讀取或儲存資料，請稍後再試',503);
  }
 }
};
