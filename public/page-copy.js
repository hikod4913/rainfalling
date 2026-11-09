'use strict';

(() => {
  const sections=[
    {id:'home', name:'首頁', fields:[
      ['主標題','#home-title',100],
      ['副標題','#home .hero-tagline',160],
      ['封面內文','#home .cover-caption p',800]
    ]},
    {id:'story', name:'關於雨落', fields:[
      ['區塊標題','#story h2',100],
      ['區塊內文','#story .body-copy',1600],
      ['記憶核心標題','#story .field-copy h3',100],
      ['記憶核心說明','#story .field-copy p',800]
    ]},
    {id:'memories', name:'回憶篇章', fields:[
      ['區塊標題','#memories h2',100],
      ['區塊導言','#memories .section-heading p',800]
    ]},
    ...chapters.map((chapter,index)=>({
      id:'chapter-'+index,
      name:'回憶篇章／'+chapter.name,
      chapter:index,
      fields:[['篇章標題','title',100],['篇章內文','text',1600]]
    })),
    {id:'members', name:'雨落成員', fields:[
      ['區塊標題','#members h2',100],
      ['區塊導言','#members .section-heading p',800]
    ]},
    {id:'friends', name:'公會好友', fields:[
      ['區塊標題','#friends h2',100],
      ['區塊導言','#friends .section-heading p',800]
    ]},
    {id:'farewell', name:'道別頁', fields:[
      ['區塊標題','#farewell h2',100],
      ['開場文字','#farewell .stage-content > p:first-of-type',160],
      ['道別內文','#farewell .farewell-copy',1600]
    ]}
  ];

  const select=$('#copy-section');
  const fields=$('#copy-fields');

  function readText(node){
    if(node.classList.contains('decoding'))node.dispatchEvent(new Event('page-copy-edit',{bubbles:true}));
    const copy=node.cloneNode(true);
    copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
    return copy.textContent;
  }

  function applyText(node,value){
    if(value===readText(node))return;
    const emphasis=node.matches('h1,h2')?node.querySelector('span'):null;
    const suffix=emphasis?.textContent;
    const keepEmphasis=suffix&&value.endsWith(suffix);
    const lines=(keepEmphasis?value.slice(0,-suffix.length):value).split('\n');
    node.replaceChildren();
    lines.forEach((line,index)=>{
      if(index)node.append(document.createElement('br'));
      node.append(line);
    });
    if(keepEmphasis)node.append(emphasis);
    if(node.hasAttribute('aria-label'))node.setAttribute('aria-label',value);
  }

  const dialog=$('#admin-dialog');
  const gate=$('#admin-gate');
  const content=$('#admin-content');
  const status=$('#cms-status');
  const slot=$('#image-slot');
  const fileInput=$('#image-file');
  const hero=$('.cover-plate img');
  const imageSlots=[
    {id:'home',name:'首頁主圖',source:hero.getAttribute('src')},
    ...chapters.map((chapter,index)=>({id:'chapter-'+index,name:'回憶篇章／'+chapter.name,source:'./assets/memory-'+chapter.art+'.svg'}))
  ];
  const cropKeys=['desktopX','desktopY','mobileX','mobileY'];
  const cropInputs=cropKeys.map(key=>$('#'+key));
  const defaults=Object.fromEntries(sections.map(section=>[section.id,section.fields.map(([,key])=>{
    if(section.chapter!==undefined)return {text:chapters[section.chapter][key]};
    const node=$(key);
    return {text:readText(node),html:node.innerHTML};
  })]));
  let state;
  let busy=false;
  let previewUrl;

  async function request(path,method='GET',body){
    const binary=body instanceof Blob;
    const response=await fetch('/api/'+path,{
      method,cache:'no-store',
      headers:method==='POST'?{'X-Rain-Admin':'1','Content-Type':binary?'application/octet-stream':'application/json'}:{},
      body:method==='POST'?(binary?body:JSON.stringify(body)):undefined
    });
    const data=await response.json();
    if(!response.ok)throw Object.assign(new Error(data.error),{status:response.status});
    return data;
  }

  function applySnapshot(snapshot){
    for(const section of sections){
      section.fields.forEach(([,key],index)=>{
        const original=defaults[section.id][index];
        const saved=snapshot.copy[section.id]?.[index];
        if(section.chapter!==undefined){
          chapters[section.chapter][key]=saved??original.text;
          return;
        }
        const node=$(key);
        const current=readText(node);
        if(saved===undefined){
          if(current!==original.text)node.innerHTML=original.html;
          if(node.hasAttribute('aria-label'))node.setAttribute('aria-label',original.text);
        }else applyText(node,saved);
      });
    }
    setPageImage(hero,imageSlots[0].source,snapshot.images.home);
    chapters.forEach((chapter,index)=>{chapter.cover=snapshot.images['chapter-'+index]});
    renderChapter(chapterIndex);
    applyRecords(snapshot.records);
  }

  function renderFields(){
    const section=sections[Number(select.value)];
    fields.replaceChildren(...section.fields.map(([label,key,max],index)=>{
      const wrapper=document.createElement('label');
      const input=document.createElement('textarea');
      input.rows=max>160?4:2;
      input.maxLength=max;
      input.required=true;
      input.value=state?.draft.copy[section.id]?.[index]??defaults[section.id][index].text;
      wrapper.append(label,input);
      return wrapper;
    }));
  }

  function defaultCrop(id){
    return {desktopX:id==='home'?68:50,desktopY:50,mobileX:id==='home'?75:50,mobileY:50};
  }

  function updateCrop(){
    $('#crop-desktop').style.objectPosition=cropInputs[0].value+'% '+cropInputs[1].value+'%';
    $('#crop-mobile').style.objectPosition=cropInputs[2].value+'% '+cropInputs[3].value+'%';
  }

  function renderImages(){
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    previewUrl=undefined;
    fileInput.value='';
    const image=imageSlots.find(item=>item.id===slot.value);
    const saved=state?.draft.images[image.id];
    const crop=saved??defaultCrop(image.id);
    cropInputs.forEach((input,index)=>{input.value=crop[cropKeys[index]]});
    const src=saved?'/media/'+saved.id:image.source;
    for(const [id,ratio] of [['#crop-desktop',image.id==='home'?'2.4':'1'],['#crop-mobile',image.id==='home'?'1.25':'1.5']]){
      const img=$(id);
      img.src=src;
      img.parentElement.style.setProperty('--crop-ratio',ratio);
    }
    updateCrop();
  }

  async function refreshState(){
    state=await request('admin/state');
    $('#cms-publish').disabled=!state.dirty;
    status.textContent=state.dirty?'有已儲存、待發布的草稿。':'目前草稿與公開版本相同。';
    $('#cms-history').replaceChildren(...state.history.map(version=>new Option(
      version.version===0?'初始版本':'版本 '+version.version+' · '+new Date(version.published_at.replace(' ','T')+'Z').toLocaleString('zh-TW'),
      version.version
    )));
  }

  function renderRecords(selected=$('#admin-person').value){
    adminRecords=structuredClone(state.draft.records??defaultRecords);
    adminPeople(selected);
    renderGuildAdmin();
    renderMusicList();
  }

  async function perform(action){
    if(busy||uploadBusy)return false;
    busy=true;
    const controls=[...content.querySelectorAll('button:not(:disabled), #music-upload:not(:disabled), #person-upload:not(:disabled)')];
    controls.forEach(button=>{button.disabled=true});
    try{await action();return true}catch(error){
      status.textContent=error.message||'操作失敗，請稍後再試。';
      if(error.status===409){
        try{
          await refreshState();
          renderFields();
          renderImages();
          renderRecords();
          status.textContent='已重新載入最新草稿，請重新套用這次的變更。';
        }catch{status.textContent='草稿已在其他裝置變更，請重新開啟後台。'}
      }
      return false;
    }finally{
      busy=false;
      controls.forEach(button=>{button.disabled=false});
      $('#cms-publish').disabled=!state?.dirty;
    }
  }

  async function saveDraft(draft,message){
    await request('admin/draft','POST',{revision:state.revision,draft});
    await refreshState();
    status.textContent=message;
  }

  uploadRecordMedia=file=>request('admin/media','POST',file);
  changeRecords=(update,message,selected)=>perform(async()=>{
    const draft=structuredClone(state.draft);
    draft.records??=structuredClone(defaultRecords);
    await update(draft.records);
    await saveDraft(draft,message);
    renderRecords(selected);
  });

  const publicReady=request('content').then(applySnapshot).catch(()=>{});

  $('#admin-open').onclick=async()=>{
    if(uploadBusy){toast('檔案仍在處理中，請稍候');return}
    gate.hidden=false;
    content.hidden=true;
    $('#admin-sign-in').hidden=true;
    $('#admin-access-status').textContent='正在確認會長權限…';
    if(!dialog.open)dialog.showModal();
    try{
      await Promise.all([publicReady,refreshState()]);
      renderRecords();
      renderFields();
      renderImages();
      gate.hidden=true;
      content.hidden=false;
    }catch(error){
      $('#admin-access-status').textContent=error.message||'目前無法確認會長權限。';
      $('#admin-sign-in').hidden=![401,403].includes(error.status);
      $('#admin-sign-in').textContent=error.status===403?'切換到會長帳號':'使用會長帳號登入';
      $('#admin-sign-in').href=error.status===403?'/signout-with-chatgpt?return_to=%2F%3Fadmin%3D1':'/signin-with-chatgpt?return_to=%2F%3Fadmin%3D1';
    }
  };

  sections.forEach(({name},index)=>select.add(new Option(name,index)));
  select.addEventListener('change',renderFields);
  $('#copy-form').addEventListener('submit',event=>{
    event.preventDefault();
    const section=sections[Number(select.value)];
    const values=[...fields.querySelectorAll('textarea')].map(input=>input.value.trim());
    if(values.some(value=>!value)){toast('請填寫標題與內容後再儲存');return}
    perform(async()=>{
      const draft=structuredClone(state.draft);
      if(values.every((value,index)=>value===defaults[section.id][index].text))delete draft.copy[section.id];
      else draft.copy[section.id]=values;
      await saveDraft(draft,'文字草稿已儲存，可預覽或發布。');
    });
  });

  imageSlots.forEach(({id,name})=>slot.add(new Option(name,id)));
  slot.addEventListener('change',renderImages);
  cropInputs.forEach(input=>input.addEventListener('input',updateCrop));
  fileInput.addEventListener('change',async()=>{
    const file=fileInput.files[0];
    if(!file){renderImages();return}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){
      renderImages();
      status.textContent='請選擇 5 MB 以內的 JPG、PNG 或 WebP。';
      return;
    }
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    const url=URL.createObjectURL(file);
    previewUrl=url;
    const test=new Image();
    test.src=url;
    try{await test.decode()}catch{
      if(previewUrl===url){
        renderImages();
        status.textContent='圖片無法讀取，請換一個檔案。';
      }
      return;
    }
    if(previewUrl!==url)return;
    $('#crop-desktop').src=url;
    $('#crop-mobile').src=url;
  });
  $('#image-form').addEventListener('submit',event=>{
    event.preventDefault();
    const id=slot.value;
    const file=fileInput.files[0];
    const existing=state.draft.images[id];
    const crop=Object.fromEntries(cropKeys.map((key,index)=>[key,Number(cropInputs[index].value)]));
    perform(async()=>{
      if(!file&&!existing){status.textContent='請先選擇要替換的圖片。';return}
      if(file&&$('#crop-desktop').getAttribute('src')!==previewUrl){
        status.textContent='請等圖片預覽完成後再儲存。';
        return;
      }
      const asset=file?await request('admin/image','POST',file):existing;
      const draft=structuredClone(state.draft);
      draft.images[id]={id:asset.id,...crop};
      await saveDraft(draft,'圖片與裁切草稿已儲存，可預覽或發布。');
      renderImages();
    });
  });
  $('#image-reset').onclick=()=>perform(async()=>{
    const draft=structuredClone(state.draft);
    delete draft.images[slot.value];
    await saveDraft(draft,'已將原圖套用到草稿。');
    renderImages();
  });

  $('#cms-preview').onclick=()=>{
    if(busy||uploadBusy)return;
    applySnapshot(state.draft);
    dialog.close();
    toast('正在查看草稿。其他訪客仍會看到公開版本。');
  };
  $('#cms-live').onclick=()=>perform(async()=>{
    applySnapshot(await request('content'));
    dialog.close();
    toast('正在查看公開版本');
  });
  $('#cms-publish').onclick=()=>perform(async()=>{
    await request('admin/publish','POST',{revision:state.revision});
    applySnapshot(state.draft);
    await refreshState();
    status.textContent='已發布。訪客現在可以看到更新。';
  });
  $('#version-form').addEventListener('submit',event=>{
    event.preventDefault();
    const version=Number($('#cms-history').value);
    if(state.dirty&&!confirm('還原會覆蓋目前的草稿。要繼續嗎？'))return;
    perform(async()=>{
      await request('admin/restore','POST',{revision:state.revision,version});
      await refreshState();
      renderFields();
      renderImages();
      renderRecords();
      status.textContent='已將所選版本還原到草稿。';
    });
  });
})();
