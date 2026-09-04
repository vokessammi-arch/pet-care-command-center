(function(){
  const KEY='pcc-web-v6';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const petName=(d,id)=>(d.pets||[]).find(p=>p.id==id)?.name||'Animal';
  function compressDataUrl(dataUrl,maxSize=640,quality=.72){return new Promise(resolve=>{if(!dataUrl||!String(dataUrl).startsWith('data:image/'))return resolve(dataUrl);const img=new Image();img.onload=()=>{const scale=Math.min(1,maxSize/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',quality))};img.onerror=()=>resolve(dataUrl);img.src=dataUrl})}
  async function compactPhotos(d){for(const p of (d.pets||[])){if(p.photo&&String(p.photo).startsWith('data:image/'))p.photo=await compressDataUrl(p.photo)}}
  const repeatLabels={daily:'Daily',every2days:'Every 2 days',weekly:'Weekly',biweekly:'Every 2 weeks',monthly:'Monthly',quarterly:'Every 3 months'};
  function taskText(t,d){return `${esc(t.date||'No date')}${t.repeat&&t.repeat!=='none'?' · '+esc(repeatLabels[t.repeat]||t.repeat):''}${t.pet?' · '+esc(petName(d,t.pet)):''}`}
  function careCard(t,d,completed){
    return `<div class="card task"><button type="button" class="check tend-care-check" data-care-id="${t.id}" aria-label="${completed?'Mark incomplete':'Mark complete'}">${completed?'✓':''}</button><div style="flex:1" class="${completed?'done':''}"><b>${esc(t.title||'Care task')}</b><div class="muted">${taskText(t,d)}</div></div>${!completed?`<button type="button" onclick="window.careForm(${t.id})">Edit</button>`:''}</div>`;
  }
  function renderCareList(){
    const d=load(),box=document.getElementById('careList'),summary=document.getElementById('careSummary');
    if(!box)return;
    const tasks=Array.isArray(d.care)?d.care:[];
    const open=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done);
    if(summary)summary.innerHTML=`<div class="card"><b>${open.length}</b> open task(s) · <b>${done.length}</b> completed</div>`;
    const activeHtml=open.length?open.map(t=>careCard(t,d,false)).join(''):'<div class="empty">No open care tasks. 🌱</div>';
    const completedHtml=done.length?`<div class="card"><div class="title"><div><b>Completed</b><p class="muted" style="margin:4px 0 0">Finished care tasks live here.</p></div><span class="pill">${done.length}</span></div></div>${done.map(t=>careCard(t,d,true)).join('')}`:'';
    box.innerHTML=activeHtml+completedHtml;
  }
  function renderFacility(){
    const d=load(),box=document.getElementById('facilityList');
    if(!box)return;
    const lists=Array.isArray(d.checklists)?d.checklists:[];
    box.innerHTML=lists.length?lists.map(c=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><b>${esc(c.title||'Checklist')}</b></div>${(c.items||[]).map((i,idx)=>`<label><input type="checkbox" data-checklist-id="${c.id}" data-item-index="${idx}" ${i.done?'checked':''}> ${esc(i.text||'')}</label>`).join('')}</div>`).join(''):'<div class="empty">No facility checklists yet.</div>';
  }
  function install(){
    const careList=document.getElementById('careList');
    if(careList&&!careList.dataset.tendBugfix){
      careList.dataset.tendBugfix='1';
      careList.addEventListener('click',function(e){
        const btn=e.target.closest('.tend-care-check');
        if(!btn)return;
        e.preventDefault();e.stopPropagation();
        const id=btn.dataset.careId;
        if(window.tendToggleCare)window.tendToggleCare(id);
        setTimeout(renderCareList,20);
      });
    }
    if(window.refreshDashboard&&!window.tendDashboardBugfix){
      window.tendDashboardBugfix='1';
      const original=window.refreshDashboard;
      window.refreshDashboard=function(){
        original();
        document.querySelectorAll('#tendTodayCard .tend-overdue .check').forEach(b=>{b.textContent='';});
      };
      window.refreshDashboard();
    }
    window.saveFacility=async function(){
      const d=load();d.checklists=Array.isArray(d.checklists)?d.checklists:[];
      const name=document.getElementById('fname')?.value.trim();
      const raw=document.getElementById('fitems')?.value||'';
      if(!name)return alert('Give the checklist a name first.');
      const items=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(text=>({text,done:false}));
      d.checklists.push({id:Date.now(),title:name,items});
      await compactPhotos(d);
      try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){
        return alert('Tend could not save this checklist because the app has reached its local storage limit. Your checklist is safe in the form, but we need to move photo storage out of localStorage for a permanent fix.');
      }
      document.getElementById('modal')?.classList.remove('on');
      renderFacility();
    };
    if(window.tendSaveCare&&!window.tendCareSaveBugfix){
      window.tendCareSaveBugfix='1';
      const originalSaveCare=window.tendSaveCare;
      window.tendSaveCare=function(id){
        originalSaveCare(id);
        setTimeout(renderCareList,30);
      };
      window.saveCare=window.tendSaveCare;
    }
    const facilityList=document.getElementById('facilityList');
    if(facilityList&&!facilityList.dataset.tendChecklistBugfix){
      facilityList.dataset.tendChecklistBugfix='1';
      facilityList.addEventListener('change',function(e){
        const cb=e.target.closest('input[type="checkbox"][data-checklist-id]');
        if(!cb)return;
        const d=load(),c=(d.checklists||[]).find(x=>x.id==cb.dataset.checklistId),i=c?.items?.[Number(cb.dataset.itemIndex)];
        if(!i)return;
        i.done=cb.checked;
        try{localStorage.setItem(KEY,JSON.stringify(d));}catch{}
      });
    }
    renderCareList();
    renderFacility();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
