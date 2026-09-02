const CACHE='pcc-v7';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{
    if(!response.ok) return response;
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')){
      const text=await response.text();
      const css='<style>nav{padding-bottom:env(safe-area-inset-bottom);overflow:visible!important;display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;width:100%!important}nav button{min-width:0!important;width:100%!important;padding:9px 2px!important;font-size:10px!important;white-space:nowrap!important}body{padding-bottom:env(safe-area-inset-bottom)}</style>';
      const patched=text.replace('</head>',css+'</head>');
      response=new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
    }
    const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request)));
});
