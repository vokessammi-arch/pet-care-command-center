(()=>{
  const add=()=>{
    const more=document.getElementById('more');
    if(!more || document.getElementById('tendUpdateCard')) return;
    const card=document.createElement('div');
    card.className='card';
    card.id='tendUpdateCard';
    card.innerHTML=`<div class="title"><div><b>🔄 Tend Updates</b><p class="muted" style="margin:5px 0 0">Check for the latest version of Tend.</p></div><span id="tendVersion" class="pill">v0.1</span></div><button id="tendRefreshBtn" class="primary" style="margin-top:10px;width:100%">Check for Updates</button><p id="tendUpdateStatus" class="muted" style="margin:8px 0 0;font-size:12px"></p>`;
    more.appendChild(card);
    const status=document.getElementById('tendUpdateStatus');
    const btn=document.getElementById('tendRefreshBtn');
    btn.addEventListener('click',async()=>{
      btn.disabled=true;
      btn.textContent='Checking…';
      status.textContent='Checking for the newest Tend files…';
      try{
        if('serviceWorker' in navigator){
          const reg=await navigator.serviceWorker.getRegistration();
          if(reg) await reg.update();
        }
        status.textContent='Tend is refreshed! 🌱';
        btn.textContent='Refresh Again';
        setTimeout(()=>location.replace(location.pathname+'?v='+Date.now()),500);
      }catch(e){
        status.textContent='Could not check right now. Please try again.';
        btn.disabled=false;
        btn.textContent='Check for Updates';
      }
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
})();
