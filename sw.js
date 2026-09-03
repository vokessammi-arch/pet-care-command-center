const CACHE='pcc-v10';
const ASSETS=['./','./index.html','./manifest.json','./enhancements.js','./enhancements.css'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{
    if(!response.ok) return response;
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')){
      const text=await response.text();
      const css='<style>nav{padding-bottom:env(safe-area-inset-bottom);overflow:hidden!important;display:flex!important;justify-content:stretch!important;width:100%!important;gap:0!important}nav button{flex:1 1 0!important;width:auto!important;min-width:0!important;padding:7px 1px!important;font-size:9px!important;white-space:nowrap!important}body{padding-bottom:env(safe-area-inset-bottom)}</style><link rel="stylesheet" href="./enhancements.css?v=3"><script src="./enhancements.js?v=3"></script>';
      const patched=text.replace('</head>',css+'</head>');
      response=new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
    }
    const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request)));
});
