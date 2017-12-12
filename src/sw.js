var CACHE_NAME = 'application_cache_v1';

var urlsToCache = [

];

self.addEventListener('install', function(event) {
	console.log("Service worker install event: started");
  	event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
		console.log("Service worker install event: success");
		return cache.addAll(urlsToCache);
	}));
});

self.addEventListener('activate', event => {
  	console.log('Service worker activate event: activated');
});

self.addEventListener('fetch', function(event) {
	var file = event.request;
	
	event.respondWith(caches.match(file).then(function(resp) {
		var fetchedFile = fetch(file).then(function(response) {
			console.log("Service worker fetch event: downloaded -" + file.url);
			caches.open(CACHE_NAME).then(function(cache) {
				cache.put(file, response);
			});
			return response.clone();
		}).catch(function(){
			console.log("Service worker fetch event: couldn't download -" + file.url);
		});
		return resp || fetchedFile;
	}).catch(function(e) {
		console.log("Service worker fetch event: cache error -  " + file.url);
	}));
}); 