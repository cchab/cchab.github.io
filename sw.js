const CHACHE_NAME = 'v1_cache_pwa';
var urlsToCache = [
	'./'
]
//Evento install
//Instalación del service worker y guardar en cache los recursos estaticos
self.addEventListener('install', e =>{
	e.waitUntil(
		caches.open(CHACHE_NAME)
		.then(cache =>{
			return cache.addAll(urlsToCache)
				.then(()=>{
					self.skipWaiting();
				})
				.catch(err=>{
					console.log("No se ha registrado el cache",err);
				})
		})
	)
})

//Evento activate
// Permite que la app funcione sin conexión
self.addEventListener('activate', e =>{
	const cacheWitheList = [CHACHE_NAME];

	e.waitUntil(
		caches.keys()
			.then(cacheName =>{
				return Promise.all(
					cacheName.map(cacheName =>{
						if(cacheWitheList.indexOf(cacheName)===-1){
							return caches.delete(cacheName);
						}
					})
				)
			})
			.then(()=>{
				self.clients.claim()
			})	
	)
})
//Evento fetch
self.addEventListener('fetch',e=>{
	e.respondWith(
		caches.match(e.request)
			.then(res => {
				if(res){
					return res;
				}
				return fetch(e.request);
			})
	);
})