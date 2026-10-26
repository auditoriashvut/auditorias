/* Auditorías HVUT — funcionamiento sin internet */
var CACHE="auditorias-hvut-v2";
var LOCAL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
var CDN=["https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
         "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(LOCAL).then(function(){return Promise.all(CDN.map(function(u){return fetch(u,{mode:"cors"}).then(function(r){return c.put(u,r);}).catch(function(){});}));});
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  var req=e.request,url=new URL(req.url);
  if(req.method!=="GET")return;
  if(url.hostname.indexOf("script.google")>=0||url.hostname.indexOf("googleusercontent")>=0)return; // sincronización: siempre en línea
  if(req.mode==="navigate"||url.pathname.endsWith("index.html")){
    e.respondWith(fetch(req).then(function(r){var cp=r.clone();caches.open(CACHE).then(function(c){c.put("index.html",cp);});return r;})
      .catch(function(){return caches.match("index.html");}));return;
  }
  e.respondWith(caches.match(req).then(function(hit){return hit||fetch(req).then(function(r){
    if(r.ok&&(url.origin===location.origin||url.hostname==="cdnjs.cloudflare.com")){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});}return r;});}));
});
