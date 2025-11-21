const CACHE_NAME="fin-cache-v3"
self.addEventListener("install",e=>{self.skipWaiting()})
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()})
self.addEventListener("fetch",e=>{
  const req=e.request
  const accept=req.headers.get("accept")||""
  // Bypass caching for HTML documents to avoid stale pages
  const isHTML=accept.includes("text/html")||req.destination==="document"
  if(isHTML){
    e.respondWith(fetch(req).catch(()=>caches.match(req)))
    return
  }
  e.respondWith(caches.open(CACHE_NAME).then(c=>fetch(req).then(r=>{try{const u=new URL(req.url);if(r.status===200&&req.method==="GET"&&u.origin===self.location.origin){c.put(req,r.clone())}}catch(_){}return r}).catch(()=>c.match(req))))
})
