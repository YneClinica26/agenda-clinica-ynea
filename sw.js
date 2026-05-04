const CACHE_NAME = "ynea-citacion-click-fix-v1";
const APP_SHELL = ["./","./index.html","./manifest.json","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./logo-ynea.png"];
self.addEventListener("install",(event)=>{self.skipWaiting();event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(APP_SHELL)));});
self.addEventListener("activate",(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE_NAME).map((key)=>caches.delete(key)))));self.clients.claim();});
self.addEventListener("fetch",(event)=>{if(event.request.method!=="GET")return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then((cached)=>cached||caches.match("./index.html"))));});
