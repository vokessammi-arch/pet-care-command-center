(function(){
  const KEY='pcc-web-v6';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const todayKey=()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`};
  let cursor=new Date(new Date().getFullYear(),new Date().getMonth(),1),selected=todayKey();
  function ensure(){const d=load();if(!Array.isArray(d.events))d.events=[];if(!Array.isArray(d.expenses))d.expenses=[];save(d);return d}
  function goCalendar(){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('on'));document.getElementById('calendar')?.classList.add('on');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.s==='calendar'));window.scrollTo(0,0);renderCalendar()}
  function addUI(){
    if(!document.getElementById('tendNavStyle')){const s=document.createElement('style');s.id='tendNavStyle';s.textContent='nav#nav{width:100%;overflow:hidden}nav#nav button{flex:1 1 0;min-width:0;padding-left:2px;padding-right:2px;font-size:10px;white-space:nowrap}nav#nav button br{display:block}@media(min-width:600px){nav#nav button{font-size:11px;padding-left:5px;padding-right:5px}}';document.head.append(s)}
    if(!document.querySelector('nav [data-s="calendar"]')){const money=document.querySelector('nav [data-s="money"]');const b=document.createElement('button');b.dataset.s='calendar';b.innerHTML='📅<br>Calendar';b.onclick=goCalendar;if(money)money.after(b);else document.querySelector('nav')?.append(b)}
    if(!document.getElementById('calendar')){const main=document.querySelector('main');if(!main)return;const sec=document.createElement('section');sec.id='calendar';sec.className='screen';sec.innerHTML=`<div class="title"><h2>📅 Calendar</h2><button class="primary" id="tendAddEvent">+ Event</button></div><div class="tend-cal-head"><button id="tendPrev">‹</button><div id="tendCalTitle"></div><button id="tendNext">›</button></div><div id="tendCalGrid" class="tend-cal-grid"></div><div class="sectionHead"><h3 id="tendSelectedTitle">Events</h3><button class="link" id="tendAddEvent2">+ Add</button></div><div id="tendEventList"></div>`;main.insertBefore(sec,main.querySelector('#care'));document.getElementById('tendPrev').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);renderCalendar()};document.getElementById('tendNext').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);renderCalendar()};document.getElementById('tendAddEvent').onclick=()=>eventForm();document.getElementById('tendAddEvent2').onclick=()=>eventForm()}
  }
  function eventForm(date){const d=ensure(),dt=date||selected,modal=document.getElementById('modal'),body=document.getElementById('body');if(!modal||!body)return;body.innerHTML=`<h2>📅 Add calendar event</h2><label>Event<input id="tendEventName" placeholder="Vet appointment, farrier, feeding..."></label><div class="formgrid"><label>Date<input id="tendEventDate" type="date" value="${dt}"></label><label>Time<input id="tendEventTime" type="time"></label></div><label>Animal (optional)<select id="tendEventPet"><option value="">Household / facility</option>${(d.pets||[]).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><label>Notes<textarea id="tendEventNotes" placeholder="Details, location, reminders..."></textarea></label><button class="primary" onclick="window.tendSaveEvent()">Save event</button>`;modal.classList.add('on')}
  window.tendSaveEvent=function(){const d=ensure(),title=document.getElementById('tendEventName')?.value.trim();if(!title)return alert('Give the event a name first.');const date=document.getElementById('tendEventDate')?.value||selected;d.events.push({id:Date.now(),title,date,time:document.getElementById('tendEventTime')?.value||'',pet:document.getElementById('tendEventPet')?.value?Number(document.getElementById('tendEventPet').value):null,notes:document.getElementById('tendEventNotes')?.value||''});save(d);selected=date;const dt=new Date(date+'T12:00');cursor=new Date(dt.getFullYear(),dt.getMonth(),1);document.getElementById('modal')?.classList.remove('on');renderCalendar()};
  window.tendDeleteEvent=function(id){if(!confirm('Delete this calendar event?'))return;const d=ensure();d.events=d.events.filter(e=>e.id!==id);save(d);renderCalendar()};
  function renderCalendar(){addUI();const d=ensure(),y=cursor.getFullYear(),m=cursor.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7,total=Math.ceil((start+last.getDate())/7)*7,title=document.getElementById('tendCalTitle'),grid=document.getElementById('tendCalGrid');if(!title||!grid)return;title.textContent=cursor.toLocaleString(undefined,{month:'long',year:'numeric'});let h=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<div class="tend-cal-dow">${x}</div>`).join('');for(let i=0;i<total;i++){const day=i-start+1,dt=new Date(y,m,day),inMonth=day>=1&&day<=last.getDate(),key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`,ev=(d.events||[]).filter(e=>e.date===key).sort((a,b)=>(a.time||'').localeCompare(b.time||''));h+=`<button class="tend-cal-day ${inMonth?'':'mutedDay'} ${key===todayKey()?'today':''}" onclick="window.tendSelectDate('${key}')"><b>${dt.getDate()}</b><span>${ev.slice(0,3).map(e=>`<i>${esc(e.title)}</i>`).join('')}${ev.length>3?`<i>+${ev.length-3} more</i>`:''}</span></button>`}grid.innerHTML=h;renderEvents(d)}
  window.tendSelectDate=function(key){selected=key;const dt=new Date(key+'T12:00');cursor=new Date(dt.getFullYear(),dt.getMonth(),1);renderCalendar()};
  function renderEvents(d){const box=document.getElementById('tendEventList'),head=document.getElementById('tendSelectedTitle');if(!box||!head)return;head.textContent=new Date(selected+'T12:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});const list=(d.events||[]).filter(e=>e.date===selected).sort((a,b)=>(a.time||'').localeCompare(b.time||''));box.innerHTML=list.map(e=>`<div class="card tend-event"><div class="tend-event-time">${e.time||'All day'}</div><div style="flex:1"><b>${esc(e.title)}</b><div class="muted">${e.pet?esc((d.pets||[]).find(p=>p.id===e.pet)?.name||'Animal'):'Household / facility'}${e.notes?' · '+esc(e.notes):''}</div></div><button onclick="window.tendDeleteEvent(${e.id})">Delete</button></div>`).join('')||'<div class="empty">No events on this date. Add one with + Event. 📅</div>'}
  function fixCare(){const d=load();document.querySelectorAll('#careList .card.task .check').forEach((b,i)=>{if(d.care?.[i]){b.dataset.careId=d.care[i].id;b.setAttribute('onclick',`window.tendToggleCare(${d.care[i].id})`)}})}
  window.tendToggleCare=function(id){const d=load(),t=(d.care||[]).find(x=>x.id==id);if(!t)return;t.done=!t.done;save(d);setTimeout(fixCare,0)};

  // Money fix: use integer cents for calculations and preserve two decimal places.
  const cents=x=>{const n=Number(String(x??'').trim());return Number.isFinite(n)?Math.round(n*100):0};
  const money=n=>(Math.round(n)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  function renderMoney(){
    const d=load(),box=document.getElementById('moneyList');if(!box)return;
    const total=(d.expenses||[]).reduce((sum,e)=>sum+cents(e.amount),0);
    const list=(d.expenses||[]).slice().reverse();
    box.innerHTML=`<div class="card" style="margin-top:0"><div class="muted">Total logged expenses</div><strong style="font-size:26px">$${money(total)}</strong><div class="muted" style="margin-top:4px">${list.length} expense${list.length===1?'':'s'} recorded</div></div>`+(list.length?list.map(x=>`<div class="card"><b>${esc(x.title||'Expense')}</b><div class="muted">${esc(x.date||'')}${x.cat?' · '+esc(x.cat):''}</div><strong>$${money(cents(x.amount))}</strong></div>`).join(''):'<div class="empty">No expenses yet.</div>');
  }
  function expenseForm(){
    const modal=document.getElementById('modal'),body=document.getElementById('body');if(!modal||!body)return;
    body.innerHTML=`<h2>💰 Log expense</h2><label>Description<input id="tendExpenseTitle" placeholder="Hay, vet visit, bedding..."></label><div class="formgrid"><label>Amount<input id="tendExpenseAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label><label>Date<input id="tendExpenseDate" type="date" value="${todayKey()}"></label></div><label>Animal / category<input id="tendExpenseCat" placeholder="Optional"></label><button class="primary" onclick="window.tendSaveExpense()">Save expense</button>`;
    modal.classList.add('on');
  }
  window.tendSaveExpense=function(){
    const d=load();d.expenses=Array.isArray(d.expenses)?d.expenses:[];
    const title=document.getElementById('tendExpenseTitle')?.value.trim(),rawAmt=document.getElementById('tendExpenseAmount')?.value.trim();
    if(!title)return alert('Give the expense a description first.');
    if(rawAmt===''||!Number.isFinite(Number(rawAmt))||Number(rawAmt)<0)return alert('Enter a valid expense amount.');
    const centsValue=cents(rawAmt);
    d.expenses.push({id:Date.now(),title,amount:(centsValue/100).toFixed(2),date:document.getElementById('tendExpenseDate')?.value||todayKey(),cat:document.getElementById('tendExpenseCat')?.value.trim()||''});
    save(d);document.getElementById('modal')?.classList.remove('on');renderMoney();
  };

  function boot(){
    addUI();ensure();fixCare();renderCalendar();renderMoney();
    window.expenseForm=expenseForm;
    const care=document.getElementById('careList');if(care)new MutationObserver(()=>fixCare()).observe(care,{childList:true,subtree:true});
    const moneyBox=document.getElementById('moneyList');if(moneyBox)new MutationObserver(()=>{if(!moneyBox.dataset.tendMoneyPatched){moneyBox.dataset.tendMoneyPatched='1';renderMoney()}}).observe(moneyBox,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();